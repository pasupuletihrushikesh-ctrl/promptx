"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Download,
  SplitSquareVertical,
  SlidersHorizontal,
  TrendingDown,
  Award,
  Clock,
  Sparkles,
  Zap,
  ListChecks,
  ChevronRight,
  Code
} from "lucide-react";
import { OptimizationResponse, QualityMetrics } from "@/types/promptx";

interface ResultPanelProps {
  result: OptimizationResponse | null;
  isLoading: boolean;
  onSendToABTest?: (raw: string, opt: string) => void;
}

type TabType = "optimized" | "compact" | "detailed";

export const ResultPanel: React.FC<ResultPanelProps> = ({
  result,
  isLoading,
  onSendToABTest,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("optimized");
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showQualityDetails, setShowQualityDetails] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0b0d14] text-zinc-400">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 animate-pulse">
          <Sparkles className="w-7 h-7 text-cyan-400 animate-spin" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">
          PROMPTX Pipeline Running...
        </h3>
        <p className="text-xs text-zinc-500 text-center max-w-sm">
          7 autonomous agents analyzing intent, classifying task, pruning redundancy, and synthesizing calibrated prompt variants.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0b0d14] text-zinc-500">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
          <Code className="w-7 h-7 text-zinc-600" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-1">
          No Prompt Optimized Yet
        </h3>
        <p className="text-xs text-zinc-500 text-center max-w-sm">
          Enter a prompt in the workspace and click Optimize to generate balanced, compact, and detailed variants.
        </p>
      </div>
    );
  }

  const currentText = result.variants[activeTab];
  const currentTokens = result.tokens[activeTab];
  const currentSavings = result.savings_percent[activeTab];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleExport = (format: "md" | "json" | "txt") => {
    let content = "";
    let mime = "text/plain";
    let filename = `promptx_${result.target_model}_${activeTab}.${format}`;

    if (format === "json") {
      content = JSON.stringify(result, null, 2);
      mime = "application/json";
    } else if (format === "md") {
      content = `# PROMPTX Optimized Prompt\n\n- **Target Model**: ${result.target_model}\n- **Mode**: ${result.mode}\n- **Original Tokens**: ${result.tokens.raw}\n- **Optimized Tokens**: ${currentTokens} (${currentSavings.toFixed(1)}% savings)\n- **Quality Index**: ${result.quality.overall_score}/100\n\n---\n\n${currentText}`;
      mime = "text/markdown";
    } else {
      content = currentText;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0d14] p-5 overflow-y-auto">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#121624] border border-zinc-800/90 shadow-sm">
        {/* Token Count Comparison */}
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Tokens (Raw vs Opt)</span>
            <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono">
            <span className="text-zinc-500 line-through text-xs">{result.tokens.raw}</span>
            <span className="text-zinc-400 text-xs">→</span>
            <span className="text-white text-base font-bold">{currentTokens}</span>
          </div>
        </div>

        {/* Token Savings Percentage */}
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Token Savings</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className={`text-base font-bold ${currentSavings > 0 ? "text-emerald-400" : "text-amber-400"}`}>
              {currentSavings > 0 ? `-${currentSavings.toFixed(1)}%` : `${currentSavings.toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* Quality Score */}
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Quality Index</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-white text-base font-bold">
              {result.quality.overall_score}
            </span>
            <span className="text-zinc-500 text-xs">/100</span>
          </div>
        </div>

        {/* Pipeline Latency */}
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Pipeline Latency</span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-white text-base font-bold">
              {result.total_latency_ms.toFixed(0)}
            </span>
            <span className="text-zinc-500 text-xs">ms</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar & Comparison Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-1.5 p-1 bg-[#121624] rounded-xl border border-zinc-800/80">
          <button
            onClick={() => setActiveTab("optimized")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "optimized"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Balanced Optimized
          </button>
          <button
            onClick={() => setActiveTab("compact")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "compact"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Ultra-Compact
          </button>
          <button
            onClick={() => setActiveTab("detailed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "detailed"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Detailed High-Performance
          </button>
        </div>

        {/* View Toggles & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showDiff
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                : "bg-zinc-800/60 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700/60"
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>{showDiff ? "Exit Diff" : "Side-by-Side Diff"}</span>
          </button>

          <button
            onClick={() => setShowQualityDetails(!showQualityDetails)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showQualityDetails
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-zinc-800/60 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700/60"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Metrics</span>
          </button>
        </div>
      </div>

      {/* Quality Details Drawer (8 Dimensions) */}
      {showQualityDetails && (
        <div className="mt-3 p-4 rounded-xl bg-[#121624] border border-zinc-800/80 text-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-zinc-200">
              Quality Evaluation Breakdown (8 Dimensions)
            </span>
            <span className="text-[11px] text-zinc-400">
              Evaluated by Agent 6
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Intent Preservation", val: result.quality.intent_preservation },
              { label: "Instruction Clarity", val: result.quality.instruction_clarity },
              { label: "Completeness", val: result.quality.completeness },
              { label: "Constraint Retention", val: result.quality.constraint_preservation },
              { label: "Format Accuracy", val: result.quality.output_format_accuracy },
              { label: "Ambiguity Reduction", val: result.quality.ambiguity_reduction },
              { label: "Token Efficiency", val: result.quality.token_efficiency },
              { label: "Task Performance", val: result.quality.expected_task_performance },
            ].map((dim) => (
              <div key={dim.label} className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                <div className="text-[10px] text-zinc-400">{dim.label}</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                      style={{ width: `${dim.val}%` }}
                    />
                  </div>
                  <span className="font-mono font-semibold text-zinc-200">{dim.val}%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-zinc-400 italic">
            "{result.quality.evaluation_summary}"
          </p>
        </div>
      )}

      {/* Main Content Area: Single Variant View OR Side-by-Side Diff */}
      <div className="mt-4 flex-1 flex flex-col min-h-0">
        {showDiff ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raw Prompt Box */}
            <div className="flex flex-col rounded-xl bg-[#121624] border border-zinc-800/80 p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 text-xs font-medium text-zinc-400">
                <span>Original Raw Prompt</span>
                <span className="font-mono text-zinc-500">{result.tokens.raw} tokens</span>
              </div>
              <div className="flex-1 mt-3 overflow-y-auto text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                {result.raw_prompt}
              </div>
            </div>

            {/* Optimized Variant Box */}
            <div className="flex flex-col rounded-xl bg-[#121624] border border-cyan-500/30 p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 text-xs font-medium text-cyan-300">
                <span>{activeTab.toUpperCase()} Version</span>
                <span className="font-mono text-emerald-400">{currentTokens} tokens (-{currentSavings.toFixed(1)}%)</span>
              </div>
              <div className="flex-1 mt-3 overflow-y-auto text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed">
                {currentText}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col rounded-2xl bg-[#121624] border border-zinc-800/90 p-5 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  {activeTab} Output
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {result.target_model}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">
                  {currentTokens} tokens
                </span>
              </div>
            </div>

            <div className="flex-1 mt-4 overflow-y-auto text-sm text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed selection:bg-cyan-500/30 scrollbar-thin">
              {currentText}
            </div>
          </div>
        )}
      </div>

      {/* Action Toolbar Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => handleExport("txt")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 text-xs border border-zinc-700/50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Text
          </button>
          <button
            onClick={() => handleExport("md")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 text-xs border border-zinc-700/50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Markdown
          </button>
          <button
            onClick={() => handleExport("json")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 text-xs border border-zinc-700/50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
          {onSendToABTest && (
            <button
              onClick={() => onSendToABTest(result.raw_prompt, currentText)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs border border-indigo-500/40 cursor-pointer"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" /> Send to A/B Test
            </button>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-900/30 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Prompt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
