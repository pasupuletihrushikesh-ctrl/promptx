"use client";

import React, { useState, useEffect } from "react";
import { X, FileCode2, Plus, Sparkles, Tag, ArrowRight } from "lucide-react";
import { PromptTemplate } from "@/types/promptx";
import { fetchTemplates, createTemplate } from "@/lib/api";

interface TemplatesModalProps {
  onClose: () => void;
  onSelectTemplate: (templateText: string, model: string) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  onClose,
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Coding and software engineering");
  const [newDescription, setNewDescription] = useState("");
  const [newTemplate, setNewTemplate] = useState("");

  useEffect(() => {
    fetchTemplates().then(setTemplates);
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newTemplate.trim()) return;
    const created = await createTemplate({
      title: newTitle,
      category: newCategory,
      description: newDescription,
      template: newTemplate,
      target_model: "gpt-4o",
      tags: ["custom"],
    });
    setTemplates([...templates, created]);
    setShowCreate(false);
    setNewTitle("");
    setNewDescription("");
    setNewTemplate("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#0f121d] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        {/* Header */}
        <div className="p-4 px-6 border-b border-zinc-800 flex items-center justify-between bg-[#131726]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Prompt Templates Library
              </h3>
              <p className="text-xs text-zinc-400">
                Pre-calibrated prompts engineered for high output quality and optimal token consumption
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 text-xs border border-cyan-500/40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showCreate ? "Cancel" : "Create Template"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {showCreate && (
            <div className="p-4 rounded-xl bg-[#141829] border border-cyan-500/40 space-y-3">
              <h4 className="text-xs font-semibold text-white">Create Custom Template</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Microservice Go Boilerplate"
                    className="w-full bg-[#0a0c12] border border-zinc-800 rounded-lg p-2 text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#0a0c12] border border-zinc-800 rounded-lg p-2 text-zinc-200"
                  >
                    <option value="Coding and software engineering">Coding and software engineering</option>
                    <option value="Mathematical reasoning">Mathematical reasoning</option>
                    <option value="Research and analysis">Research and analysis</option>
                    <option value="Data analysis">Data analysis</option>
                    <option value="Business and strategy">Business and strategy</option>
                  </select>
                </div>
              </div>
              <div className="text-xs">
                <label className="block text-zinc-400 mb-1">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Short description of what this template optimizes..."
                  className="w-full bg-[#0a0c12] border border-zinc-800 rounded-lg p-2 text-zinc-200"
                />
              </div>
              <div className="text-xs">
                <label className="block text-zinc-400 mb-1">Template Prompt</label>
                <textarea
                  rows={3}
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  placeholder="Template text with optional {placeholders}..."
                  className="w-full bg-[#0a0c12] border border-zinc-800 rounded-lg p-2 text-zinc-200 font-mono"
                />
              </div>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold text-xs cursor-pointer"
              >
                Save Template
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-4 rounded-xl bg-[#141829] border border-zinc-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-cyan-400 border border-zinc-700">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {tpl.target_model}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-2">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {tpl.description}
                  </p>
                  <div className="mt-3 p-2.5 rounded-lg bg-black/40 border border-zinc-800/80 text-[11px] font-mono text-zinc-300 line-clamp-3">
                    {tpl.template}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <Tag className="w-3 h-3" />
                    <span>{tpl.tags.join(", ") || "prompt"}</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectTemplate(tpl.template, tpl.target_model);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
