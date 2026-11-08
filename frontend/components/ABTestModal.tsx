"use client";

import React, { useState } from "react";
import { X, SplitSquareVertical, Trophy, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { runABTest } from "@/lib/api";

interface ABTestModalProps {
  onClose: () => void;
  initialRawPrompt?: string;
  initialPromptA?: string;
  targetModel: string;
}

export const ABTestModal: React.FC<ABTestModalProps> = ({
  onClose,
  initialRawPrompt = "",
  initialPromptA = "",
  targetModel,
}) => {
  const [rawPrompt, setRawPrompt] = useState(
    initialRawPrompt || "Hello AI! Please write a Python script that calculates fibonacci numbers cleanly."
  );
  const [promptA, setPromptA] = useState(
    initialPromptA || "Write a Python function to compute fibonacci numbers up to N with type annotations and error checks. Output code only."
  );
  const [promptB, setPromptB] = useState(
    "Calculate fibonacci numbers in Python. Clean code only."
  );
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleRunTest = async () => {
    if (!promptA.trim() || !promptB.trim()) return;
    setIsRunning(true);
    try {
      const data = await runABTest({
        raw_prompt: rawPrompt,
        prompt_a: promptA,
        prompt_b: promptB,
        target_model: targetModel,
      });
      setResult(data);
    } catch (e) {
      console.error("AB Test failed", e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#0f121d] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        {/* Header */}
        <div className="p-4 px-6 border-b border-zinc-800 flex items-center justify-between bg-[#131726]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <SplitSquareVertical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Prompt A/B Testing Arena
              </h3>
              <p className="text-xs text-zinc-400">
                Head-to-head empirical prompt comparison evaluating clarity, constraint fidelity, and performance
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {/* Target Raw Intent */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Baseline Objective / Raw Prompt
            </label>
            <input
              type="text"
              value={rawPrompt}
              onChange={(e) => setRawPrompt(e.target.value)}
              className="w-full bg-[#141829] border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200"
            />
          </div>

          {/* Prompts A and B Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-[#141829] border border-zinc-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-cyan-400">Candidate Prompt A</span>
              </div>
              <textarea
                rows={4}
                value={promptA}
                onChange={(e) => setPromptA(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 font-mono"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#141829] border border-zinc-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-purple-400">Candidate Prompt B</span>
              </div>
              <textarea
                rows={4}
                value={promptB}
                onChange={(e) => setPromptB(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleRunTest}
              disabled={isRunning}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-xs text-white transition-all cursor-pointer ${
                isRunning
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-900/30"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Running Evaluation..." : "Compare Prompts A vs B"}</span>
            </button>
          </div>

          {/* Result Card */}
          {result && (
            <div className="p-4 rounded-xl bg-[#141829] border border-indigo-500/40 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-white text-sm">
                    Winner: <span className="text-amber-400">{result.winner}</span>
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-xs">
                  <span className="text-cyan-400">Prompt A: {result.score_a}/100</span>
                  <span className="text-purple-400">Prompt B: {result.score_b}/100</span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-black/40 p-3 rounded-lg border border-zinc-800">
                {result.comparison_analysis}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
