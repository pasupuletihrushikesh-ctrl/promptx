import re
import json
import logging
from typing import Optional, List
from app.models.schemas import StrategySelection, TaskClassification, IntentAnalysis
from app.providers.base import BaseLLMProvider

logger = logging.getLogger(__name__)

AVAILABLE_STRATEGIES = [
    "Zero-shot prompting",
    "Few-shot prompting",
    "Role-based prompting",
    "Structured output prompting",
    "Constraint-based prompting",
    "Context-aware prompting",
    "Decomposition prompting",
    "Retrieval-aware prompting",
    "Tool-use prompting"
]

class StrategyEngineAgent:
    """Agent 3: Evaluates the task and intent to select the leanest, most effective prompting strategy."""

    SYSTEM_PROMPT = f"""You are the Prompt Strategy Engine for PROMPTX.
Analyze the user prompt, intent, and classification.
Select the optimal prompting technique from:
{json.dumps(AVAILABLE_STRATEGIES, indent=2)}

Crucial rule: DO NOT apply unnecessary techniques. Choose the most direct, high-leverage strategy.
Return strictly valid JSON:
{{
  "strategy": "...",
  "sub_techniques": ["..."],
  "structure_type": "Markdown" | "XML" | "Delimited" | "Direct",
  "reason": "..."
}}"""

    async def select_strategy(
        self,
        raw_prompt: str,
        intent: IntentAnalysis,
        classification: TaskClassification,
        provider: Optional[BaseLLMProvider] = None
    ) -> StrategySelection:
        if provider and provider.is_available():
            try:
                response_text = await provider.generate(
                    prompt=f"Prompt:\n\"{raw_prompt}\"\n\nCategory: {classification.primary_category}\nOutput: {intent.desired_output}",
                    system_prompt=self.SYSTEM_PROMPT,
                    temperature=0.1
                )
                json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group(0))
                    return StrategySelection(**data)
            except Exception as e:
                logger.warning(f"Provider failed for StrategyEngine, falling back to heuristic: {e}")

        return self._heuristic_select(raw_prompt, intent, classification)

    def _heuristic_select(
        self,
        raw_prompt: str,
        intent: IntentAnalysis,
        classification: TaskClassification
    ) -> StrategySelection:
        prompt_lower = raw_prompt.lower()
        cat = classification.primary_category
        sub_techniques = []

        if cat == "Coding and software engineering":
            strategy = "Structured output prompting"
            sub_techniques = ["Type annotation enforcement", "Error handling clause", "No filler boilerplate"]
            structure_type = "Markdown"
            reason = "Coding tasks require precise output schemas, signatures, and minimal unexecutable text."

        elif cat == "Mathematical reasoning":
            strategy = "Decomposition prompting"
            sub_techniques = ["Step-by-step state verification", "Direct final answer boxing"]
            structure_type = "Direct"
            reason = "Complex reasoning requires step breakdown to avoid arithmetic hallucination."

        elif cat == "Research and analysis":
            strategy = "Context-aware prompting"
            sub_techniques = ["Multi-perspective synthesis", "Source attribution"]
            structure_type = "Markdown"
            reason = "Analytical queries benefit from contextual scoping and balanced evaluation."

        elif cat == "Creative writing":
            strategy = "Role-based prompting"
            sub_techniques = ["Tone anchoring", "Atmospheric constraints"]
            structure_type = "Direct"
            reason = "Creative tasks flourish with explicit persona, voice, and thematic guidelines."

        elif "json" in prompt_lower or "schema" in prompt_lower:
            strategy = "Structured output prompting"
            sub_techniques = ["Strict JSON schema", "No conversational preamble"]
            structure_type = "Delimited"
            reason = "Strict JSON requires delimiter isolation and schema specification."

        elif len(intent.constraints) >= 3:
            strategy = "Constraint-based prompting"
            sub_techniques = ["Negative constraint guards", "Strict boundary checks"]
            structure_type = "Markdown"
            reason = "Multiple constraints require high-priority guardrails to avoid instruction drift."

        elif "step" in prompt_lower or "plan" in prompt_lower:
            strategy = "Decomposition prompting"
            sub_techniques = ["Phase demarcation", "Actionable checklists"]
            structure_type = "Markdown"
            reason = "Multi-step workflows require clear sequencing and phase boundaries."

        else:
            strategy = "Zero-shot prompting"
            sub_techniques = ["Direct command phrasing"]
            structure_type = "Direct"
            reason = "Standard task best served by clean direct instruction without unnecessary scaffolding."

        return StrategySelection(
            strategy=strategy,
            sub_techniques=sub_techniques,
            structure_type=structure_type,
            reason=reason
        )
