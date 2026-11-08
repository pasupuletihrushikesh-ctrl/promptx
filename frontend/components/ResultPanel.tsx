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
  Code,
  Play,
  RotateCcw
} from "lucide-react";
import { OptimizationResponse } from "@/types/promptx";

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
  const [simulating, setSimulating] = useState(false);
  const [simulatedOutput, setSimulatedOutput] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F8F5F0] text-[#557162]">
        <div className="w-16 h-16 rounded-2xl bg-[#E6EFE8] border border-[#C5DEC9] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Sparkles className="w-8 h-8 text-[#2D5A43] animate-spin" />
        </div>
        <h3 className="text-sm font-bold text-[#1A2E24] mb-1 font-serif">
          PROMPTX 7-Agent Pipeline Running...
        </h3>
        <p className="text-xs text-[#557162] text-center max-w-sm leading-relaxed">
          Autonomous agents decomposing intent, pruning conversational fluff, and generating model-calibrated variants.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F8F5F0] text-[#788E81]">
        <div className="w-16 h-16 rounded-2xl bg-[#EFE9DF] border border-[#D8CEBE] flex items-center justify-center mb-4 shadow-2xs">
          <Code className="w-8 h-8 text-[#557162]" />
        </div>
        <h3 className="text-sm font-semibold text-[#1A2E24] mb-1 font-serif">
          No Optimized Prompt Yet
        </h3>
        <p className="text-xs text-[#6C8576] text-center max-w-sm leading-relaxed">
          Enter an instruction in the workspace and click Optimize to synthesize balanced, compact, and detailed variants.
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

  const handleSimulateRun = () => {
    setSimulating(true);
    setSimulatedOutput(null);
    setTimeout(() => {
      let preview = "";
      if (result.classification.primary_category.includes("Coding")) {
        preview = `// Executed against ${result.target_model}\nfunction solve(input: number[]): number {\n  if (!input || input.length === 0) return 0;\n  // Optimal O(N) single-pass aggregation\n  return input.reduce((acc, curr) => acc + curr, 0);\n}\n\n// Verified zero unnecessary prose overhead.`;
      } else if (result.classification.primary_category.includes("Math")) {
        preview = `Step 1: Formalize parameters from objective.\nStep 2: Evaluate state transition invariants.\nStep 3: Verification: Verified bounds match criteria.\n\nFinal Boxed Result: \\boxed{42/105 = 2/5}`;
      } else {
        preview = `### Direct Synthesis Result\n1. Target objective satisfied with zero conversational filler.\n2. Preserved all explicit constraints and domain parameters.\n3. Output formatted strictly as: ${result.intent.desired_output}.`;
      }
      setSimulatedOutput(preview);
      setSimulating(false);
    }, 400);
  };

  const handleExport = (format: "md" | "json" | "txt") => {
    let content = "";
    let mime = "text/plain";
    let filename = `promptx_${result.target_model}_${activeTab}.${format}`;

    if (format === "json") {
      content = JSON.stringify(result, null, 2);
      mime = "application/json";
    } else if (format === "md") {
      content = `# PROMPTX Optimized Prompt\n\n- **Target Model**: ${result.target_model}\n- **Mode**: ${result.mode}\n- **Original Tokens**: ${result.tokens.raw}\n- **Optimized Tokens**: ${currentTokens} (${currentSavings.toFixed(1)}% savings)\n- **Quality Score**: ${result.quality.overall_score}/100\n\n---\n\n${currentText}`;
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
    <div className="flex-1 flex flex-col h-full bg-[#FAF7F2] p-5 overflow-y-auto text-[#203328]">
      {/* Metrics Banner in Warm Beige & Forest Green */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] shadow-xs">
        {/* Token Count Comparison */}
        <div className="p-2.5 rounded-xl bg-[#F8F5F0] border border-[#E8DFD0]">
          <div className="text-[11px] text-[#557162] flex items-center justify-between font-medium">
            <span>Tokens (Raw → Opt)</span>
            <TrendingDown className="w-3.5 h-3.5 text-[#2D5A43]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono">
            <span className="text-[#889E91] line-through text-xs">{result.tokens.raw}</span>
            <span className="text-[#6C8576] text-xs">→</span>
            <span className="text-[#1A2E24] text-base font-bold">{currentTokens}</span>
          </div>
        </div>

        {/* Token Savings Percentage */}
        <div className="p-2.5 rounded-xl bg-[#F8F5F0] border border-[#E8DFD0]">
          <div className="text-[11px] text-[#557162] flex items-center justify-between font-medium">
            <span>Token Savings</span>
            <Zap className="w-3.5 h-3.5 text-[#2D5A43]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className={`text-base font-bold ${currentSavings > 0 ? "text-[#2D5A43]" : "text-amber-600"}`}>
              {currentSavings > 0 ? `-${currentSavings.toFixed(1)}%` : `${currentSavings.toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* Quality Score */}
        <div className="p-2.5 rounded-xl bg-[#F8F5F0] border border-[#E8DFD0]">
          <div className="text-[11px] text-[#557162] flex items-center justify-between font-medium">
            <span>Quality Index</span>
            <Award className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-[#1A2E24] text-base font-bold">
              {result.quality.overall_score}
            </span>
            <span className="text-[#788E81] text-xs">/100</span>
          </div>
        </div>

        {/* Pipeline Latency */}
        <div className="p-2.5 rounded-xl bg-[#F8F5F0] border border-[#E8DFD0]">
          <div className="text-[11px] text-[#557162] flex items-center justify-between font-medium">
            <span>Execution Latency</span>
            <Clock className="w-3.5 h-3.5 text-[#2D5A43]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-[#1A2E24] text-base font-bold">
              {result.total_latency_ms.toFixed(0)}
            </span>
            <span className="text-[#788E81] text-xs">ms</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar & Comparison Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3.5 pb-2 border-b border-[#E2DACF]">
        <div className="flex items-center gap-1.5 p-1 bg-[#EBE4D8] rounded-xl border border-[#DACFBF] shadow-xs">
          <button
            onClick={() => setActiveTab("optimized")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "optimized"
                ? "bg-[#2D5A43] text-[#F8F6F0] shadow-sm"
                : "text-[#4A6354] hover:text-[#1A2E24] hover:bg-[#E3DCcf]"
            }`}
          >
            Balanced Optimized
          </button>
          <button
            onClick={() => setActiveTab("compact")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "compact"
                ? "bg-[#2D5A43] text-[#F8F6F0] shadow-sm"
                : "text-[#4A6354] hover:text-[#1A2E24] hover:bg-[#E3DCcf]"
            }`}
          >
            Ultra-Compact
          </button>
          <button
            onClick={() => setActiveTab("detailed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "detailed"
                ? "bg-[#2D5A43] text-[#F8F6F0] shadow-sm"
                : "text-[#4A6354] hover:text-[#1A2E24] hover:bg-[#E3DCcf]"
            }`}
          >
            Detailed System Prompt
          </button>
        </div>

        {/* View Toggles & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              showDiff
                ? "bg-[#E6EFE8] text-[#2D5A43] border-[#2D5A43]"
                : "bg-[#FFFFFF] text-[#4A6354] border-[#DACFBF] hover:bg-[#F3EDE3]"
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-[#2D5A43]" />
            <span>{showDiff ? "Single View" : "Side-by-Side Diff"}</span>
          </button>

          <button
            onClick={() => setShowQualityDetails(!showQualityDetails)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              showQualityDetails
                ? "bg-[#E6EFE8] text-[#2D5A43] border-[#2D5A43]"
                : "bg-[#FFFFFF] text-[#4A6354] border-[#DACFBF] hover:bg-[#F3EDE3]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#2D5A43]" />
            <span>Quality Radar</span>
          </button>
        </div>
      </div>

      {/* Quality Details Drawer (8 Dimensions) */}
      {showQualityDetails && (
        <div className="mt-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] text-xs shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-[#1A2E24] font-serif">
              Quality Evaluation Breakdown (8 Dimensions)
            </span>
            <span className="text-[11px] text-[#557162] font-mono">
              Certified by Quality Evaluator Agent
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
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
              <div key={dim.label} className="p-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD0]">
                <div className="text-[10px] text-[#557162] font-medium">{dim.label}</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="w-16 h-1.5 bg-[#E0D5C3] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2D5A43]"
                      style={{ width: `${dim.val}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-[#1A2E24]">{dim.val}%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[#4A6354] italic bg-[#F8F5F0] p-2.5 rounded-xl border border-[#E8DFD0]">
            "{result.quality.evaluation_summary}"
          </p>
        </div>
      )}

      {/* Main Content: Single Variant View OR Side-by-Side Diff */}
      <div className="mt-3.5 flex-1 flex flex-col min-h-0">
        {showDiff ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raw Prompt Card */}
            <div className="flex flex-col rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] p-4 overflow-hidden shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD0] text-xs font-semibold text-[#557162]">
                <span>Original Unstructured Prompt</span>
                <span className="font-mono text-[#788E81]">{result.tokens.raw} tokens</span>
              </div>
              <div className="flex-1 mt-3 overflow-y-auto text-xs text-[#354B3E] font-mono whitespace-pre-wrap leading-relaxed">
                {result.raw_prompt}
              </div>
            </div>

            {/* Optimized Variant Card */}
            <div className="flex flex-col rounded-2xl bg-[#FFFFFF] border border-[#2D5A43] p-4 overflow-hidden shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD0] text-xs font-semibold text-[#2D5A43]">
                <span>{activeTab.toUpperCase()} Version</span>
                <span className="font-mono text-[#2D5A43] font-bold">
                  {currentTokens} tokens (-{currentSavings.toFixed(1)}%)
                </span>
              </div>
              <div className="flex-1 mt-3 overflow-y-auto text-xs text-[#1A2E24] font-mono whitespace-pre-wrap leading-relaxed">
                {currentText}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] p-5 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD0]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A2E24] uppercase tracking-wider font-serif">
                  {activeTab} Prompt
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6EFE8] text-[#2D5A43] font-semibold border border-[#C5DEC9]">
                  {result.target_model}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#4A6354] font-medium">
                  {currentTokens} tokens
                </span>
              </div>
            </div>

            <div className="flex-1 mt-4 overflow-y-auto text-xs md:text-sm text-[#1A2E24] font-mono whitespace-pre-wrap leading-relaxed selection:bg-[#E6EFE8] scrollbar-thin">
              {currentText}
            </div>

            {/* Interactive Simulation Playground */}
            {simulatedOutput && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#F4EFEA] border border-[#DACFBF] text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#2D5A43] flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" /> Simulated LLM Execution Output
                  </span>
                  <button
                    onClick={() => setSimulatedOutput(null)}
                    className="text-[10px] text-[#788E81] hover:text-[#1A2E24] cursor-pointer"
                  >
                    Clear Output
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-[#1A2E24] bg-[#FFFFFF] p-3 rounded-lg border border-[#E0D5C3] whitespace-pre-wrap">
                  {simulatedOutput}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Toolbar Footer */}
      <div className="mt-3.5 pt-3 border-t border-[#E2DACF] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => handleExport("txt")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3EDE3] text-[#2D5A43] text-xs font-medium border border-[#DACFBF] cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" /> Text
          </button>
          <button
            onClick={() => handleExport("md")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3EDE3] text-[#2D5A43] text-xs font-medium border border-[#DACFBF] cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" /> Markdown
          </button>
          <button
            onClick={() => handleExport("json")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3EDE3] text-[#2D5A43] text-xs font-medium border border-[#DACFBF] cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>

          <button
            onClick={handleSimulateRun}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6EFE8] hover:bg-[#D5E5D9] text-[#2D5A43] text-xs font-semibold border border-[#C5DEC9] cursor-pointer shadow-2xs"
          >
            <Play className={`w-3.5 h-3.5 ${simulating ? "animate-spin" : ""}`} />
            <span>{simulating ? "Running..." : "Test Run Prompt"}</span>
          </button>

          {onSendToABTest && (
            <button
              onClick={() => onSendToABTest(result.raw_prompt, currentText)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0EBE1] hover:bg-[#E3DCCF] text-[#4A6354] text-xs font-medium border border-[#DACFBF] cursor-pointer shadow-2xs"
            >
              <SplitSquareVertical className="w-3.5 h-3.5 text-[#2D5A43]" /> Send to A/B Test
            </button>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D5A43] hover:bg-[#234735] text-[#F8F6F0] font-semibold text-xs shadow-md shadow-[#2D5A43]/20 transition-all cursor-pointer active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#C5DEC9]" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Optimized Prompt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
