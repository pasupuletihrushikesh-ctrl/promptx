"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  FileCode2,
  SplitSquareVertical,
  BarChart3,
  Settings,
  History,
  Star,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  Cpu
} from "lucide-react";
import { HistoryItem } from "@/types/promptx";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onNewOptimization: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDeleteHistory: (id: string, e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onNewOptimization,
  history,
  onSelectHistory,
  onToggleFavorite,
  onDeleteHistory,
}) => {
  const [historySearch, setHistorySearch] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.raw_prompt.toLowerCase().includes(historySearch.toLowerCase());
    const matchesFavorite = favoriteOnly ? item.is_favorite : true;
    return matchesSearch && matchesFavorite;
  });

  return (
    <aside className="w-80 h-screen bg-[#0d0f17] border-r border-zinc-800/80 flex flex-col flex-shrink-0 text-zinc-300 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-wider text-white">PROMPTX</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Autonomous Prompt Engine</p>
          </div>
        </div>
      </div>

      {/* New Optimization Action */}
      <div className="p-3">
        <button
          onClick={onNewOptimization}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-900/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Optimization
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="px-3 py-1 space-y-1">
        <button
          onClick={() => setActiveView("studio")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeView === "studio"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Optimizer Studio</span>
        </button>

        <button
          onClick={() => setActiveView("batch")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeView === "batch"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Batch Optimizer</span>
        </button>

        <button
          onClick={() => setActiveView("templates")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeView === "templates"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Prompt Templates</span>
        </button>

        <button
          onClick={() => setActiveView("abtest")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeView === "abtest"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <SplitSquareVertical className="w-4 h-4" />
          <span>A/B Testing Arena</span>
        </button>

        <button
          onClick={() => setActiveView("benchmark")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeView === "benchmark"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="flex-1 text-left">Benchmark Suite</span>
          <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.2 rounded font-mono">
            100 Tests
          </span>
        </button>

        <button
          onClick={() => setActiveView("settings")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeView === "settings"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuration & API</span>
        </button>
      </nav>

      {/* History Section */}
      <div className="flex-1 flex flex-col min-h-0 mt-3 px-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            <span className="text-[10px] text-zinc-500 font-mono">({history.length})</span>
          </div>
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${
              favoriteOnly ? "text-amber-400" : "text-zinc-500"
            }`}
            title="Filter Favorites"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* History Search */}
        <div className="relative mt-2 mb-2">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search optimizations..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full bg-[#141724] border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          {filteredHistory.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-xs">
              No prompt optimizations found.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className="group relative p-2.5 rounded-lg bg-[#141724]/70 hover:bg-[#1a1f33] border border-zinc-800/60 hover:border-cyan-500/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs text-zinc-300 font-medium line-clamp-2 leading-relaxed">
                    {item.raw_prompt}
                  </p>
                  <button
                    onClick={(e) => onToggleFavorite(item.id, e)}
                    className={`p-0.5 rounded transition-colors ${
                      item.is_favorite ? "text-amber-400" : "text-zinc-600 hover:text-amber-300"
                    }`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-cyan-300">
                    {item.target_model}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">
                      -{item.savings_percent.toFixed(0)}%
                    </span>
                    <span className="text-zinc-500">
                      {item.optimized_tokens} tok
                    </span>
                    <button
                      onClick={(e) => onDeleteHistory(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-zinc-800/60 bg-[#0a0c12] text-[11px] text-zinc-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>7 Agents Active</span>
        </div>
        <span className="font-mono text-[10px] text-zinc-400">BPE Engine Ready</span>
      </div>
    </aside>
  );
};
