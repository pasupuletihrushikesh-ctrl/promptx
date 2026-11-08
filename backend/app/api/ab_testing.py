from fastapi import APIRouter
from app.models.schemas import ABTestRequest, ABTestResult, OptimizationMode
from app.agents.intent_agent import IntentAgent
from app.agents.quality_evaluator import QualityEvaluatorAgent
from app.providers.llm_service import LLMServiceFactory
from app.tokenizers.tokenizer_service import tokenizer_service

router = APIRouter(prefix="/ab-test", tags=["A/B Testing"])

intent_agent = IntentAgent()
evaluator_agent = QualityEvaluatorAgent()

@router.post("", response_model=ABTestResult)
async def run_ab_test(request: ABTestRequest):
    provider = LLMServiceFactory.get_provider(request.target_model)
    intent = await intent_agent.analyze(request.raw_prompt, provider)

    metrics_a = await evaluator_agent.evaluate(
        raw_prompt=request.raw_prompt,
        optimized_prompt=request.prompt_a,
        intent=intent,
        target_model=request.target_model,
        mode=OptimizationMode.BALANCED,
        provider=provider
    )

    metrics_b = await evaluator_agent.evaluate(
        raw_prompt=request.raw_prompt,
        optimized_prompt=request.prompt_b,
        intent=intent,
        target_model=request.target_model,
        mode=OptimizationMode.BALANCED,
        provider=provider
    )

    tokens_a = tokenizer_service.count_tokens(request.prompt_a, request.target_model)
    tokens_b = tokenizer_service.count_tokens(request.prompt_b, request.target_model)

    if metrics_a.overall_score > metrics_b.overall_score:
        winner = "Prompt A"
    elif metrics_b.overall_score > metrics_a.overall_score:
        winner = "Prompt B"
    else:
        winner = "Prompt A" if tokens_a <= tokens_b else "Prompt B"

    score_diff = abs(metrics_a.overall_score - metrics_b.overall_score)
    analysis = (
        f"{winner} won by composite evaluation (Score A: {metrics_a.overall_score} vs Score B: {metrics_b.overall_score}). "
        f"Token footprint: Prompt A uses {tokens_a} tokens, Prompt B uses {tokens_b} tokens. "
        f"Score difference is {score_diff:.1f} points with superior constraint and clarity alignment."
    )

    # Simulated model response preview
    sim_a = f"[Simulated execution with Prompt A]: High clarity response matching objective '{intent.objective[:50]}...' with zero conversational preamble."
    sim_b = f"[Simulated execution with Prompt B]: Standard response matching objective '{intent.objective[:50]}...' with balanced detail."

    return ABTestResult(
        winner=winner,
        score_a=metrics_a.overall_score,
        score_b=metrics_b.overall_score,
        metrics_a=metrics_a,
        metrics_b=metrics_b,
        comparison_analysis=analysis,
        simulated_output_a=sim_a,
        simulated_output_b=sim_b
    )
