from typing import Dict, Any
from app.models.schemas import ModelInfo, ModelFamily
from app.models.registry import get_model_info

class ModelAdapterEngine:
    """Agent 7: Adapts prompts specifically to the nuances, tag preferences, and architecture of the target LLM."""

    def adapt(self, prompt: str, target_model: str) -> str:
        model_info: ModelInfo = get_model_info(target_model)

        # 1. Anthropic Claude Adaptation -> XML tagging structure
        if model_info.family == ModelFamily.CLAUDE:
            return self._adapt_for_claude(prompt)

        # 2. OpenAI o1 / o3-mini Reasoning Models Adaptation
        elif model_info.family == ModelFamily.OPENAI and ("o1" in target_model.lower() or "o3" in target_model.lower()):
            return self._adapt_for_reasoning_models(prompt)

        # 3. Google Gemini Adaptation
        elif model_info.family == ModelFamily.GEMINI:
            return self._adapt_for_gemini(prompt)

        # 4. DeepSeek R1 Adaptation
        elif model_info.family == ModelFamily.DEEPSEEK and "r1" in target_model.lower():
            return self._adapt_for_deepseek_r1(prompt)

        # 5. Llama / Qwen Open-Weights Adaptation -> Clean markdown sections
        elif model_info.family in [ModelFamily.LLAMA, ModelFamily.QWEN]:
            return self._adapt_for_open_instruct(prompt)

        # 6. Default (OpenAI GPT-4o, standard LLMs)
        return prompt

    def _adapt_for_claude(self, prompt: str) -> str:
        """Claude thrives with XML tags separating instructions, context, and output criteria."""
        lines = prompt.split("\n")
        objective_lines = []
        requirement_lines = []
        format_lines = []
        general_lines = []

        current_section = "general"
        for line in lines:
            line_str = line.strip()
            if "**Objective**" in line_str or "# Role & Mission" in line_str:
                current_section = "objective"
                objective_lines.append(line_str)
            elif "**Requirements**" in line_str or "## Technical & Execution Constraints" in line_str:
                current_section = "requirements"
            elif "**Output Format**" in line_str or "## Output Specifications" in line_str:
                current_section = "format"
                format_lines.append(line_str)
            else:
                if current_section == "objective":
                    objective_lines.append(line_str)
                elif current_section == "requirements":
                    requirement_lines.append(line_str)
                elif current_section == "format":
                    format_lines.append(line_str)
                else:
                    general_lines.append(line_str)

        xml_output = []
        if objective_lines or general_lines:
            xml_output.append("<instructions>")
            xml_output.extend(objective_lines if objective_lines else general_lines)
            xml_output.append("</instructions>")
        
        if requirement_lines:
            xml_output.append("<guidelines>")
            xml_output.extend(requirement_lines)
            xml_output.append("</guidelines>")

        if format_lines:
            xml_output.append("<output_format>")
            xml_output.extend(format_lines)
            xml_output.append("</output_format>")

        return "\n".join(xml_output) if len(xml_output) > 3 else prompt

    def _adapt_for_reasoning_models(self, prompt: str) -> str:
        """Reasoning models (o1, o3-mini) reason autonomously; strip unnecessary 'think step by step' directives."""
        adapted = prompt
        # Remove manual chain of thought instructions since the model reasons natively
        adapted = adapted.replace("Think step by step and ", "")
        adapted = adapted.replace("Let's think step by step.", "")
        adapted = adapted.replace("- Verify intermediate calculation steps before stating the final result.", "")
        return adapted.strip()

    def _adapt_for_gemini(self, prompt: str) -> str:
        """Gemini prefers clean hierarchical Markdown directives."""
        return prompt.strip()

    def _adapt_for_deepseek_r1(self, prompt: str) -> str:
        """DeepSeek R1 performs best with direct problem formulation without complex persona bloat."""
        adapted = prompt
        if adapted.startswith("# Role & Mission\nAct as a specialist"):
            # Simplify role header to direct task
            lines = adapted.split("\n")
            task_lines = [l for l in lines if not l.startswith("# Role & Mission") and not l.startswith("Act as a specialist")]
            adapted = "\n".join(task_lines).strip()
        return adapted

    def _adapt_for_open_instruct(self, prompt: str) -> str:
        """Llama 3.3 and Qwen 2.5 perform reliably with standard Markdown sections."""
        return prompt.strip()
