import pytest
from app.models.schemas import OptimizationRequest, OptimizationMode
from app.pipeline.orchestrator import optimization_pipeline

@pytest.mark.asyncio
async def test_full_pipeline_balanced():
    req = OptimizationRequest(
        raw_prompt="Hello dear AI! I was wondering if you could please kindly help me write a Python script that calculates prime numbers up to N? Make sure that you handle edge cases. Thank you in advance!",
        target_model="gpt-4o",
        mode=OptimizationMode.BALANCED,
        preserve_exact_terms=["prime numbers"]
    )
    res = await optimization_pipeline.run(req)

    assert res.id
    assert res.raw_tokens > 0
    assert res.tokens["optimized"] < res.raw_tokens
    assert res.savings_percent["optimized"] >= 10.0
    assert res.savings_percent["compact"] >= 20.0
    assert res.quality.overall_score >= 75.0
    assert len(res.agent_reasoning) >= 5
    assert "prime numbers" in res.variants.optimized.lower()
