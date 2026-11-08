"use client";

import React, { useState } from "react";
import { X, SplitSquareVertical, Trophy, Sparkles } from "lucide-react";
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
    <div className="fixed inset-0 z-50 bg-[#1A2621]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#FDFBF7] border border-[#DACFBF] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#203328]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#E8DFD0] flex items-center justify-between bg-[#F4EFEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6EFE8] text-[#2D5A43] flex items-center justify-center border border-[#C5DEC9]">
              <SplitSquareVertical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A2E24] tracking-wide font-serif">
                Prompt A/B Testing Arena
              </h3>
              <p className="text-xs text-[#557162]">
                Head-to-head empirical prompt comparison evaluating clarity, constraint fidelity, and performance
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {/* Target Raw Intent */}
          <div>
            <label className="block text-xs font-semibold text-[#557162] mb-1">
              Baseline Objective / Raw Prompt
            </label>
            <input
              type="text"
              value={rawPrompt}
              onChange={(e) => setRawPrompt(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DACFBF] rounded-xl p-3 text-xs text-[#1A2E24] shadow-xs"
            />
          </div>

          {/* Prompts A and B Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#2D5A43] font-serif">Candidate Prompt A</span>
              </div>
              <textarea
                rows={4}
                value={promptA}
                onChange={(e) => setPromptA(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DFD0] rounded-xl p-3 text-xs text-[#1A2E24] font-mono leading-relaxed"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#725E42] font-serif">Candidate Prompt B</span>
              </div>
              <textarea
                rows={4}
                value={promptB}
                onChange={(e) => setPromptB(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DFD0] rounded-xl p-3 text-xs text-[#1A2E24] font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleRunTest}
              disabled={isRunning}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-[#F8F6F0] transition-all cursor-pointer shadow-md ${
                isRunning
                  ? "bg-[#D8CEBE] text-[#889E91] cursor-not-allowed"
                  : "bg-[#2D5A43] hover:bg-[#234735] shadow-[#2D5A43]/20"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Running Evaluation..." : "Compare Prompts A vs B"}</span>
            </button>
          </div>

          {/* Result Card */}
          {result && (
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#2D5A43] space-y-3 mt-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-[#1A2E24] text-sm font-serif">
                    Winner: <span className="text-[#2D5A43]">{result.winner}</span>
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-xs font-bold">
                  <span className="text-[#2D5A43]">Prompt A: {result.score_a}/100</span>
                  <span className="text-[#725E42]">Prompt B: {result.score_b}/100</span>
                </div>
              </div>

              <p className="text-xs text-[#2C3E35] leading-relaxed font-sans bg-[#F8F5F0] p-3.5 rounded-xl border border-[#E8DFD0]">
                {result.comparison_analysis}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
