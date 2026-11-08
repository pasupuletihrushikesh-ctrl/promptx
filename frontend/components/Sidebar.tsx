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
  Cpu,
  Leaf
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
    <aside className="w-80 h-screen bg-[#F4EFEA] border-r border-[#E2DACF] flex flex-col flex-shrink-0 text-[#2C3E35] select-none">
      {/* Brand Header */}
      <div className="p-4.5 border-b border-[#E2DACF] flex items-center justify-between bg-[#F8F5F0]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2D5A43] flex items-center justify-center shadow-md shadow-[#2D5A43]/20">
            <Leaf className="w-5 h-5 text-[#F8F6F0]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-wider text-[#1A2E24] font-serif">
                PROMPTX
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#E3EFE7] text-[#2D5A43] border border-[#C5DEC9] font-semibold">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#557162]">Autonomous AI Prompt Engine</p>
          </div>
        </div>
      </div>

      {/* New Optimization Button */}
      <div className="p-3">
        <button
          onClick={onNewOptimization}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2D5A43] hover:bg-[#234735] text-[#F8F6F0] font-medium text-xs shadow-md shadow-[#2D5A43]/20 transition-all cursor-pointer hover:shadow-lg active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>New Optimization</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="px-3 py-1 space-y-1">
        <button
          onClick={() => setActiveView("studio")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeView === "studio"
              ? "bg-[#E6EFE8] text-[#2D5A43] font-semibold shadow-xs border border-[#C5DEC9]"
              : "hover:bg-[#EBE4D8] text-[#4A6354] hover:text-[#1A2E24]"
          }`}
        >
          <Cpu className="w-4 h-4 text-[#2D5A43]" />
          <span>Optimizer Studio</span>
        </button>

        <button
          onClick={() => setActiveView("batch")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeView === "batch"
              ? "bg-[#E6EFE8] text-[#2D5A43] font-semibold shadow-xs border border-[#C5DEC9]"
              : "hover:bg-[#EBE4D8] text-[#4A6354] hover:text-[#1A2E24]"
          }`}
        >
          <Layers className="w-4 h-4 text-[#2D5A43]" />
          <span>Batch Optimizer</span>
        </button>

        <button
          onClick={() => setActiveView("templates")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeView === "templates"
              ? "bg-[#E6EFE8] text-[#2D5A43] font-semibold shadow-xs border border-[#C5DEC9]"
              : "hover:bg-[#EBE4D8] text-[#4A6354] hover:text-[#1A2E24]"
          }`}
        >
          <FileCode2 className="w-4 h-4 text-[#2D5A43]" />
          <span>Prompt Templates</span>
        </button>

        <button
          onClick={() => setActiveView("abtest")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeView === "abtest"
              ? "bg-[#E6EFE8] text-[#2D5A43] font-semibold shadow-xs border border-[#C5DEC9]"
              : "hover:bg-[#EBE4D8] text-[#4A6354] hover:text-[#1A2E24]"
          }`}
        >
          <SplitSquareVertical className="w-4 h-4 text-[#2D5A43]" />
          <span>A/B Testing Arena</span>
        </button>

        <button
          onClick={() => setActiveView("benchmark")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeView === "benchmark"
              ? "bg-[#E6EFE8] text-[#2D5A43] font-semibold shadow-xs border border-[#C5DEC9]"
              : "hover:bg-[#EBE4D8] text-[#4A6354] hover:text-[#1A2E24]"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#2D5A43]" />
          <span className="flex-1 text-left">Benchmark Suite</span>
          <span className="text-[10px] bg-[#E3EFE7] text-[#2D5A43] border border-[#C5DEC9] px-1.5 py-0.5 rounded-full font-mono font-medium">
            100 Tests
          </span>
        </button>

        <button
          onClick={() => setActiveView("settings")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeView === "settings"
              ? "bg-[#E6EFE8] text-[#2D5A43] font-semibold shadow-xs border border-[#C5DEC9]"
              : "hover:bg-[#EBE4D8] text-[#4A6354] hover:text-[#1A2E24]"
          }`}
        >
          <Settings className="w-4 h-4 text-[#2D5A43]" />
          <span>Configuration & API</span>
        </button>
      </nav>

      {/* History Section */}
      <div className="flex-1 flex flex-col min-h-0 mt-3 px-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2DACF]">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#4A6354]">
            <History className="w-3.5 h-3.5 text-[#2D5A43]" />
            <span className="font-semibold">Prompt History</span>
            <span className="text-[10px] text-[#788E81] font-mono">({history.length})</span>
          </div>
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`p-1 rounded-lg hover:bg-[#E8DFC8] transition-colors cursor-pointer ${
              favoriteOnly ? "text-amber-600" : "text-[#889E91]"
            }`}
            title="Filter Favorites"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* History Search */}
        <div className="relative mt-2 mb-2">
          <Search className="w-3.5 h-3.5 text-[#788E81] absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search saved optimizations..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#DACFBF] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1A2E24] placeholder-[#889E91] focus:outline-none focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43]"
          />
        </div>

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {filteredHistory.length === 0 ? (
            <div className="p-4 text-center text-[#788E81] text-xs">
              No prompt optimizations found.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className="group relative p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#E2DACF] hover:border-[#2D5A43] shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs text-[#203328] font-medium line-clamp-2 leading-relaxed">
                    {item.raw_prompt}
                  </p>
                  <button
                    onClick={(e) => onToggleFavorite(item.id, e)}
                    className={`p-0.5 rounded transition-colors ${
                      item.is_favorite ? "text-amber-500" : "text-[#B0C0B6] hover:text-amber-500"
                    }`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-[#557162] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-[#F0EBE1] text-[#2D5A43] font-medium border border-[#E0D5C3]">
                    {item.target_model}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#2D5A43] font-bold bg-[#E6EFE8] px-1 rounded">
                      -{item.savings_percent.toFixed(0)}%
                    </span>
                    <span className="text-[#788E81]">
                      {item.optimized_tokens} tok
                    </span>
                    <button
                      onClick={(e) => onDeleteHistory(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-opacity p-0.5"
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
      <div className="p-3 border-t border-[#E2DACF] bg-[#EDE6DC] text-[11px] text-[#4A6354] flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43]" />
          <span>7 Agents Active</span>
        </div>
        <span className="font-mono text-[10px] text-[#2D5A43] font-semibold bg-[#DDE9E0] px-1.5 py-0.5 rounded">
          Local BPE Ready
        </span>
      </div>
    </aside>
  );
};
