"use client";

import React from "react";
import { X, Terminal, CheckCircle2, Clock, Cpu, GitBranch } from "lucide-react";
import { OptimizationResponse } from "@/types/promptx";

interface DevModeModalProps {
  result: OptimizationResponse | null;
  onClose: () => void;
}

export const DevModeModal: React.FC<DevModeModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1A2621]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#FDFBF7] border border-[#DACFBF] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#203328]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#E8DFD0] flex items-center justify-between bg-[#F4EFEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6EFE8] text-[#2D5A43] flex items-center justify-center border border-[#C5DEC9]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A2E24] tracking-wide font-serif">
                PROMPTX 7-Agent Execution Trace & Reasoning
              </h3>
              <p className="text-xs text-[#557162] font-mono">
                Pipeline Run ID: {result.id.slice(0, 8)}... | Iterations: {result.iterations_run} | Latency: {result.total_latency_ms}ms
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
          {/* Agent Reasoning Step-by-Step Chain */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#2D5A43] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Sequential Multi-Agent Execution Chain
            </h4>
            <div className="space-y-2.5">
              {result.agent_reasoning.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] flex items-start justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2D5A43] flex-shrink-0" />
                      <span className="font-bold text-[#1A2E24] font-serif">{step.agent_name}</span>
                    </div>
                    <p className="text-[#3E5549] text-[11px] pl-6 leading-relaxed font-sans">
                      {step.details}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#2D5A43] font-semibold px-2 py-0.5 rounded-full bg-[#E6EFE8] flex-shrink-0 flex items-center gap-1 border border-[#C5DEC9]">
                    <Clock className="w-3 h-3 text-[#2D5A43]" />
                    {step.execution_time_ms}ms
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Intent Analysis Details */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] space-y-2 text-xs shadow-2xs">
            <h4 className="font-bold text-[#1A2E24] font-serif flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#2D5A43]" /> Semantic Intent & Strategy Synthesis
            </h4>
            <div className="grid grid-cols-2 gap-4 mt-2 text-[11px]">
              <div>
                <span className="text-[#557162] font-semibold">Primary Objective:</span>
                <p className="text-[#1A2E24] mt-0.5 font-medium">{result.intent.objective}</p>
              </div>
              <div>
                <span className="text-[#557162] font-semibold">Classified Domain:</span>
                <p className="text-[#2D5A43] mt-0.5 font-bold">{result.classification.primary_category}</p>
              </div>
              <div>
                <span className="text-[#557162] font-semibold">Prompt Strategy:</span>
                <p className="text-[#2D5A43] mt-0.5 font-bold">{result.strategy.strategy}</p>
              </div>
              <div>
                <span className="text-[#557162] font-semibold">Target Output Schema:</span>
                <p className="text-[#1A2E24] mt-0.5 font-mono">{result.intent.desired_output}</p>
              </div>
            </div>
          </div>

          {/* Raw JSON Inspect */}
          <div className="p-4 rounded-2xl bg-[#F4EFEA] border border-[#DACFBF] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#557162]">
              <span className="font-semibold">Full Pipeline Response Payload</span>
              <span className="font-mono text-[10px]">FastAPI Pydantic Schema</span>
            </div>
            <pre className="p-3 bg-[#FFFFFF] rounded-xl text-[11px] font-mono text-[#1A2E24] overflow-x-auto max-h-48 border border-[#E0D5C3]">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#E8DFD0] flex justify-end bg-[#F4EFEA]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D5A43] hover:bg-[#234735] text-[#F8F6F0] text-xs font-semibold cursor-pointer shadow-xs"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
