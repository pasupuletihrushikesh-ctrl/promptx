import re
import json
import logging
from typing import Optional, List
from app.models.schemas import IntentAnalysis
from app.providers.base import BaseLLMProvider

logger = logging.getLogger(__name__)

GREETINGS_PATTERN = r"^(hello|hi|hey|good\s+morning|good\s+afternoon|good\s+evening|dear\s+ai|dear\s+assistant|i\s+was\s+wondering\s+if\s+you\s+could|can\s+you\s+please|could\s+you\s+please|would\s+you\s+please|please\s+kindly|please|kindly)\b[,!.\s]*"

class IntentAgent:
    """Agent 1: Understands raw prompt, extracts objective, audience, constraints, ambiguities."""
    
    SYSTEM_PROMPT = """You are the Intent Understanding Agent for PROMPTX.
Analyze the user's raw prompt deeply and extract:
1. Primary Objective (concise statement of what user really wants)
2. Target Audience
3. Relevant Context
4. Constraints (technical, formatting, length, tone)
5. Desired Output Format
6. Missing Information (critical gaps)
7. Ambiguity Detected (boolean)
8. Clarification Needed (boolean)
9. Reasoning summary

Return strictly valid JSON:
{
  "objective": "...",
  "audience": "...",
  "context": "...",
  "constraints": ["..."],
  "desired_output": "...",
  "missing_information": ["..."],
  "ambiguity_detected": false,
  "clarification_needed": false,
  "reasoning": "..."
}"""

    async def analyze(self, raw_prompt: str, provider: Optional[BaseLLMProvider] = None) -> IntentAnalysis:
        if provider and provider.is_available():
            try:
                response_text = await provider.generate(
                    prompt=f"Raw Prompt to Analyze:\n\"\"\"{raw_prompt}\"\"\"",
                    system_prompt=self.SYSTEM_PROMPT,
                    temperature=0.2
                )
                json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group(0))
                    return IntentAnalysis(**data)
            except Exception as e:
                logger.warning(f"Provider failed for IntentAgent, falling back to heuristic: {e}")

        return self._heuristic_analyze(raw_prompt)

    def _heuristic_analyze(self, raw_prompt: str) -> IntentAnalysis:
        prompt_clean = raw_prompt.strip()
        lower = prompt_clean.lower()
        
        # Split sentences and find the core objective sentence (skipping pure pleasantries)
        sentences = [s.strip() for s in re.split(r'(?<=[.!?\n])\s+', prompt_clean) if s.strip()]
        obj_candidate = ""
        for s in sentences:
            cleaned_s = re.sub(GREETINGS_PATTERN, "", s, flags=re.IGNORECASE).strip()
            # If after stripping greetings there's substance left
            if len(cleaned_s.split()) >= 3 and not any(filler in cleaned_s.lower() for filler in ["thank you", "thanks", "let me know"]):
                obj_candidate = cleaned_s
                break
        
        if not obj_candidate:
            obj_candidate = prompt_clean.split("\n")[0].strip()

        # Clean remaining conversational filler
        objective = re.sub(r"^(i\s+would\s+like\s+you\s+to\s+|i\s+want\s+you\s+to\s+|help\s+me\s+to\s+|help\s+me\s+|could\s+you\s+|assist\s+me\s+in\s+|please\s+kindly\s+help\s+me\s+|please\s+help\s+me\s+|please\s+|kindly\s+)", "", obj_candidate, flags=re.IGNORECASE).strip()
        if len(objective) > 140:
            objective = objective[:137] + "..."

        # Audience detection
        audience = "General technical / professional audience"
        if any(w in lower for w in ["beginner", "eli5", "explain like i'm 5", "kid", "newbie"]):
            audience = "Beginner / Non-technical audience"
        elif any(w in lower for w in ["executive", "ceo", "cto", "board", "leadership"]):
            audience = "Executive / Leadership audience"
        elif any(w in lower for w in ["developer", "engineer", "coder", "programmer"]):
            audience = "Software Engineers and Architects"

        # Constraints
        constraints: List[str] = []
        if re.search(r"\b(under|maximum|max|limit|no more than)\s+\d+\s*(words|tokens|lines|characters)", lower):
            match = re.search(r"\b(under|maximum|max|limit|no more than)\s+\d+\s*(words|tokens|lines|characters)", lower)
            if match:
                constraints.append(f"Length restriction: {match.group(0)}")
        if "json" in lower:
            constraints.append("Must produce strictly valid JSON")
        if "markdown" in lower or "bullet" in lower:
            constraints.append("Format as structured Markdown")
        if any(w in lower for w in ["edge cases", "boundary check", "error handling"]):
            constraints.append("Handle edge cases and validation")
        for lang in ["python", "typescript", "javascript", "rust", "go", "sql", "c++", "java"]:
            if lang in lower:
                constraints.append(f"Language: {lang.title()}")

        # Desired output
        desired_output = "Structured direct response"
        if "json" in lower:
            desired_output = "Valid RFC-8259 JSON object"
        elif "table" in lower or "csv" in lower:
            desired_output = "Tabular / Markdown table format"
        elif any(w in lower for w in ["code", "function", "script", "program"]):
            desired_output = "Production-ready executable code block"

        missing_info: List[str] = []
        ambiguity = len(prompt_clean.split()) < 5
        if ambiguity:
            missing_info.append("Prompt is exceptionally terse; missing explicit constraints, scope, and expected format.")

        context = f"Input query containing {len(prompt_clean.split())} words."
        reasoning = f"Extracted core objective '{objective}' with {len(constraints)} constraints."

        return IntentAnalysis(
            objective=objective,
            audience=audience,
            context=context,
            constraints=constraints,
            desired_output=desired_output,
            missing_information=missing_info,
            ambiguity_detected=ambiguity,
            clarification_needed=False,
            reasoning=reasoning
        )
