import httpx
import logging
from typing import Optional, Dict, Any
from app.config import settings
from app.providers.base import BaseLLMProvider

logger = logging.getLogger(__name__)

class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        if not self.is_available():
            raise ValueError("OpenAI API key not configured")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json={
                    "model": "gpt-4o-mini",
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]


class AnthropicProvider(BaseLLMProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        if not self.is_available():
            raise ValueError("Anthropic API key not configured")
            
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        payload: Dict[str, Any] = {
            "model": "claude-3-5-haiku-20241022",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        if system_prompt:
            payload["system"] = system_prompt

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload
            )
            resp.raise_for_status()
            data = resp.json()
            return data["content"][0]["text"]


class OllamaProvider(BaseLLMProvider):
    def __init__(self, base_url: Optional[str] = None, model: str = "llama3"):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model

    def is_available(self) -> bool:
        # Check if Ollama server is running
        return True

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature}
        }
        if system_prompt:
            payload["system"] = system_prompt

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/api/generate",
                json=payload
            )
            resp.raise_for_status()
            data = resp.json()
            return data["response"]


class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        if not self.is_available():
            raise ValueError("Gemini API key not configured")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.api_key}"
        parts = []
        if system_prompt:
            parts.append({"text": f"SYSTEM INSTRUCTION: {system_prompt}\n\nUSER PROMPT: {prompt}"})
        else:
            parts.append({"text": prompt})

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                url,
                json={"contents": [{"parts": parts}], "generationConfig": {"temperature": temperature}}
            )
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]


class LLMServiceFactory:
    @staticmethod
    def get_provider(target_model: str, api_key_override: Optional[str] = None) -> Optional[BaseLLMProvider]:
        if api_key_override:
            if "claude" in target_model.lower():
                return AnthropicProvider(api_key=api_key_override)
            elif "gemini" in target_model.lower():
                return GeminiProvider(api_key=api_key_override)
            else:
                return OpenAIProvider(api_key=api_key_override)

        # Check environment configurations
        if "claude" in target_model.lower() and AnthropicProvider().is_available():
            return AnthropicProvider()
        elif "gemini" in target_model.lower() and GeminiProvider().is_available():
            return GeminiProvider()
        elif "ollama" in target_model.lower():
            return OllamaProvider()
        elif OpenAIProvider().is_available():
            return OpenAIProvider()
            
        return None
