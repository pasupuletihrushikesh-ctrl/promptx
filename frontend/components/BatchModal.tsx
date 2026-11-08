"use client";

import React, { useState } from "react";
import { X, Layers, Play, CheckCircle2, TrendingDown, Clock, Download } from "lucide-react";
import { batchOptimize } from "@/lib/api";
import { OptimizationResponse } from "@/types/promptx";

interface BatchModalProps {
  onClose: () => void;
  targetModel: string;
}

export const BatchModal: React.FC<BatchModalProps> = ({ onClose, targetModel }) => {
  const [inputText, setInputText] = useState(
    "Hello AI, please write a python script to calculate fibonacci numbers.\nCan you please explain how docker containers work in simple terms?\nWrite an async rate limiter in Go with token bucket algorithm."
  );
  const [isRunning, setIsRunning] = useState(false);
  const [batchResults, setBatchResults] = useState<{
    total_prompts: number;
    successful: number;
    results: OptimizationResponse[];
    average_token_savings: number;
    total_time_ms: number;
  } | null>(null);

  const handleRunBatch = async () => {
    const lines = inputText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 5);

    if (lines.length === 0) return;

    setIsRunning(true);
    try {
      const data = await batchOptimize(lines, targetModel);
      setBatchResults(data);
    } catch (e) {
      console.error("Batch run failed", e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportCSV = () => {
    if (!batchResults) return;
    const rows = [
      ["ID", "Raw Tokens", "Optimized Tokens", "Savings %", "Quality Score", "Raw Prompt", "Optimized Prompt"],
      ...batchResults.results.map((r) => [
        r.id,
        r.tokens.raw,
        r.tokens.optimized,
        r.savings_percent.optimized.toFixed(1),
        r.quality.overall_score,
        `"${r.raw_prompt.replace(/"/g, '""')}"`,
        `"${r.variants.optimized.replace(/"/g, '""')}"`,
      ]),
    ];
    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptx_batch_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#0f121d] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        {/* Header */}
        <div className="p-4 px-6 border-b border-zinc-800 flex items-center justify-between bg-[#131726]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Batch Prompt Optimization Engine
              </h3>
              <p className="text-xs text-zinc-400">
                Process multiple prompts concurrently with aggregated token compression metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Input Prompts (One prompt per line)
            </label>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste multiple prompts separated by line breaks..."
              className="w-full bg-[#141829] border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">
              Target Model: <strong className="text-cyan-400">{targetModel}</strong>
            </span>
            <button
              onClick={handleRunBatch}
              disabled={isRunning || !inputText.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs text-white transition-all cursor-pointer ${
                isRunning
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-900/30"
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Processing Batch..." : "Run Batch Optimization"}</span>
            </button>
          </div>

          {/* Results Table */}
          {batchResults && (
            <div className="space-y-4 pt-3 border-t border-zinc-800">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400">Total Prompts</div>
                  <div className="text-base font-bold text-white mt-1">
                    {batchResults.total_prompts}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400">Successful</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    {batchResults.successful}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400">Avg Token Savings</div>
                  <div className="text-base font-bold text-cyan-400 mt-1">
                    -{batchResults.average_token_savings}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400">Total Time</div>
                  <div className="text-base font-bold text-purple-400 mt-1">
                    {batchResults.total_time_ms}ms
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141829] text-zinc-400 border-b border-zinc-800 text-[11px] font-mono sticky top-0">
                      <tr>
                        <th className="p-2.5">Original Prompt</th>
                        <th className="p-2.5">Tokens (Raw → Opt)</th>
                        <th className="p-2.5">Savings</th>
                        <th className="p-2.5">Quality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-[#0d0f17]">
                      {batchResults.results.map((r) => (
                        <tr key={r.id} className="hover:bg-zinc-800/40">
                          <td className="p-2.5 max-w-xs truncate text-zinc-300">
                            {r.raw_prompt}
                          </td>
                          <td className="p-2.5 font-mono text-zinc-400">
                            {r.tokens.raw} → <strong className="text-white">{r.tokens.optimized}</strong>
                          </td>
                          <td className="p-2.5 font-mono text-emerald-400 font-semibold">
                            -{r.savings_percent.optimized.toFixed(1)}%
                          </td>
                          <td className="p-2.5 font-mono text-amber-400">
                            {r.quality.overall_score}/100
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Results to CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
