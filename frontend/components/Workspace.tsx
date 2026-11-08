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
  Gauge,
  SlidersHorizontal,
  Bookmark
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
    } else if (type === "reasoning") {
      setRawPrompt(
        "Solve this probability puzzle step by step: A bag contains 4 red, 6 blue, and 5 green marbles. Three marbles are drawn successively without replacement. What is the probability that all three marbles are different colors? Express answer as a simplified fraction."
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
    <div className="flex-1 flex flex-col h-full bg-[#FAF7F2] border-r border-[#E2DACF] p-5 overflow-y-auto text-[#203328]">
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2DACF]">
        <div>
          <h2 className="text-base font-semibold text-[#1A2E24] tracking-tight font-serif flex items-center gap-2">
            Raw Prompt Studio
          </h2>
          <p className="text-xs text-[#557162]">
            Transform verbose, unstructured prompts into high-performance directives
          </p>
        </div>

        {/* Quick Example Presets */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#6C8576] font-medium mr-1">Presets:</span>
          <button
            onClick={() => loadExample("fluff")}
            className="px-2.5 py-1 rounded-lg bg-[#EFE9DF] hover:bg-[#E3DCcf] text-[#2D5A43] text-[11px] font-medium border border-[#D8CEBE] transition-all cursor-pointer shadow-2xs"
          >
            Redundant Fluff
          </button>
          <button
            onClick={() => loadExample("coding")}
            className="px-2.5 py-1 rounded-lg bg-[#EFE9DF] hover:bg-[#E3DCcf] text-[#2D5A43] text-[11px] font-medium border border-[#D8CEBE] transition-all cursor-pointer shadow-2xs"
          >
            Concurrency Code
          </button>
          <button
            onClick={() => loadExample("structured")}
            className="px-2.5 py-1 rounded-lg bg-[#EFE9DF] hover:bg-[#E3DCcf] text-[#2D5A43] text-[11px] font-medium border border-[#D8CEBE] transition-all cursor-pointer shadow-2xs"
          >
            JSON Schema
          </button>
          <button
            onClick={() => loadExample("reasoning")}
            className="px-2.5 py-1 rounded-lg bg-[#EFE9DF] hover:bg-[#E3DCcf] text-[#2D5A43] text-[11px] font-medium border border-[#D8CEBE] transition-all cursor-pointer shadow-2xs"
          >
            Math Reasoner
          </button>
        </div>
      </div>

      {/* Target Model & Mode Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3.5">
        {/* Model Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#2D5A43] mb-1.5">
            Target LLM Architecture
          </label>
          <div className="relative">
            <select
              value={targetModel}
              onChange={(e) => setTargetModel(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DACFBF] rounded-xl px-3.5 py-2.5 text-xs text-[#1A2E24] focus:outline-none focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] appearance-none font-medium cursor-pointer shadow-xs"
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
            <ChevronDown className="w-4 h-4 text-[#6C8576] absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#2D5A43] mb-1.5">
            Optimization Mode
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#EBE4D8] rounded-xl border border-[#DACFBF] shadow-xs">
            {(["QUICK", "BALANCED", "DEEP", "EXTREME"] as OptimizationMode[]).map((m) => {
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    isActive
                      ? "bg-[#2D5A43] text-[#F8F6F0] shadow-sm shadow-[#2D5A43]/20"
                      : "text-[#4A6354] hover:text-[#1A2E24] hover:bg-[#E3DCcf]"
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

      {/* Mode Banner in Warm Beige */}
      <div className="mt-2.5 px-3.5 py-2 rounded-xl bg-[#F0EBE1] border border-[#E0D5C3] text-[11px] text-[#4A6354] flex items-center justify-between">
        <span className="font-medium">
          {mode === "QUICK" && "⚡ QUICK: Fast single-pass token compression with sub-millisecond response."}
          {mode === "BALANCED" && "⚖️ BALANCED: Optimal balance between output fidelity and token reduction."}
          {mode === "DEEP" && "🔬 DEEP: Multi-pass iterative refinement and constraint validation."}
          {mode === "EXTREME" && "🔥 EXTREME: Aggressive token elimination with strict semantic preservation."}
        </span>
        <span className="font-mono text-[10px] text-[#2D5A43] font-semibold bg-[#E4ECE5] px-2 py-0.5 rounded-full border border-[#C5DEC9]">
          Tokenizer: {targetModel.includes("gpt-4o") ? "o200k_base" : "cl100k_base"}
        </span>
      </div>

      {/* Raw Prompt Textarea */}
      <div className="mt-3.5 flex-1 flex flex-col min-h-[220px]">
        <div className="flex items-center justify-between pb-1.5 text-xs text-[#557162]">
          <span className="font-semibold text-[#2D5A43]">User Input Prompt</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePaste}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EFE9DF] hover:bg-[#E3DCcf] text-[11px] font-medium text-[#2D5A43] border border-[#D8CEBE] cursor-pointer shadow-2xs"
            >
              <Clipboard className="w-3 h-3" /> Paste
            </button>
            <button
              onClick={() => setRawPrompt("")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EFE9DF] hover:bg-[#E3DCcf] text-[11px] font-medium text-[#2D5A43] border border-[#D8CEBE] cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>

        <textarea
          value={rawPrompt}
          onChange={(e) => setRawPrompt(e.target.value)}
          placeholder="Paste or write any unstructured prompt here..."
          className="flex-1 w-full bg-[#FFFFFF] border border-[#DACFBF] rounded-2xl p-4 text-xs md:text-sm text-[#1A2E24] placeholder-[#889E91] focus:outline-none focus:border-[#2D5A43] focus:ring-2 focus:ring-[#2D5A43]/15 resize-none font-mono leading-relaxed shadow-xs"
        />

        {/* Live Token Status */}
        <div className="flex items-center justify-between mt-2 px-1 text-xs text-[#557162]">
          <div className="flex items-center gap-3">
            <span>
              Tokens:{" "}
              <strong className="text-[#2D5A43] font-mono font-bold bg-[#E6EFE8] px-1.5 py-0.5 rounded">
                {liveTokens}
              </strong>
            </span>
            <span className="text-[#C8BCAB]">|</span>
            <span>
              Characters:{" "}
              <strong className="text-[#1A2E24] font-mono font-semibold">
                {rawPrompt.length}
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-[#6C8576] font-medium">
            Verified Subword BPE
          </span>
        </div>
      </div>

      {/* Advanced Options Accordion */}
      <div className="mt-3.5 border border-[#DACFBF] rounded-2xl bg-[#FFFFFF] overflow-hidden shadow-xs">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-[#2D5A43] hover:bg-[#FAF7F2] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#2D5A43]" />
            <span>Advanced Controls: Term Masking & Custom Directives</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-[#6C8576]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#6C8576]" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-4 pt-2 border-t border-[#E8DFD0] space-y-3 text-xs bg-[#FAF7F2]">
            <div>
              <label className="block text-[#1A2E24] font-semibold mb-1">
                Preserve Exact Terms / Variables (Comma-separated)
              </label>
              <input
                type="text"
                value={preserveTerms}
                onChange={(e) => setPreserveTerms(e.target.value)}
                placeholder="e.g. user_id, POST /api/v1/checkout, Redis, O(N log N)"
                className="w-full bg-[#FFFFFF] border border-[#DACFBF] rounded-xl px-3 py-2 text-[#1A2E24] placeholder-[#889E91] focus:outline-none focus:border-[#2D5A43] font-mono"
              />
              <p className="text-[10px] text-[#6C8576] mt-1">
                Terms entered here are shielded with semantic masks and preserved verbatim.
              </p>
            </div>

            <div>
              <label className="block text-[#1A2E24] font-semibold mb-1">
                Custom Optimization Directives
              </label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Enforce TypeScript interfaces, direct imperative sentences, sub-80 tokens"
                className="w-full bg-[#FFFFFF] border border-[#DACFBF] rounded-xl px-3 py-2 text-[#1A2E24] placeholder-[#889E91] focus:outline-none focus:border-[#2D5A43]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer: Dev Mode Toggle & Optimize Button */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-xs text-[#4A6354] font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={devMode}
            onChange={(e) => setDevMode(e.target.checked)}
            className="w-4 h-4 rounded border-[#DACFBF] text-[#2D5A43] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#2D5A43]"
          />
          <Terminal className="w-3.5 h-3.5 text-[#2D5A43]" />
          <span>Developer Mode (Inspect 7-Agent Trace)</span>
        </label>

        <button
          onClick={onOptimize}
          disabled={isLoading || !rawPrompt.trim()}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer shadow-md ${
            isLoading || !rawPrompt.trim()
              ? "bg-[#D8CEBE] text-[#889E91] cursor-not-allowed"
              : "bg-[#2D5A43] hover:bg-[#234735] text-[#F8F6F0] shadow-[#2D5A43]/20 hover:shadow-lg active:scale-[0.98]"
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Optimizing with Agents..." : "Optimize Prompt"}</span>
        </button>
      </div>
    </div>
  );
};
