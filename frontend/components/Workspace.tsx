"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Clipboard,
  Terminal,
  Zap,
  ShieldCheck,
  Flame,
  Gauge
} from "lucide-react";
import { OptimizationMode, ModelInfo } from "@/types/promptx";
import { countTokensApi } from "@/lib/api";

interface WorkspaceProps {
  rawPrompt: string;
  setRawPrompt: (text: string) => void;
  targetModel: string;
  setTargetModel: (model: string) => void;
  mode: OptimizationMode;
  setMode: (mode: OptimizationMode) => void;
  customInstructions: string;
  setCustomInstructions: (text: string) => void;
  preserveTerms: string;
  setPreserveTerms: (text: string) => void;
  devMode: boolean;
  setDevMode: (enabled: boolean) => void;
  onOptimize: () => void;
  isLoading: boolean;
  models: ModelInfo[];
}

export const Workspace: React.FC<WorkspaceProps> = ({
  rawPrompt,
  setRawPrompt,
  targetModel,
  setTargetModel,
  mode,
  setMode,
  customInstructions,
  setCustomInstructions,
  preserveTerms,
  setPreserveTerms,
  devMode,
  setDevMode,
  onOptimize,
  isLoading,
  models,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [liveTokens, setLiveTokens] = useState(0);

  // Live token counting debounced
  useEffect(() => {
    if (!rawPrompt.trim()) {
      setLiveTokens(0);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await countTokensApi(rawPrompt, targetModel);
      setLiveTokens(res.token_count);
    }, 200);
    return () => clearTimeout(timer);
  }, [rawPrompt, targetModel]);

  const loadExample = (type: string) => {
    if (type === "fluff") {
      setRawPrompt(
        "Hello dear AI assistant! Good morning. I was wondering if you could please kindly assist me in order to write a Python script that calculates fibonacci numbers? In order to do this, make sure that you write clean code. As a matter of fact, due to the fact that I am preparing for a coding interview, please give a good answer. Thank you so much in advance and let me know if you have questions!"
      );
    } else if (type === "coding") {
      setRawPrompt(
        "Write an async rate limiter in Python using Redis sliding window log with Lua script atomicity. Ensure sub-millisecond overhead, handle Redis connection pool exhaustion, and provide pytest unit tests."
      );
    } else if (type === "structured") {
      setRawPrompt(
        "Extract financial statement metrics from this quarterly report into a valid RFC-8259 JSON object with fields: revenue_usd, net_margin_pct, ebitda, and guidance_q4. No preamble or markdown commentary."
      );
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawPrompt(text);
    } catch (e) {
      console.error("Paste failed", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090b10] border-r border-zinc-800/80 p-5 overflow-y-auto">
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/60">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            Raw Prompt Studio
          </h2>
          <p className="text-xs text-zinc-400">
            Input unoptimized user prompts, instructions, or queries
          </p>
        </div>

        {/* Example Presets */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-medium">Load Example:</span>
          <button
            onClick={() => loadExample("fluff")}
            className="px-2 py-1 rounded-md bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 text-[11px] border border-zinc-700/50 cursor-pointer"
          >
            Redundant Fluff
          </button>
          <button
            onClick={() => loadExample("coding")}
            className="px-2 py-1 rounded-md bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 text-[11px] border border-zinc-700/50 cursor-pointer"
          >
            Complex Code
          </button>
          <button
            onClick={() => loadExample("structured")}
            className="px-2 py-1 rounded-md bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 text-[11px] border border-zinc-700/50 cursor-pointer"
          >
            JSON Schema
          </button>
        </div>
      </div>

      {/* Target Model & Optimization Mode Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Model Selector */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Target Model & Tokenizer
          </label>
          <div className="relative">
            <select
              value={targetModel}
              onChange={(e) => setTargetModel(e.target.value)}
              className="w-full bg-[#121520] border border-zinc-800/90 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 appearance-none font-medium cursor-pointer"
            >
              {models.length > 0 ? (
                models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.family.toUpperCase()})
                  </option>
                ))
              ) : (
                <>
                  <option value="gpt-4o">GPT-4o (Omni) - OpenAI</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet - Anthropic</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash - Google</option>
                  <option value="deepseek-v3">DeepSeek V3 - DeepSeek</option>
                  <option value="llama-3.3-70b">Llama 3.3 70B - Meta</option>
                  <option value="ollama-local">Ollama Local (Local Host)</option>
                </>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Optimization Mode
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#121520] rounded-xl border border-zinc-800/90">
            {(["QUICK", "BALANCED", "DEEP", "EXTREME"] as OptimizationMode[]).map((m) => {
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    isActive
                      ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  {m === "QUICK" && <Zap className="w-3 h-3" />}
                  {m === "BALANCED" && <Gauge className="w-3 h-3" />}
                  {m === "DEEP" && <ShieldCheck className="w-3 h-3" />}
                  {m === "EXTREME" && <Flame className="w-3 h-3" />}
                  <span>{m}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mode Description Banner */}
      <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-[11px] text-zinc-400 flex items-center justify-between">
        <span>
          {mode === "QUICK" && "⚡ QUICK: Fast single-pass token compression with minimal latency."}
          {mode === "BALANCED" && "⚖️ BALANCED: Optimal equilibrium between token reduction and prompt quality."}
          {mode === "DEEP" && "🔬 DEEP: Multi-pass refinement and rigorous quality evaluation validation."}
          {mode === "EXTREME" && "🔥 EXTREME: Aggressive token elimination with strict semantic preservation."}
        </span>
        <span className="font-mono text-[10px] text-cyan-400">
          Target Tokenizer: {targetModel.includes("gpt-4o") ? "o200k_base" : "cl100k_base"}
        </span>
      </div>

      {/* Raw Prompt Textarea */}
      <div className="mt-4 flex-1 flex flex-col min-h-[220px]">
        <div className="flex items-center justify-between pb-1.5 text-xs text-zinc-400">
          <span className="font-medium">Raw Prompt Input</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePaste}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/70 hover:bg-zinc-700/70 text-[11px] text-zinc-300 cursor-pointer"
            >
              <Clipboard className="w-3 h-3" /> Paste
            </button>
            <button
              onClick={() => setRawPrompt("")}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/70 hover:bg-zinc-700/70 text-[11px] text-zinc-300 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>

        <textarea
          value={rawPrompt}
          onChange={(e) => setRawPrompt(e.target.value)}
          placeholder="Paste or type any unstructured, wordy, or raw prompt here..."
          className="flex-1 w-full bg-[#121520] border border-zinc-800/90 rounded-xl p-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/80 resize-none font-mono leading-relaxed selection:bg-cyan-500/30"
        />

        {/* Token Count Status Footer */}
        <div className="flex items-center justify-between mt-2 px-1 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              Tokens:{" "}
              <strong className="text-cyan-400 font-mono font-semibold">
                {liveTokens}
              </strong>
            </span>
            <span className="text-zinc-600">|</span>
            <span>
              Characters:{" "}
              <strong className="text-zinc-300 font-mono">
                {rawPrompt.length}
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">
            Real tokenizer verified
          </span>
        </div>
      </div>

      {/* Advanced Options Accordion */}
      <div className="mt-4 border border-zinc-800/80 rounded-xl bg-[#121520]/60 overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-300 hover:bg-zinc-800/40 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Advanced Optimization Controls & Directives</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-4 pt-2 border-t border-zinc-800/60 space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Preserve Exact Terms / Identifiers (Comma-separated)
              </label>
              <input
                type="text"
                value={preserveTerms}
                onChange={(e) => setPreserveTerms(e.target.value)}
                placeholder="e.g. user_id, POST /api/checkout, Redis, O(log N)"
                className="w-full bg-[#0a0c12] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/60 font-mono"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                These exact terms will be masked and guaranteed untouched during semantic compression.
              </p>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Custom Optimization Directives
              </label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Enforce strict typescript types, omit introduction, sub-80 tokens"
                className="w-full bg-[#0a0c12] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer: Dev Mode Toggle & Optimize Button */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={devMode}
            onChange={(e) => setDevMode(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Developer Mode (Show 7-Agent Execution Trace)</span>
        </label>

        <button
          onClick={onOptimize}
          disabled={isLoading || !rawPrompt.trim()}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            isLoading || !rawPrompt.trim()
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 active:scale-98"
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Optimizing..." : "Optimize Prompt"}</span>
        </button>
      </div>
    </div>
  );
};
