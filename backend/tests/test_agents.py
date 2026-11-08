import pytest
from app.agents.intent_agent import IntentAgent
from app.agents.task_classifier import TaskClassifierAgent
from app.agents.strategy_engine import StrategyEngineAgent
from app.agents.token_optimizer import TokenOptimizerAgent
from app.agents.prompt_generator import PromptGeneratorAgent
from app.agents.quality_evaluator import QualityEvaluatorAgent
from app.agents.model_adapter import ModelAdapterEngine
from app.models.schemas import OptimizationMode

@pytest.mark.asyncio
async def test_intent_agent():
    agent = IntentAgent()
    prompt = "Please write a python function to compute fibonacci numbers with maximum 50 lines of code in markdown format."
    intent = await agent.analyze(prompt)
    assert "fibonacci" in intent.objective.lower()
    assert len(intent.constraints) >= 1
    assert "markdown" in intent.desired_output.lower() or "python" in str(intent.constraints).lower()

@pytest.mark.asyncio
async def test_task_classifier_agent():
    classifier = TaskClassifierAgent()
    intent_agent = IntentAgent()
    prompt = "Write an async database query using SQL to fetch users where active=true"
    intent = await intent_agent.analyze(prompt)
    classification = await classifier.classify(prompt, intent)
    assert classification.primary_category in ["Coding and software engineering", "Data analysis"]
    assert classification.confidence > 0.7

@pytest.mark.asyncio
async def test_token_optimizer_fluff_removal():
    optimizer = TokenOptimizerAgent()
    raw = "Hello! Could you please kindly assist me in order to write a function? Thank you in advance!"
    cleaned, trace = optimizer.optimize(raw, target_model="gpt-4o")
    assert trace.compressed_tokens < trace.original_tokens
    assert trace.reduction_percentage > 20.0
    assert "Hello" not in cleaned
    assert "Thank you" not in cleaned

@pytest.mark.asyncio
async def test_prompt_generator_and_evaluator():
    intent_agent = IntentAgent()
    classifier = TaskClassifierAgent()
    strategy_engine = StrategyEngineAgent()
    generator = PromptGeneratorAgent()
    evaluator = QualityEvaluatorAgent()

    raw = "Write a fast binary search algorithm in Python."
    intent = await intent_agent.analyze(raw)
    classification = await classifier.classify(raw, intent)
    strategy = await strategy_engine.select_strategy(raw, intent, classification)
    variants = await generator.generate_variants(raw, raw, intent, classification, strategy, OptimizationMode.BALANCED)

    assert variants.optimized
    assert variants.compact
    assert variants.detailed

    quality = await evaluator.evaluate(raw, variants.optimized, intent, "gpt-4o", OptimizationMode.BALANCED)
    assert quality.overall_score >= 70.0
    assert quality.passes_threshold is True

def test_model_adapter_claude_xml():
    adapter = ModelAdapterEngine()
    prompt = "**Objective**: Create a REST API.\n**Requirements**:\n- Use FastAPI\n- Include CORS\n**Output Format**: Code only"
    adapted = adapter.adapt(prompt, "claude-3-5-sonnet")
    assert "<instructions>" in adapted or "<guidelines>" in adapted or "<output_format>" in adapted
