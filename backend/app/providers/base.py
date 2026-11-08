from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        """Generate a response given a prompt and optional system prompt."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if provider credentials/endpoint are reachable."""
        pass
