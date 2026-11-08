"use client";

import React from "react";
import { X, Terminal, CheckCircle2, Clock, Cpu, GitBranch, Shield, Zap } from "lucide-react";
import { OptimizationResponse } from "@/types/promptx";

interface DevModeModalProps {
  result: OptimizationResponse | null;
  onClose: () => void;
}

export const DevModeModal: React.FC<DevModeModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#0f121d] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        {/* Header */}
        <div className="p-4 px-6 border-b border-zinc-800 flex items-center justify-between bg-[#131726]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                PROMPTX 7-Agent Execution Trace & Reasoning
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Pipeline Run ID: {result.id.slice(0, 8)}... | Iterations: {result.iterations_run} | Latency: {result.total_latency_ms}ms
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Agent Reasoning Step-by-Step Chain */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Sequential Agent Execution Trace
            </h4>
            <div className="space-y-2.5">
              {result.agent_reasoning.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#141829] border border-zinc-800/80 flex items-start justify-between gap-3 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-semibold text-white">{step.agent_name}</span>
                    </div>
                    <p className="text-zinc-300 text-[11px] pl-6 leading-relaxed">
                      {step.details}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-400 px-2 py-0.5 rounded bg-zinc-800 flex-shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {step.execution_time_ms}ms
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Intent Analysis Details */}
          <div className="p-4 rounded-xl bg-[#141829] border border-zinc-800/80 space-y-2 text-xs">
            <h4 className="font-semibold text-zinc-200 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" /> Intent & Classification Synthesis
            </h4>
            <div className="grid grid-cols-2 gap-4 mt-2 font-mono text-[11px]">
              <div>
                <span className="text-zinc-400">Primary Objective:</span>
                <p className="text-zinc-200 mt-0.5 font-sans">{result.intent.objective}</p>
              </div>
              <div>
                <span className="text-zinc-400">Classified Domain:</span>
                <p className="text-cyan-400 mt-0.5 font-sans">{result.classification.primary_category}</p>
              </div>
              <div>
                <span className="text-zinc-400">Target Strategy:</span>
                <p className="text-indigo-400 mt-0.5 font-sans">{result.strategy.strategy}</p>
              </div>
              <div>
                <span className="text-zinc-400">Target Output Schema:</span>
                <p className="text-emerald-400 mt-0.5 font-sans">{result.intent.desired_output}</p>
              </div>
            </div>
          </div>

          {/* Raw JSON Inspect */}
          <div className="p-4 rounded-xl bg-[#0a0c12] border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Full Pipeline JSON Payload</span>
              <span className="font-mono text-[10px]">Pydantic Schema</span>
            </div>
            <pre className="p-3 bg-black/60 rounded-lg text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-zinc-800 flex justify-end bg-[#131726]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
