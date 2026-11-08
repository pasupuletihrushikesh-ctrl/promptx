"use client";

import React, { useState } from "react";
import { X, Settings, Key, Server, Save, Check } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, save to localStorage or backend configuration
    localStorage.setItem("promptx_openai_key", openaiKey);
    localStorage.setItem("promptx_anthropic_key", anthropicKey);
    localStorage.setItem("promptx_gemini_key", geminiKey);
    localStorage.setItem("promptx_ollama_url", ollamaUrl);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0f121d] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        {/* Header */}
        <div className="p-4 px-6 border-b border-zinc-800 flex items-center justify-between bg-[#131726]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Engine Configuration & Provider Keys
              </h3>
              <p className="text-xs text-zinc-400">
                Configure live LLM providers or use local offline BPE engine with zero external API costs
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
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-[11px] leading-relaxed">
            PROMPTX features a fully autonomous local heuristic and BPE tokenizer engine. It functions out-of-the-box with zero paid API keys! You may optionally configure API keys below for live frontier model generation.
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-zinc-400" /> OpenAI API Key
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-[#141829] border border-zinc-800 rounded-lg p-2.5 text-zinc-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-zinc-400" /> Anthropic API Key
            </label>
            <input
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-[#141829] border border-zinc-800 rounded-lg p-2.5 text-zinc-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-zinc-400" /> Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#141829] border border-zinc-800 rounded-lg p-2.5 text-zinc-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-zinc-400" /> Ollama Local Endpoint URL
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full bg-[#141829] border border-zinc-800 rounded-lg p-2.5 text-zinc-200 font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-zinc-800 flex justify-end bg-[#131726]">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-900/30 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Configuration Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
