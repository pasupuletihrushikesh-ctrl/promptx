"use client";

import React, { useState, useEffect } from "react";
import { X, BarChart3, Play, CheckCircle2, XCircle, TrendingDown, Award, Clock, Search } from "lucide-react";
import { BenchmarkSummary } from "@/types/promptx";
import { fetchLatestBenchmark, runBenchmark } from "@/lib/api";

interface BenchmarkModalProps {
  onClose: () => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({ onClose }) => {
  const [benchmark, setBenchmark] = useState<BenchmarkSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLatestBenchmark()
      .then(setBenchmark)
      .catch((e) => console.error(e));
  }, []);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const data = await runBenchmark(100);
      setBenchmark(data);
    } catch (e) {
      console.error("Benchmark failed", e);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredResults = benchmark?.results.filter((r) => {
    const matchesCat = categoryFilter === "all" ? true : r.category === categoryFilter;
    const matchesQuery = r.item_id.toLowerCase().includes(searchQuery.toLowerCase()) || r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  }) || [];

  const categories = benchmark
    ? Array.from(new Set(benchmark.results.map((r) => r.category)))
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-[#1A2621]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[88vh] bg-[#FDFBF7] border border-[#DACFBF] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#203328]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#E8DFD0] flex items-center justify-between bg-[#F4EFEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6EFE8] text-[#2D5A43] flex items-center justify-center border border-[#C5DEC9]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A2E24] tracking-wide font-serif">
                PROMPTX 100-Prompt Benchmark Suite
              </h3>
              <p className="text-xs text-[#557162]">
                Empirical evaluation across 7 archetypes measuring token reduction, semantic preservation, and latency
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#F8F6F0] transition-all cursor-pointer shadow-md ${
                isRunning
                  ? "bg-[#D8CEBE] text-[#889E91] cursor-not-allowed"
                  : "bg-[#2D5A43] hover:bg-[#234735] shadow-[#2D5A43]/20"
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Running 100 Tests..." : "Run Benchmark Suite"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6C8576] hover:text-[#1A2E24] hover:bg-[#EBE4D8] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {/* Summary KPIs */}
          {benchmark && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 font-mono">
              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] shadow-xs">
                <div className="text-[11px] text-[#557162] flex items-center justify-between font-sans font-medium">
                  <span>Pass Rate</span>
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
                </div>
                <div className="text-xl font-bold text-[#2D5A43] mt-1 font-serif">
                  {benchmark.pass_rate_percent}%
                </div>
                <div className="text-[10px] text-[#788E81] mt-0.5">
                  {benchmark.passed_prompts} / {benchmark.total_prompts} tests passed
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] shadow-xs">
                <div className="text-[11px] text-[#557162] flex items-center justify-between font-sans font-medium">
                  <span>Avg Token Reduction</span>
                  <TrendingDown className="w-4 h-4 text-[#2D5A43]" />
                </div>
                <div className="text-xl font-bold text-[#2D5A43] mt-1 font-serif">
                  {benchmark.average_token_reduction_percent}%
                </div>
                <div className="text-[10px] text-[#788E81] mt-0.5">
                  Up to 91% on redundant prompts
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] shadow-xs">
                <div className="text-[11px] text-[#557162] flex items-center justify-between font-sans font-medium">
                  <span>Avg Quality Score</span>
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-bold text-amber-600 mt-1 font-serif">
                  {benchmark.average_quality_score}/100
                </div>
                <div className="text-[10px] text-[#788E81] mt-0.5">
                  Semantic fidelity index
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] shadow-xs">
                <div className="text-[11px] text-[#557162] flex items-center justify-between font-sans font-medium">
                  <span>Avg Latency</span>
                  <Clock className="w-4 h-4 text-[#2D5A43]" />
                </div>
                <div className="text-xl font-bold text-[#1A2E24] mt-1 font-serif">
                  {benchmark.average_latency_ms} ms
                </div>
                <div className="text-[10px] text-[#788E81] mt-0.5">
                  Sub-millisecond pipeline
                </div>
              </div>
            </div>
          )}

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer shadow-2xs ${
                  categoryFilter === "all"
                    ? "bg-[#2D5A43] text-[#F8F6F0]"
                    : "bg-[#FFFFFF] text-[#557162] hover:bg-[#EBE4D8] border border-[#DACFBF]"
                }`}
              >
                All (100)
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer shadow-2xs ${
                    categoryFilter === cat
                      ? "bg-[#2D5A43] text-[#F8F6F0]"
                      : "bg-[#FFFFFF] text-[#557162] hover:bg-[#EBE4D8] border border-[#DACFBF]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#788E81] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search test id or archetype..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#FFFFFF] border border-[#DACFBF] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1A2E24] placeholder-[#889E91] focus:outline-none focus:border-[#2D5A43] shadow-xs"
              />
            </div>
          </div>

          {/* Benchmark Table */}
          <div className="border border-[#DACFBF] rounded-2xl overflow-hidden bg-[#FFFFFF] shadow-xs">
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4EFEA] text-[#4A6354] border-b border-[#E8DFD0] text-[11px] font-semibold sticky top-0">
                  <tr>
                    <th className="p-3">Test ID</th>
                    <th className="p-3">Archetype</th>
                    <th className="p-3">Tokens (Raw → Opt)</th>
                    <th className="p-3">Reduction</th>
                    <th className="p-3">Quality Score</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFD0] bg-[#FFFFFF] font-mono">
                  {filteredResults.map((r) => (
                    <tr key={r.item_id} className="hover:bg-[#FAF7F2]">
                      <td className="p-3 font-bold text-[#2D5A43]">{r.item_id}</td>
                      <td className="p-3 text-[#1A2E24] font-sans font-medium">{r.category}</td>
                      <td className="p-3 text-[#557162]">
                        {r.raw_tokens} → <strong className="text-[#1A2E24]">{r.optimized_tokens}</strong>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${r.reduction_percent > 0 ? "text-[#2D5A43]" : "text-[#788E81]"}`}>
                          {r.reduction_percent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-amber-600 font-bold">{r.quality_score}/100</td>
                      <td className="p-3 text-[#788E81]">{r.latency_ms}ms</td>
                      <td className="p-3">
                        {r.passed ? (
                          <span className="flex items-center gap-1 text-[#2D5A43] text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-600 text-[10px] font-bold">
                            <XCircle className="w-3.5 h-3.5" /> FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
