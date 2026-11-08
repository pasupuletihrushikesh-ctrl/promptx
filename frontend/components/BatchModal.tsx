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
    <div className="fixed inset-0 z-50 bg-[#1A2621]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#FDFBF7] border border-[#DACFBF] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#203328]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#E8DFD0] flex items-center justify-between bg-[#F4EFEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6EFE8] text-[#2D5A43] flex items-center justify-center border border-[#C5DEC9]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A2E24] tracking-wide font-serif">
                Batch Prompt Optimization Engine
              </h3>
              <p className="text-xs text-[#557162]">
                Process multiple prompts concurrently with aggregated token compression metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6C8576] hover:text-[#1A2E24] hover:bg-[#EBE4D8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          <div>
            <label className="block text-xs font-semibold text-[#2D5A43] mb-1.5">
              Input Prompts (One prompt per line)
            </label>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste multiple prompts separated by line breaks..."
              className="w-full bg-[#FFFFFF] border border-[#DACFBF] rounded-2xl p-4 text-xs text-[#1A2E24] placeholder-[#889E91] focus:outline-none focus:border-[#2D5A43] font-mono leading-relaxed shadow-xs"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#557162] font-mono">
              Target Model: <strong className="text-[#2D5A43]">{targetModel}</strong>
            </span>
            <button
              onClick={handleRunBatch}
              disabled={isRunning || !inputText.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-[#F8F6F0] transition-all cursor-pointer shadow-md ${
                isRunning
                  ? "bg-[#D8CEBE] text-[#889E91] cursor-not-allowed"
                  : "bg-[#2D5A43] hover:bg-[#234735] shadow-[#2D5A43]/20"
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Processing Batch..." : "Run Batch Optimization"}</span>
            </button>
          </div>

          {/* Results Table */}
          {batchResults && (
            <div className="space-y-4 pt-3 border-t border-[#E8DFD0]">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] text-center shadow-xs">
                  <div className="text-[10px] text-[#557162]">Total Prompts</div>
                  <div className="text-base font-bold text-[#1A2E24] mt-1">
                    {batchResults.total_prompts}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] text-center shadow-xs">
                  <div className="text-[10px] text-[#557162]">Successful</div>
                  <div className="text-base font-bold text-[#2D5A43] mt-1">
                    {batchResults.successful}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] text-center shadow-xs">
                  <div className="text-[10px] text-[#557162]">Avg Token Savings</div>
                  <div className="text-base font-bold text-[#2D5A43] mt-1">
                    -{batchResults.average_token_savings}%
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] text-center shadow-xs">
                  <div className="text-[10px] text-[#557162]">Total Time</div>
                  <div className="text-base font-bold text-[#1A2E24] mt-1">
                    {batchResults.total_time_ms}ms
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="border border-[#DACFBF] rounded-2xl overflow-hidden bg-[#FFFFFF] shadow-xs">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4EFEA] text-[#4A6354] border-b border-[#E8DFD0] text-[11px] font-semibold sticky top-0">
                      <tr>
                        <th className="p-3">Original Prompt</th>
                        <th className="p-3">Tokens (Raw → Opt)</th>
                        <th className="p-3">Savings</th>
                        <th className="p-3">Quality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFD0] bg-[#FFFFFF]">
                      {batchResults.results.map((r) => (
                        <tr key={r.id} className="hover:bg-[#FAF7F2]">
                          <td className="p-3 max-w-xs truncate text-[#1A2E24] font-medium">
                            {r.raw_prompt}
                          </td>
                          <td className="p-3 font-mono text-[#557162]">
                            {r.tokens.raw} → <strong className="text-[#1A2E24]">{r.tokens.optimized}</strong>
                          </td>
                          <td className="p-3 font-mono text-[#2D5A43] font-bold">
                            -{r.savings_percent.optimized.toFixed(1)}%
                          </td>
                          <td className="p-3 font-mono text-amber-600 font-bold">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3EDE3] text-[#2D5A43] text-xs font-semibold border border-[#DACFBF] cursor-pointer shadow-2xs"
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
