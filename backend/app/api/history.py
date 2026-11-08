import json
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete
from typing import List, Optional
from app.database.db import AsyncSessionLocal, OptimizationRecord

router = APIRouter(prefix="/history", tags=["History"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("")
async def get_history(limit: int = 50, favorite_only: bool = False, db: AsyncSession = Depends(get_db)):
    query = select(OptimizationRecord).order_by(desc(OptimizationRecord.created_at))
    if favorite_only:
        query = query.filter(OptimizationRecord.is_favorite == True)
    query = query.limit(limit)
    
    result = await db.execute(query)
    records = result.scalars().all()
    
    return [
        {
            "id": r.id,
            "raw_prompt": r.raw_prompt,
            "target_model": r.target_model,
            "mode": r.mode,
            "raw_tokens": r.raw_tokens,
            "optimized_tokens": r.optimized_tokens,
            "savings_percent": r.savings_percent,
            "quality_score": r.quality_score,
            "optimized_text": r.optimized_text,
            "is_favorite": r.is_favorite,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in records
    ]

@router.get("/{item_id}")
async def get_history_detail(item_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OptimizationRecord).filter(OptimizationRecord.id == item_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Item not found")
    return json.loads(record.full_response_json)

@router.post("/{item_id}/favorite")
async def toggle_favorite(item_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OptimizationRecord).filter(OptimizationRecord.id == item_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Item not found")
    record.is_favorite = not record.is_favorite
    await db.commit()
    return {"id": record.id, "is_favorite": record.is_favorite}

@router.delete("/{item_id}")
async def delete_history_item(item_id: str, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(OptimizationRecord).filter(OptimizationRecord.id == item_id))
    await db.commit()
    return {"status": "deleted", "id": item_id}
