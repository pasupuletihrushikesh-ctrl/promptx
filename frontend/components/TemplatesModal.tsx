"use client";

import React, { useState, useEffect } from "react";
import { X, FileCode2, Plus, Tag, ArrowRight } from "lucide-react";
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
    <div className="fixed inset-0 z-50 bg-[#1A2621]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#FDFBF7] border border-[#DACFBF] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#203328]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#E8DFD0] flex items-center justify-between bg-[#F4EFEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6EFE8] text-[#2D5A43] flex items-center justify-center border border-[#C5DEC9]">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A2E24] tracking-wide font-serif">
                Prompt Templates Library
              </h3>
              <p className="text-xs text-[#557162]">
                Pre-calibrated prompts engineered for high output quality and optimal token consumption
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6EFE8] hover:bg-[#D5E5D9] text-[#2D5A43] text-xs font-semibold border border-[#C5DEC9] cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showCreate ? "Cancel" : "Create Template"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6C8576] hover:text-[#1A2E24] hover:bg-[#EBE4D8] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {showCreate && (
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#2D5A43] space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-[#1A2E24] font-serif">Create Custom Template</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#557162] font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Microservice Go Boilerplate"
                    className="w-full bg-[#FAF7F2] border border-[#DACFBF] rounded-xl p-2.5 text-[#1A2E24]"
                  />
                </div>
                <div>
                  <label className="block text-[#557162] font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DACFBF] rounded-xl p-2.5 text-[#1A2E24]"
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
                <label className="block text-[#557162] font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Short description of what this template optimizes..."
                  className="w-full bg-[#FAF7F2] border border-[#DACFBF] rounded-xl p-2.5 text-[#1A2E24]"
                />
              </div>
              <div className="text-xs">
                <label className="block text-[#557162] font-semibold mb-1">Template Prompt</label>
                <textarea
                  rows={3}
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  placeholder="Template text with optional {placeholders}..."
                  className="w-full bg-[#FAF7F2] border border-[#DACFBF] rounded-xl p-2.5 text-[#1A2E24] font-mono"
                />
              </div>
              <button
                onClick={handleCreate}
                className="px-5 py-2 rounded-xl bg-[#2D5A43] hover:bg-[#234735] text-[#F8F6F0] font-semibold text-xs cursor-pointer shadow-xs"
              >
                Save Template
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DACFBF] hover:border-[#2D5A43] transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6EFE8] text-[#2D5A43] font-semibold border border-[#C5DEC9]">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] text-[#788E81] font-mono">
                      {tpl.target_model}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1A2E24] mt-2 font-serif">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-[#557162] mt-1 line-clamp-2">
                    {tpl.description}
                  </p>
                  <div className="mt-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD0] text-[11px] font-mono text-[#354B3E] line-clamp-3">
                    {tpl.template}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DFD0] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#788E81]">
                    <Tag className="w-3 h-3 text-[#2D5A43]" />
                    <span>{tpl.tags.join(", ") || "prompt"}</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectTemplate(tpl.template, tpl.target_model);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs text-[#2D5A43] hover:text-[#1A2E24] font-semibold cursor-pointer"
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
