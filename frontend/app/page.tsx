"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Workspace } from "@/components/Workspace";
import { ResultPanel } from "@/components/ResultPanel";
import { DevModeModal } from "@/components/DevModeModal";
import { BatchModal } from "@/components/BatchModal";
import { TemplatesModal } from "@/components/TemplatesModal";
import { ABTestModal } from "@/components/ABTestModal";
import { BenchmarkModal } from "@/components/BenchmarkModal";
import { SettingsModal } from "@/components/SettingsModal";
import {
  OptimizationMode,
  OptimizationResponse,
  HistoryItem,
  ModelInfo,
} from "@/types/promptx";
import {
  optimizePrompt,
  fetchHistory,
  fetchHistoryItem,
  fetchModels,
  toggleFavorite,
  deleteHistoryItem,
} from "@/lib/api";

export default function Home() {
  const [activeView, setActiveView] = useState("studio");
  const [rawPrompt, setRawPrompt] = useState(
    "Hello dear AI! I was wondering if you could please kindly assist me in order to write a Python script that calculates prime numbers up to N? In order to do this, make sure that you write clean code and handle edge cases. Thank you so much in advance and let me know if you have questions!"
  );
  const [targetModel, setTargetModel] = useState("gpt-4o");
  const [mode, setMode] = useState<OptimizationMode>("BALANCED");
  const [customInstructions, setCustomInstructions] = useState("");
  const [preserveTerms, setPreserveTerms] = useState("prime numbers");
  const [devMode, setDevMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);

  // Modals state
  const [showDevModal, setShowDevModal] = useState(false);
  const [abTestInitial, setAbTestInitial] = useState<{ raw: string; opt: string } | null>(null);

  // Initial load
  useEffect(() => {
    fetchModels().then(setModels);
    fetchHistory().then(setHistory);
  }, []);

  const handleOptimize = async () => {
    if (!rawPrompt.trim()) return;
    setIsLoading(true);
    try {
      const terms = preserveTerms
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const data = await optimizePrompt({
        raw_prompt: rawPrompt,
        target_model: targetModel,
        mode: mode,
        custom_instructions: customInstructions,
        preserve_exact_terms: terms,
      });

      setResult(data);

      // Prepend to history
      const historyItem: HistoryItem = {
        id: data.id,
        raw_prompt: data.raw_prompt,
        target_model: data.target_model,
        mode: data.mode,
        raw_tokens: data.tokens.raw,
        optimized_tokens: data.tokens.optimized,
        savings_percent: data.savings_percent.optimized,
        quality_score: data.quality.overall_score,
        optimized_text: data.variants.optimized,
        is_favorite: false,
        created_at: data.created_at,
      };
      setHistory([historyItem, ...history]);

      if (devMode) {
        setShowDevModal(true);
      }
    } catch (e: any) {
      console.error("Optimization failed", e);
      alert(e.message || "Optimization failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewOptimization = () => {
    setRawPrompt("");
    setResult(null);
    setCustomInstructions("");
    setPreserveTerms("");
    setActiveView("studio");
  };

  const handleSelectHistory = async (item: HistoryItem) => {
    setRawPrompt(item.raw_prompt);
    setTargetModel(item.target_model);
    setMode((item.mode as OptimizationMode) || "BALANCED");
    setActiveView("studio");

    // Fetch full response
    const full = await fetchHistoryItem(item.id);
    if (full) {
      setResult(full);
    }
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleFavorite(id);
      setHistory(
        history.map((h) => (h.id === id ? { ...h, is_favorite: res.is_favorite } : h))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteHistoryItem(id);
      setHistory(history.filter((h) => h.id !== id));
      if (result && result.id === id) {
        setResult(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendToABTest = (raw: string, opt: string) => {
    setAbTestInitial({ raw, opt });
    setActiveView("abtest");
  };

  const handleSelectTemplate = (templateText: string, model: string) => {
    setRawPrompt(templateText);
    setTargetModel(model);
    setActiveView("studio");
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#090b10] text-zinc-100 font-sans antialiased">
      {/* Left Panel Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onNewOptimization={handleNewOptimization}
        history={history}
        onSelectHistory={handleSelectHistory}
        onToggleFavorite={handleToggleFavorite}
        onDeleteHistory={handleDeleteHistory}
      />

      {/* Main Studio Workspace and Result Panel */}
      <div className="flex-1 flex overflow-hidden">
        <Workspace
          rawPrompt={rawPrompt}
          setRawPrompt={setRawPrompt}
          targetModel={targetModel}
          setTargetModel={setTargetModel}
          mode={mode}
          setMode={setMode}
          customInstructions={customInstructions}
          setCustomInstructions={setCustomInstructions}
          preserveTerms={preserveTerms}
          setPreserveTerms={setPreserveTerms}
          devMode={devMode}
          setDevMode={setDevMode}
          onOptimize={handleOptimize}
          isLoading={isLoading}
          models={models}
        />

        <ResultPanel
          result={result}
          isLoading={isLoading}
          onSendToABTest={handleSendToABTest}
        />
      </div>

      {/* Modal Overlays */}
      {showDevModal && result && (
        <DevModeModal result={result} onClose={() => setShowDevModal(false)} />
      )}

      {activeView === "batch" && (
        <BatchModal
          onClose={() => setActiveView("studio")}
          targetModel={targetModel}
        />
      )}

      {activeView === "templates" && (
        <TemplatesModal
          onClose={() => setActiveView("studio")}
          onSelectTemplate={handleSelectTemplate}
        />
      )}

      {activeView === "abtest" && (
        <ABTestModal
          onClose={() => setActiveView("studio")}
          initialRawPrompt={abTestInitial?.raw || rawPrompt}
          initialPromptA={abTestInitial?.opt || result?.variants.optimized || ""}
          targetModel={targetModel}
        />
      )}

      {activeView === "benchmark" && (
        <BenchmarkModal onClose={() => setActiveView("studio")} />
      )}

      {activeView === "settings" && (
        <SettingsModal onClose={() => setActiveView("studio")} />
      )}
    </main>
  );
}
