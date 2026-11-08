import os
import sys
import json
import time
import asyncio

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.models.schemas import OptimizationRequest, OptimizationMode, BenchmarkRunResult, BenchmarkSummary
from app.pipeline.orchestrator import optimization_pipeline

async def execute_benchmarks(sample_size: int = 100):
    dataset_path = os.path.join(os.path.dirname(__file__), "dataset_100.json")
    with open(dataset_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    if sample_size and sample_size < len(dataset):
        items = dataset[:sample_size]
    else:
        items = dataset

    results = []
    total_reduction = 0.0
    total_quality = 0.0
    total_latency = 0.0
    passed_count = 0

    print(f"\n=======================================================")
    print(f"  PROMPTX BENCHMARK SUITE: Running {len(items)} Test Cases")
    print(f"=======================================================\n")

    for idx, item in enumerate(items, 1):
        req = OptimizationRequest(
            raw_prompt=item["raw_prompt"],
            target_model="gpt-4o",
            mode=OptimizationMode.BALANCED
        )
        t0 = time.time()
        res = await optimization_pipeline.run(req)
        latency_ms = round((time.time() - t0) * 1000, 2)

        reduction = res.savings_percent.get("optimized", 0.0)
        quality = res.quality.overall_score

        # Check against benchmark thresholds
        passed = (quality >= item.get("expected_quality_min", 75.0))
        if passed:
            passed_count += 1

        total_reduction += reduction
        total_quality += quality
        total_latency += latency_ms

        run_res = BenchmarkRunResult(
            item_id=item["id"],
            category=item["category"],
            raw_tokens=res.tokens["raw"],
            optimized_tokens=res.tokens["optimized"],
            reduction_percent=reduction,
            quality_score=quality,
            latency_ms=latency_ms,
            passed=passed
        )
        results.append(run_res)

        status_str = "PASS" if passed else "FAIL"
        print(f"[{idx:03d}/{len(items):03d}] {item['id']:<15} | {item['category']:<32} | {res.tokens['raw']:>3} -> {res.tokens['optimized']:>3} tok ({reduction:>5.1f}% red) | Qual: {quality:>4.1f} | {latency_ms:>5.1f}ms | {status_str}")

    pass_rate = round((passed_count / len(items)) * 100, 2) if items else 0.0
    avg_reduction = round(total_reduction / len(items), 2) if items else 0.0
    avg_quality = round(total_quality / len(items), 2) if items else 0.0
    avg_latency = round(total_latency / len(items), 2) if items else 0.0

    print(f"\n=======================================================")
    print(f"  BENCHMARK RESULTS SUMMARY:")
    print(f"  - Total Prompts Tested:   {len(items)}")
    print(f"  - Pass Rate:              {pass_rate}% ({passed_count}/{len(items)})")
    print(f"  - Avg Token Reduction:    {avg_reduction}%")
    print(f"  - Avg Quality Score:      {avg_quality}/100")
    print(f"  - Avg Pipeline Latency:   {avg_latency} ms")
    print(f"=======================================================\n")

    summary = BenchmarkSummary(
        total_prompts=len(items),
        passed_prompts=passed_count,
        pass_rate_percent=pass_rate,
        average_token_reduction_percent=avg_reduction,
        average_quality_score=avg_quality,
        average_latency_ms=avg_latency,
        results=results
    )

    results_path = os.path.join(os.path.dirname(__file__), "benchmark_results.json")
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(summary.model_dump(), f, indent=2)

    return summary

if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    asyncio.run(execute_benchmarks(count))
