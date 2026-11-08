import re
import json
import logging
from typing import Optional, Dict
from app.models.schemas import TaskClassification, IntentAnalysis
from app.providers.base import BaseLLMProvider

logger = logging.getLogger(__name__)

CATEGORIES = [
    "Coding and software engineering",
    "Mathematical reasoning",
    "Research and analysis",
    "Creative writing",
    "Education and tutoring",
    "Data analysis",
    "Business and strategy",
    "Image generation",
    "AI/ML engineering",
    "General-purpose tasks"
]

CATEGORY_STRATEGY_MAP = {
    "Coding and software engineering": "Structured output prompting",
    "Mathematical reasoning": "Decomposition prompting",
    "Research and analysis": "Context-aware prompting",
    "Creative writing": "Role-based prompting",
    "Education and tutoring": "Few-shot prompting",
    "Data analysis": "Constraint-based prompting",
    "Business and strategy": "Role-based prompting",
    "Image generation": "Structured output prompting",
    "AI/ML engineering": "Constraint-based prompting",
    "General-purpose tasks": "Zero-shot prompting"
}

class TaskClassifierAgent:
    """Agent 2: Classifies the prompt into 10 key categories and maps to recommended strategy."""

    SYSTEM_PROMPT = f"""You are the Task Classification Agent for PROMPTX.
Analyze the prompt and its intent. Classify into exactly one primary category from:
{json.dumps(CATEGORIES, indent=2)}

Also select a secondary category if applicable, a confidence score (0.0 to 1.0), and the recommended prompting strategy.
Return strictly valid JSON matching this schema:
{{
  "primary_category": "...",
  "secondary_category": "...",
  "confidence": 0.95,
  "recommended_strategy": "...",
  "reason": "..."
}}"""

    async def classify(self, raw_prompt: str, intent: IntentAnalysis, provider: Optional[BaseLLMProvider] = None) -> TaskClassification:
        if provider and provider.is_available():
            try:
                response_text = await provider.generate(
                    prompt=f"Prompt:\n\"{raw_prompt}\"\n\nIntent Objective:\n{intent.objective}",
                    system_prompt=self.SYSTEM_PROMPT,
                    temperature=0.1
                )
                json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group(0))
                    return TaskClassification(**data)
            except Exception as e:
                logger.warning(f"Provider failed for TaskClassifier, falling back to heuristic: {e}")

        return self._heuristic_classify(raw_prompt, intent)

    def _heuristic_classify(self, raw_prompt: str, intent: IntentAnalysis) -> TaskClassification:
        text = f"{raw_prompt} {intent.objective} {intent.desired_output}".lower()

        scores: Dict[str, int] = {cat: 0 for cat in CATEGORIES}

        # Scoring heuristics
        coding_signals = ["code", "function", "script", "api", "bug", "refactor", "class", "async", "typescript", "python", "javascript", "sql", "git", "docker", "endpoint", "debug"]
        for s in coding_signals:
            if s in text:
                scores["Coding and software engineering"] += 3

        math_signals = ["calculate", "formula", "proof", "math", "equation", "solve", "probability", "derivative", "integral", "matrix", "algebra", "theorem"]
        for s in math_signals:
            if s in text:
                scores["Mathematical reasoning"] += 3

        ml_signals = ["pytorch", "tensorflow", "transformer", "embedding", "llm", "fine-tune", "neural", "hyperparameter", "dataset", "agent", "weights", "model architecture"]
        for s in ml_signals:
            if s in text:
                scores["AI/ML engineering"] += 4

        data_signals = ["dataset", "dataframe", "pandas", "aggregate", "csv", "sql query", "chart", "metrics", "analytics", "statistics", "trend", "pivot"]
        for s in data_signals:
            if s in text:
                scores["Data analysis"] += 3

        research_signals = ["literature", "survey", "cite", "paper", "investigate", "history", "compare sources", "analysis of", "state of the art", "deep dive"]
        for s in research_signals:
            if s in text:
                scores["Research and analysis"] += 3

        creative_signals = ["story", "narrative", "poem", "script", "character", "fiction", "novel", "dialogue", "metaphor", "worldbuilding"]
        for s in creative_signals:
            if s in text:
                scores["Creative writing"] += 3

        education_signals = ["explain", "teach", "tutor", "learn", "concept", "beginner", "lesson", "curriculum", "eli5", "analogy"]
        for s in education_signals:
            if s in text:
                scores["Education and tutoring"] += 2

        business_signals = ["roi", "kpi", "market", "business", "gtm", "pitch", "strategy", "competitor", "pricing", "stakeholder", "revenue"]
        for s in business_signals:
            if s in text:
                scores["Business and strategy"] += 3

        image_signals = ["midjourney", "stable diffusion", "dall-e", "photorealistic", "render", "aspect ratio", "--ar", "4k resolution", "lighting", "unreal engine"]
        for s in image_signals:
            if s in text:
                scores["Image generation"] += 4

        # Pick top category
        sorted_cats = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        primary = sorted_cats[0][0]
        secondary = sorted_cats[1][0] if sorted_cats[1][1] > 0 else None

        if sorted_cats[0][1] == 0:
            primary = "General-purpose tasks"

        strategy = CATEGORY_STRATEGY_MAP.get(primary, "Zero-shot prompting")
        confidence = 0.94 if sorted_cats[0][1] >= 3 else 0.85

        return TaskClassification(
            primary_category=primary,
            secondary_category=secondary,
            confidence=confidence,
            recommended_strategy=strategy,
            reason=f"Detected high density of domain signals matching {primary} domain patterns."
        )
