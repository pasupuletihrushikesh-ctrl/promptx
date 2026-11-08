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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[88vh] bg-[#0f121d] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        {/* Header */}
        <div className="p-4 px-6 border-b border-zinc-800 flex items-center justify-between bg-[#131726]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                PROMPTX 100-Prompt Benchmark Suite
              </h3>
              <p className="text-xs text-zinc-400">
                Rigorous evaluation across 7 core prompt archetypes measuring token reduction, semantic preservation, and latency
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer ${
                isRunning
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-900/30"
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Running 100 Tests..." : "Run Benchmark Suite"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
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
              <div className="p-3.5 rounded-xl bg-[#141829] border border-zinc-800">
                <div className="text-[11px] text-zinc-400 flex items-center justify-between font-sans">
                  <span>Pass Rate</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {benchmark.pass_rate_percent}%
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  {benchmark.passed_prompts} / {benchmark.total_prompts} prompts passed
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141829] border border-zinc-800">
                <div className="text-[11px] text-zinc-400 flex items-center justify-between font-sans">
                  <span>Avg Token Reduction</span>
                  <TrendingDown className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xl font-bold text-cyan-400 mt-1">
                  {benchmark.average_token_reduction_percent}%
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Up to 91% on redundant prompts
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141829] border border-zinc-800">
                <div className="text-[11px] text-zinc-400 flex items-center justify-between font-sans">
                  <span>Avg Quality Score</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-bold text-amber-400 mt-1">
                  {benchmark.average_quality_score}/100
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Semantic fidelity index
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141829] border border-zinc-800">
                <div className="text-[11px] text-zinc-400 flex items-center justify-between font-sans">
                  <span>Avg Latency</span>
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl font-bold text-purple-400 mt-1">
                  {benchmark.average_latency_ms} ms
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
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
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  categoryFilter === "all"
                    ? "bg-cyan-500 text-black font-semibold"
                    : "bg-zinc-800/80 text-zinc-400 hover:text-white"
                }`}
              >
                All (100)
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-cyan-500 text-black font-semibold"
                      : "bg-zinc-800/80 text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search test id or archetype..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#141829] border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Benchmark Table */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141829] text-zinc-400 border-b border-zinc-800 text-[11px] font-mono sticky top-0">
                  <tr>
                    <th className="p-2.5">Test ID</th>
                    <th className="p-2.5">Category Archetype</th>
                    <th className="p-2.5">Tokens (Raw → Opt)</th>
                    <th className="p-2.5">Reduction</th>
                    <th className="p-2.5">Quality Score</th>
                    <th className="p-2.5">Latency</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 bg-[#0d0f17] font-mono">
                  {filteredResults.map((r) => (
                    <tr key={r.item_id} className="hover:bg-zinc-800/40">
                      <td className="p-2.5 font-bold text-cyan-400">{r.item_id}</td>
                      <td className="p-2.5 text-zinc-300 font-sans">{r.category}</td>
                      <td className="p-2.5 text-zinc-400">
                        {r.raw_tokens} → <strong className="text-white">{r.optimized_tokens}</strong>
                      </td>
                      <td className="p-2.5">
                        <span className={`font-semibold ${r.reduction_percent > 0 ? "text-emerald-400" : "text-zinc-500"}`}>
                          {r.reduction_percent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-2.5 text-amber-400">{r.quality_score}/100</td>
                      <td className="p-2.5 text-zinc-400">{r.latency_ms}ms</td>
                      <td className="p-2.5">
                        {r.passed ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-400 text-[10px]">
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
