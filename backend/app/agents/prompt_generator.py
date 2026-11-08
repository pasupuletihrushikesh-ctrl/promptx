import re
import json
import logging
from typing import Optional, Dict
from app.models.schemas import (
    PromptVariants, IntentAnalysis, TaskClassification, StrategySelection, OptimizationMode
)
from app.providers.base import BaseLLMProvider

logger = logging.getLogger(__name__)

class PromptGeneratorAgent:
    """Agent 5: Generates three calibrated prompt variants: Balanced Optimized, Ultra-Compact, and Detailed High-Performance."""

    SYSTEM_PROMPT = """You are the Prompt Generation Agent for PROMPTX.
Your goal is to produce three distinct prompt versions preserving all essential constraints, context, and intent:
1. "optimized": Balanced, modern, professional, high-signal prompt with minimal fluff, reducing tokens while maximizing quality.
2. "compact": Ultra-compact, dense telegraphic prompt maximizing token savings while strictly retaining core constraints.
3. "detailed": Thorough high-performance prompt with clear section headers, negative constraints, and output criteria.

Return strictly valid JSON:
{
  "optimized": "...",
  "compact": "...",
  "detailed": "..."
}"""

    async def generate_variants(
        self,
        raw_prompt: str,
        cleaned_prompt: str,
        intent: IntentAnalysis,
        classification: TaskClassification,
        strategy: StrategySelection,
        mode: OptimizationMode = OptimizationMode.BALANCED,
        custom_instructions: Optional[str] = None,
        provider: Optional[BaseLLMProvider] = None
    ) -> PromptVariants:
        if provider and provider.is_available():
            try:
                context_payload = {
                    "raw_prompt": raw_prompt,
                    "cleaned_prompt": cleaned_prompt,
                    "objective": intent.objective,
                    "audience": intent.audience,
                    "constraints": intent.constraints,
                    "desired_output": intent.desired_output,
                    "category": classification.primary_category,
                    "strategy": strategy.strategy,
                    "mode": mode.value,
                    "custom_instructions": custom_instructions
                }
                response_text = await provider.generate(
                    prompt=f"Context:\n{json.dumps(context_payload, indent=2)}\n\nGenerate the three prompt variants.",
                    system_prompt=self.SYSTEM_PROMPT,
                    temperature=0.3
                )
                json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group(0))
                    return PromptVariants(
                        optimized=data.get("optimized", "").strip(),
                        compact=data.get("compact", "").strip(),
                        detailed=data.get("detailed", "").strip()
                    )
            except Exception as e:
                logger.warning(f"Provider failed in PromptGenerator, falling back to heuristic: {e}")

        return self._heuristic_generate(raw_prompt, cleaned_prompt, intent, classification, strategy, mode, custom_instructions)

    def _heuristic_generate(
        self,
        raw_prompt: str,
        cleaned_prompt: str,
        intent: IntentAnalysis,
        classification: TaskClassification,
        strategy: StrategySelection,
        mode: OptimizationMode,
        custom_instructions: Optional[str] = None
    ) -> PromptVariants:
        # Strip trailing punctuation from objective
        obj = re.sub(r'^[,\s.?!]+|[,\s.?!]+$', '', intent.objective).strip()
        # Capitalize first letter
        if obj:
            obj = obj[0].upper() + obj[1:]

        # Clean constraints
        unique_constraints = []
        for c in intent.constraints:
            c_clean = c.strip()
            if c_clean and c_clean not in unique_constraints:
                unique_constraints.append(c_clean)

        # 1. BALANCED OPTIMIZED: Clean, direct imperative, minimal tokens with maximal clarity
        opt_lines = [f"{obj}."]
        if unique_constraints:
            for c in unique_constraints:
                opt_lines.append(f"- {c}")
        if custom_instructions:
            opt_lines.append(f"- {custom_instructions}")
        if "code" in intent.desired_output.lower():
            opt_lines.append("- Output code only.")
        elif "json" in intent.desired_output.lower():
            opt_lines.append("- Output valid JSON only.")

        optimized_prompt = "\n".join(opt_lines)

        # 2. ULTRA-COMPACT: Dense, telegraphic, highest token efficiency
        constraints_str = "; ".join(unique_constraints) if unique_constraints else ""
        compact_parts = [f"{obj}."]
        if constraints_str:
            compact_parts.append(f"Reqs: {constraints_str}.")
        if custom_instructions:
            compact_parts.append(f"Note: {custom_instructions}.")
        compact_parts.append("Direct answer only.")
        compact_prompt = " ".join(compact_parts)

        # 3. DETAILED HIGH-PERFORMANCE: Structured, multi-section comprehensive guide
        detailed_lines = [
            f"# Role & Task",
            f"You are an expert specialist in {classification.primary_category}.",
            f"Task: {obj}.",
            "",
            "## Requirements & Constraints"
        ]
        if unique_constraints:
            for c in unique_constraints:
                detailed_lines.append(f"- {c}")
        else:
            detailed_lines.append("- Ensure rigorous technical accuracy.")
        detailed_lines.append("- Omit conversational preambles.")

        if custom_instructions:
            detailed_lines.append(f"- Custom requirement: {custom_instructions}")

        detailed_lines.extend([
            "",
            "## Output Format",
            f"- Format: {intent.desired_output}."
        ])

        detailed_prompt = "\n".join(detailed_lines)

        return PromptVariants(
            optimized=optimized_prompt,
            compact=compact_prompt,
            detailed=detailed_prompt
        )
