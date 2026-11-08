import time
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from app.models.schemas import (
    OptimizationRequest, OptimizationResponse, PromptVariants,
    QualityMetrics, AgentReasoningStep, OptimizationMode
)
from app.agents.intent_agent import IntentAgent
from app.agents.task_classifier import TaskClassifierAgent
from app.agents.strategy_engine import StrategyEngineAgent
from app.agents.token_optimizer import TokenOptimizerAgent
from app.agents.prompt_generator import PromptGeneratorAgent
from app.agents.quality_evaluator import QualityEvaluatorAgent
from app.agents.model_adapter import ModelAdapterEngine
from app.providers.llm_service import LLMServiceFactory
from app.tokenizers.tokenizer_service import tokenizer_service

class OptimizationPipeline:
    def __init__(self):
        self.intent_agent = IntentAgent()
        self.classifier_agent = TaskClassifierAgent()
        self.strategy_agent = StrategyEngineAgent()
        self.token_optimizer = TokenOptimizerAgent()
        self.generator_agent = PromptGeneratorAgent()
        self.evaluator_agent = QualityEvaluatorAgent()
        self.adapter_engine = ModelAdapterEngine()

    async def run(self, request: OptimizationRequest) -> OptimizationResponse:
        start_time = time.time()
        agent_reasoning: List[AgentReasoningStep] = []
        provider = LLMServiceFactory.get_provider(request.target_model, request.api_key_override)

        # -------------------------------------------------------------
        # Agent 1: Intent Understanding
        # -------------------------------------------------------------
        t0 = time.time()
        intent = await self.intent_agent.analyze(request.raw_prompt, provider)
        agent_reasoning.append(AgentReasoningStep(
            agent_name="Agent 1: Intent Understanding Agent",
            status="completed",
            details=f"Objective: '{intent.objective}' | Desired format: '{intent.desired_output}' | Constraints detected: {len(intent.constraints)}",
            execution_time_ms=round((time.time() - t0) * 1000, 2)
        ))

        # -------------------------------------------------------------
        # Agent 2: Task Classification
        # -------------------------------------------------------------
        t0 = time.time()
        classification = await self.classifier_agent.classify(request.raw_prompt, intent, provider)
        agent_reasoning.append(AgentReasoningStep(
            agent_name="Agent 2: Task Classification Agent",
            status="completed",
            details=f"Category: '{classification.primary_category}' (Confidence: {classification.confidence * 100:.1f}%) | Recommended Strategy: {classification.recommended_strategy}",
            execution_time_ms=round((time.time() - t0) * 1000, 2)
        ))

        # -------------------------------------------------------------
        # Agent 3: Prompt Strategy Engine
        # -------------------------------------------------------------
        t0 = time.time()
        strategy = await self.strategy_agent.select_strategy(request.raw_prompt, intent, classification, provider)
        agent_reasoning.append(AgentReasoningStep(
            agent_name="Agent 3: Prompt Strategy Engine",
            status="completed",
            details=f"Selected technique: '{strategy.strategy}' | Structural schema: {strategy.structure_type} | Techniques: {', '.join(strategy.sub_techniques)}",
            execution_time_ms=round((time.time() - t0) * 1000, 2)
        ))

        # -------------------------------------------------------------
        # Agent 4: Token Optimization Engine
        # -------------------------------------------------------------
        t0 = time.time()
        cleaned_prompt, token_trace = self.token_optimizer.optimize(
            text=request.raw_prompt,
            target_model=request.target_model,
            mode=request.mode.value,
            preserve_terms=request.preserve_exact_terms,
            intent=intent
        )
        agent_reasoning.append(AgentReasoningStep(
            agent_name="Agent 4: Token Optimization Engine",
            status="completed",
            details=f"Compressed tokens from {token_trace.original_tokens} to {token_trace.compressed_tokens} ({token_trace.reduction_percentage:.1f}% reduction). Removed {len(token_trace.removed_redundancies)} conversational paddings.",
            execution_time_ms=round((time.time() - t0) * 1000, 2)
        ))

        # -------------------------------------------------------------
        # Agent 5 & 6: Generation & Quality Evaluation Loop
        # -------------------------------------------------------------
        max_iterations = 1
        if request.mode == OptimizationMode.BALANCED:
            max_iterations = 2
        elif request.mode in [OptimizationMode.DEEP, OptimizationMode.EXTREME]:
            max_iterations = 3

        iterations_run = 0
        best_variants: Optional[PromptVariants] = None
        best_quality: Optional[QualityMetrics] = None

        for iteration in range(max_iterations):
            iterations_run += 1
            t0 = time.time()
            variants = await self.generator_agent.generate_variants(
                raw_prompt=request.raw_prompt,
                cleaned_prompt=cleaned_prompt,
                intent=intent,
                classification=classification,
                strategy=strategy,
                mode=request.mode,
                custom_instructions=request.custom_instructions,
                provider=provider
            )

            # Agent 7: Model Adaptation Engine for each variant
            variants = PromptVariants(
                optimized=self.adapter_engine.adapt(variants.optimized, request.target_model),
                compact=self.adapter_engine.adapt(variants.compact, request.target_model),
                detailed=self.adapter_engine.adapt(variants.detailed, request.target_model)
            )

            agent_reasoning.append(AgentReasoningStep(
                agent_name=f"Agent 5: Prompt Generation Agent (Pass {iteration + 1})",
                status="completed",
                details=f"Synthesized Balanced, Ultra-Compact, and Detailed prompt variants adapted for {request.target_model}.",
                execution_time_ms=round((time.time() - t0) * 1000, 2)
            ))

            # Quality Evaluation (Agent 6)
            t0 = time.time()
            quality = await self.evaluator_agent.evaluate(
                raw_prompt=request.raw_prompt,
                optimized_prompt=variants.optimized,
                intent=intent,
                target_model=request.target_model,
                mode=request.mode,
                provider=provider
            )

            agent_reasoning.append(AgentReasoningStep(
                agent_name=f"Agent 6: Quality Evaluation Agent (Pass {iteration + 1})",
                status="completed",
                details=f"Evaluated quality score: {quality.overall_score}/100. Passes threshold: {quality.passes_threshold}.",
                execution_time_ms=round((time.time() - t0) * 1000, 2)
            ))

            best_variants = variants
            best_quality = quality

            # If quality passes threshold, break out of loop early
            if quality.passes_threshold:
                break

        # Calculate exact token counts and savings
        raw_token_count = tokenizer_service.count_tokens(request.raw_prompt, request.target_model)
        opt_token_count = tokenizer_service.count_tokens(best_variants.optimized, request.target_model)
        compact_token_count = tokenizer_service.count_tokens(best_variants.compact, request.target_model)
        detailed_token_count = tokenizer_service.count_tokens(best_variants.detailed, request.target_model)

        def calc_savings(orig: int, new: int) -> float:
            if orig <= 0:
                return 0.0
            return round(((orig - new) / orig) * 100, 2)

        tokens_dict = {
            "raw": raw_token_count,
            "optimized": opt_token_count,
            "compact": compact_token_count,
            "detailed": detailed_token_count
        }

        savings_dict = {
            "optimized": calc_savings(raw_token_count, opt_token_count),
            "compact": calc_savings(raw_token_count, compact_token_count),
            "detailed": calc_savings(raw_token_count, detailed_token_count)
        }

        total_latency_ms = round((time.time() - start_time) * 1000, 2)

        return OptimizationResponse(
            id=str(uuid.uuid4()),
            raw_prompt=request.raw_prompt,
            target_model=request.target_model,
            mode=request.mode,
            raw_tokens=raw_token_count,
            variants=best_variants,
            tokens=tokens_dict,
            savings_percent=savings_dict,
            intent=intent,
            classification=classification,
            strategy=strategy,
            quality=best_quality,
            agent_reasoning=agent_reasoning,
            iterations_run=iterations_run,
            total_latency_ms=total_latency_ms,
            created_at=datetime.now(timezone.utc).isoformat()
        )

optimization_pipeline = OptimizationPipeline()
