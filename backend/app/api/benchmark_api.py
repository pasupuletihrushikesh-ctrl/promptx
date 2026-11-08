import os
import json
from fastapi import APIRouter
from app.models.schemas import BenchmarkSummary
from benchmarks.run_benchmark import execute_benchmarks

router = APIRouter(prefix="/benchmark", tags=["Benchmark"])

@router.get("/dataset")
async def get_benchmark_dataset():
    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "benchmarks", "dataset_100.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@router.get("/latest", response_model=BenchmarkSummary)
async def get_latest_benchmark():
    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "benchmarks", "benchmark_results.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return BenchmarkSummary(**data)
    # If not yet run, execute a fast run of the benchmark suite
    return await execute_benchmarks(sample_size=100)

@router.post("/run", response_model=BenchmarkSummary)
async def run_benchmark(sample_size: int = 100):
    return await execute_benchmarks(sample_size=sample_size)
