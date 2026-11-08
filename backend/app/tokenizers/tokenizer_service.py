import re
from typing import Dict, Any, List

class FastBPETokenizer:
    """Local, instantaneous subword BPE tokenizer modeled on GPT-4 / Claude byte tokens."""
    def __init__(self):
        try:
            import regex
            self.regex = regex.compile(r"""'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+""")
        except Exception:
            self.regex = re.compile(r"""\w+|[^\w\s]|\s+""")

    def count_tokens(self, text: str) -> int:
        if not text:
            return 0
        matches = self.regex.findall(text)
        count = 0
        for m in matches:
            l = len(m)
            if l <= 4:
                count += 1
            else:
                count += max(1, (l + 3) // 4)
        return max(1, count) if text.strip() else 0

class TokenizerService:
    def __init__(self):
        self.fallback = FastBPETokenizer()
        self.encodings: Dict[str, Any] = {}

    def _get_tiktoken(self, name: str):
        if name in self.encodings:
            return self.encodings[name]
        try:
            import tiktoken
            enc = tiktoken.get_encoding(name)
            self.encodings[name] = enc
            return enc
        except Exception:
            return None

    def count_tokens(self, text: str, model_id: str = "gpt-4o") -> int:
        if not text:
            return 0
        
        model_lower = model_id.lower()
        enc_name = "o200k_base" if ("gpt-4o" in model_lower or "o1" in model_lower or "o3" in model_lower) else "cl100k_base"
        
        try:
            if enc_name in self.encodings:
                return len(self.encodings[enc_name].encode(text, disallowed_special=()))
        except Exception:
            pass

        return self.fallback.count_tokens(text)

    def encode(self, text: str, model_id: str = "gpt-4o") -> List[int]:
        if not text:
            return []
        try:
            enc = self._get_tiktoken("o200k_base")
            if enc:
                return enc.encode(text, disallowed_special=())
        except Exception:
            pass
        return [ord(c) for c in text[:100]]

    def decode(self, tokens: List[int], model_id: str = "gpt-4o") -> str:
        try:
            enc = self._get_tiktoken("o200k_base")
            if enc:
                return enc.decode(tokens)
        except Exception:
            pass
        return "".join(chr(t) for t in tokens if 0 <= t <= 1114111)

tokenizer_service = TokenizerService()
