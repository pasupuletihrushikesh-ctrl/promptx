import re
from typing import List, Tuple, Dict, Any, Optional
from app.models.schemas import TokenOptimizationTrace, IntentAnalysis
from app.tokenizers.tokenizer_service import tokenizer_service

# Conversational filler phrases and redundant tokens to prune
REDUNDANT_PATTERNS = [
    (r"\b(hello|hi|hey|good\s+morning|good\s+evening|dear\s+ai|please|kindly)\b[,!.]*", ""),
    (r"\b(i\s+would\s+like\s+you\s+to|i\s+want\s+you\s+to|can\s+you\s+please|could\s+you\s+please|would\s+you\s+be\s+able\s+to)\b", ""),
    (r"\b(i\s+am\s+looking\s+for|i\s+need\s+help\s+with|help\s+me\s+to|assist\s+me\s+in)\b", ""),
    (r"\b(it\s+is\s+very\s+important\s+that\s+you|make\s+sure\s+that\s+you|ensure\s+that\s+you|be\s+sure\s+to)\b", "Ensure"),
    (r"\b(in\s+order\s+to)\b", "to"),
    (r"\b(due\s+to\s+the\s+fact\s+that)\b", "because"),
    (r"\b(at\s+the\s+present\s+time|at\s+this\s+point\s+in\s+time)\b", "now"),
    (r"\b(as\s+a\s+matter\s+of\s+fact)\b", "actually"),
    (r"\b(for\s+the\s+purpose\s+of)\b", "for"),
    (r"\b(take\s+into\s+consideration)\b", "consider"),
    (r"\b(gives\s+an\s+explanation\s+of)\b", "explains"),
    (r"\b(has\s+the\s+ability\s+to)\b", "can"),
    (r"\b(let\s+me\s+know\s+if\s+you\s+have\s+any\s+questions|thank\s+you\s+in\s+advance|thanks\s+a\s+lot|thanks)\b[.!]*", ""),
    (r"\b(do\s+your\s+best|give\s+a\s+good\s+answer|provide\s+a\s+comprehensive\s+and\s+detailed\s+response)\b[.!]*", "")
]

class TokenOptimizerAgent:
    """Agent 4: Central Token Optimization Engine performing semantic compression and redundancy pruning."""

    def optimize(
        self,
        text: str,
        target_model: str = "gpt-4o",
        mode: str = "BALANCED",
        preserve_terms: Optional[List[str]] = None,
        intent: Optional[IntentAnalysis] = None
    ) -> Tuple[str, TokenOptimizationTrace]:
        preserve_terms = preserve_terms or []
        original_tokens = tokenizer_service.count_tokens(text, target_model)
        
        removed_redundancies: List[str] = []
        consolidated_phrases: List[str] = []
        deduplicated_context: List[str] = []
        preserved_constraints: List[str] = []

        # Step 1: Detect and preserve exact terms with temporary masks
        masked_text = text
        token_masks: Dict[str, str] = {}
        for idx, term in enumerate(preserve_terms):
            if term.lower() in masked_text.lower():
                mask = f"__PRESERVE_TERM_{idx}__"
                token_masks[mask] = term
                # Case-insensitive replace for mask
                pattern = re.compile(re.escape(term), re.IGNORECASE)
                masked_text = pattern.sub(mask, masked_text)
                preserved_constraints.append(f"Preserved exact term: '{term}'")

        if intent and intent.constraints:
            for constraint in intent.constraints:
                preserved_constraints.append(f"Preserved constraint: {constraint}")

        # Step 2: Unnecessary phrase removal & conversational pruning
        compressed = masked_text
        for pattern, replacement in REDUNDANT_PATTERNS:
            matches = re.findall(pattern, compressed, re.IGNORECASE)
            if matches:
                for m in matches:
                    matched_str = m[0] if isinstance(m, tuple) else m
                    if matched_str and matched_str.strip():
                        removed_redundancies.append(f"Pruned conversational fluff: '{matched_str.strip()}'")
                compressed = re.sub(pattern, replacement, compressed, flags=re.IGNORECASE)

        # Step 3: Sentence-level Deduplication
        sentences = [s.strip() for s in re.split(r'(?<=[.!?\n])\s+', compressed) if s.strip()]
        seen_stems = set()
        unique_sentences = []
        for s in sentences:
            # Simple stem normalization for deduplication
            stem = re.sub(r'[^a-zA-Z0-9]', '', s.lower())[:30]
            if stem and stem in seen_stems and len(s) > 15:
                deduplicated_context.append(f"Removed duplicate sentence: '{s[:40]}...'")
                continue
            if stem:
                seen_stems.add(stem)
            unique_sentences.append(s)

        compressed = " ".join(unique_sentences)

        # Step 4: Semantic compression & whitespace consolidation
        # Clean extra spaces, newlines, duplicate punctuation
        compressed = re.sub(r'[ \t]+', ' ', compressed)
        compressed = re.sub(r'\n{3,}', '\n\n', compressed)
        compressed = re.sub(r'([.?!]){2,}', r'\1', compressed)
        compressed = compressed.strip()

        # Step 5: Restore masked terms
        for mask, original in token_masks.items():
            compressed = compressed.replace(mask, original)

        compressed_tokens = tokenizer_service.count_tokens(compressed, target_model)
        
        # Calculate reduction percentage
        if original_tokens > 0:
            reduction_percentage = max(0.0, round(((original_tokens - compressed_tokens) / original_tokens) * 100, 2))
        else:
            reduction_percentage = 0.0

        trace = TokenOptimizationTrace(
            original_tokens=original_tokens,
            compressed_tokens=compressed_tokens,
            reduction_percentage=reduction_percentage,
            removed_redundancies=removed_redundancies[:8],
            consolidated_phrases=consolidated_phrases[:8],
            deduplicated_context=deduplicated_context[:8],
            preserved_constraints=preserved_constraints[:8]
        )

        return compressed, trace
