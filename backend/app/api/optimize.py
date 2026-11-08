import json
import time
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.schemas import (
    OptimizationRequest, OptimizationResponse,
    BatchOptimizationRequest, BatchOptimizationResponse
)
from app.pipeline.orchestrator import optimization_pipeline
from app.database.db import AsyncSessionLocal, OptimizationRecord
from app.tokenizers.tokenizer_service import tokenizer_service

router = APIRouter(prefix="", tags=["Optimization"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/optimize", response_model=OptimizationResponse)
async def optimize_prompt(request: OptimizationRequest, db: AsyncSession = Depends(get_db)):
    if not request.raw_prompt or not request.raw_prompt.strip():
        raise HTTPException(status_code=400, detail="raw_prompt cannot be empty")
    
    result = await optimization_pipeline.run(request)
    
    # Persist in DB
    record = OptimizationRecord(
        id=result.id,
        raw_prompt=result.raw_prompt,
        target_model=result.target_model,
        mode=result.mode.value,
        raw_tokens=result.tokens["raw"],
        optimized_tokens=result.tokens["optimized"],
        compact_tokens=result.tokens["compact"],
        detailed_tokens=result.tokens["detailed"],
        savings_percent=result.savings_percent["optimized"],
        quality_score=result.quality.overall_score,
        optimized_text=result.variants.optimized,
        compact_text=result.variants.compact,
        detailed_text=result.variants.detailed,
        full_response_json=result.model_dump_json()
    )
    db.add(record)
    await db.commit()
    
    return result

@router.post("/batch", response_model=BatchOptimizationResponse)
async def batch_optimize(batch_request: BatchOptimizationRequest, db: AsyncSession = Depends(get_db)):
    if not batch_request.items:
        raise HTTPException(status_code=400, detail="Batch request cannot be empty")
    
    t0 = time.time()
    results = []
    total_savings = 0.0

    for item in batch_request.items:
        res = await optimization_pipeline.run(item)
        results.append(res)
        total_savings += res.savings_percent.get("optimized", 0.0)

        record = OptimizationRecord(
            id=res.id,
            raw_prompt=res.raw_prompt,
            target_model=res.target_model,
            mode=res.mode.value,
            raw_tokens=res.tokens["raw"],
            optimized_tokens=res.tokens["optimized"],
            compact_tokens=res.tokens["compact"],
            detailed_tokens=res.tokens["detailed"],
            savings_percent=res.savings_percent["optimized"],
            quality_score=res.quality.overall_score,
            optimized_text=res.variants.optimized,
            compact_text=res.variants.compact,
            detailed_text=res.variants.detailed,
            full_response_json=res.model_dump_json()
        )
        db.add(record)

    await db.commit()
    avg_savings = round(total_savings / len(results), 2) if results else 0.0
    total_time = round((time.time() - t0) * 1000, 2)

    return BatchOptimizationResponse(
        total_prompts=len(batch_request.items),
        successful=len(results),
        results=results,
        average_token_savings=avg_savings,
        total_time_ms=total_time
    )

@router.post("/tokenize")
async def count_tokens(payload: dict):
    text = payload.get("text", "")
    model_id = payload.get("model", "gpt-4o")
    token_count = tokenizer_service.count_tokens(text, model_id)
    return {"model": model_id, "token_count": token_count, "char_count": len(text)}
