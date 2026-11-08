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
    <div className="fixed inset-0 z-50 bg-[#1A2621]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#FDFBF7] border border-[#DACFBF] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#203328]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#E8DFD0] flex items-center justify-between bg-[#F4EFEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6EFE8] text-[#2D5A43] flex items-center justify-center border border-[#C5DEC9]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A2E24] tracking-wide font-serif">
                Engine Configuration & Provider Keys
              </h3>
              <p className="text-xs text-[#557162]">
                Configure live LLM providers or use local offline BPE engine with zero external API costs
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
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#E6EFE8] border border-[#C5DEC9] text-[#2D5A43] text-[11px] leading-relaxed font-medium">
            PROMPTX features a fully autonomous local heuristic and subword BPE tokenizer engine. It functions out-of-the-box with zero paid API keys! You may optionally configure API keys below for live frontier model generation.
          </div>

          <div>
            <label className="block text-[#1A2E24] font-semibold mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#2D5A43]" /> OpenAI API Key
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-[#FFFFFF] border border-[#DACFBF] rounded-xl p-3 text-[#1A2E24] font-mono shadow-xs"
            />
          </div>

          <div>
            <label className="block text-[#1A2E24] font-semibold mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#2D5A43]" /> Anthropic API Key
            </label>
            <input
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-[#FFFFFF] border border-[#DACFBF] rounded-xl p-3 text-[#1A2E24] font-mono shadow-xs"
            />
          </div>

          <div>
            <label className="block text-[#1A2E24] font-semibold mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#2D5A43]" /> Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#FFFFFF] border border-[#DACFBF] rounded-xl p-3 text-[#1A2E24] font-mono shadow-xs"
            />
          </div>

          <div>
            <label className="block text-[#1A2E24] font-semibold mb-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#2D5A43]" /> Ollama Local Endpoint URL
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full bg-[#FFFFFF] border border-[#DACFBF] rounded-xl p-3 text-[#1A2E24] font-mono shadow-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#E8DFD0] flex justify-end bg-[#F4EFEA]">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A43] hover:bg-[#234735] text-[#F8F6F0] font-semibold text-xs shadow-md shadow-[#2D5A43]/20 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-[#C5DEC9]" />
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
