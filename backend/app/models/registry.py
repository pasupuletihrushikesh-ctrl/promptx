from typing import List, Dict, Optional
from app.models.schemas import ModelInfo, ModelFamily

SUPPORTED_MODELS: Dict[str, ModelInfo] = {
    # OpenAI
    "gpt-4o": ModelInfo(
        id="gpt-4o",
        name="GPT-4o (Omni)",
        family=ModelFamily.OPENAI,
        context_window=128000,
        tokenizer_name="o200k_base",
        supports_system_prompt=True,
        supports_xml_tags=True,
        supports_thinking=False,
        description="OpenAI's flagship multimodal model with state-of-the-art reasoning and speed."
    ),
    "gpt-4o-mini": ModelInfo(
        id="gpt-4o-mini",
        name="GPT-4o Mini",
        family=ModelFamily.OPENAI,
        context_window=128000,
        tokenizer_name="o200k_base",
        supports_system_prompt=True,
        supports_xml_tags=True,
        supports_thinking=False,
        description="Affordable and fast small model for everyday tasks."
    ),
    "o1": ModelInfo(
        id="o1",
        name="OpenAI o1",
        family=ModelFamily.OPENAI,
        context_window=200000,
        tokenizer_name="o200k_base",
        supports_system_prompt=False, # Uses developer messages
        supports_xml_tags=False,
        supports_thinking=True,
        description="Deep reasoning model with native internal chain-of-thought."
    ),
    "o3-mini": ModelInfo(
        id="o3-mini",
        name="OpenAI o3-mini",
        family=ModelFamily.OPENAI,
        context_window=200000,
        tokenizer_name="o200k_base",
        supports_system_prompt=False,
        supports_xml_tags=False,
        supports_thinking=True,
        description="Compact deep reasoning model for STEM and code."
    ),
    
    # Anthropic Claude
    "claude-3-5-sonnet": ModelInfo(
        id="claude-3-5-sonnet",
        name="Claude 3.5 Sonnet",
        family=ModelFamily.CLAUDE,
        context_window=200000,
        tokenizer_name="cl100k_base",
        supports_system_prompt=True,
        supports_xml_tags=True, # Claude excels at XML tags
        supports_thinking=False,
        description="Anthropic's premier model, excels at structured XML tags, coding and nuance."
    ),
    "claude-3-5-haiku": ModelInfo(
        id="claude-3-5-haiku",
        name="Claude 3.5 Haiku",
        family=ModelFamily.CLAUDE,
        context_window=200000,
        tokenizer_name="cl100k_base",
        supports_system_prompt=True,
        supports_xml_tags=True,
        supports_thinking=False,
        description="Ultra-fast Anthropic model for low-latency tasks."
    ),

    # Google Gemini
    "gemini-2.0-flash": ModelInfo(
        id="gemini-2.0-flash",
        name="Gemini 2.0 Flash",
        family=ModelFamily.GEMINI,
        context_window=1048576,
        tokenizer_name="o200k_base",
        supports_system_prompt=True,
        supports_xml_tags=False,
        supports_thinking=True,
        description="Google's next-gen multimodal speed and reasoning engine with 1M context."
    ),
    "gemini-1.5-pro": ModelInfo(
        id="gemini-1.5-pro",
        name="Gemini 1.5 Pro",
        family=ModelFamily.GEMINI,
        context_window=2097152,
        tokenizer_name="o200k_base",
        supports_system_prompt=True,
        supports_xml_tags=False,
        supports_thinking=False,
        description="Google's 2M token context window model for extreme document analysis."
    ),

    # DeepSeek
    "deepseek-v3": ModelInfo(
        id="deepseek-v3",
        name="DeepSeek V3",
        family=ModelFamily.DEEPSEEK,
        context_window=64000,
        tokenizer_name="cl100k_base",
        supports_system_prompt=True,
        supports_xml_tags=False,
        supports_thinking=False,
        description="Open MoE 671B model matching top closed frontier models."
    ),
    "deepseek-r1": ModelInfo(
        id="deepseek-r1",
        name="DeepSeek R1",
        family=ModelFamily.DEEPSEEK,
        context_window=64000,
        tokenizer_name="cl100k_base",
        supports_system_prompt=True,
        supports_xml_tags=False,
        supports_thinking=True,
        description="Open reasoning model utilizing large-scale reinforcement learning."
    ),

    # Meta Llama
    "llama-3.3-70b": ModelInfo(
        id="llama-3.3-70b",
        name="Llama 3.3 70B Instruct",
        family=ModelFamily.LLAMA,
        context_window=128000,
        tokenizer_name="cl100k_base",
        supports_system_prompt=True,
        supports_xml_tags=False,
        supports_thinking=False,
        description="Meta's top open-weights model with markdown directive parsing."
    ),

    # Alibaba Qwen
    "qwen-2.5-72b": ModelInfo(
        id="qwen-2.5-72b",
        name="Qwen 2.5 72B Instruct",
        family=ModelFamily.QWEN,
        context_window=128000,
        tokenizer_name="cl100k_base",
        supports_system_prompt=True,
        supports_xml_tags=False,
        supports_thinking=False,
        description="Alibaba's premier open weights model with strong multilingual and coding strengths."
    ),

    # Local Ollama
    "ollama-local": ModelInfo(
        id="ollama-local",
        name="Ollama Local (Local Host)",
        family=ModelFamily.OLLAMA,
        context_window=32768,
        tokenizer_name="cl100k_base",
        supports_system_prompt=True,
        supports_xml_tags=False,
        supports_thinking=False,
        description="Local Ollama instance running without any external API costs."
    )
}

def get_model_info(model_id: str) -> ModelInfo:
    if model_id in SUPPORTED_MODELS:
        return SUPPORTED_MODELS[model_id]
    # Default to gpt-4o if not found
    return SUPPORTED_MODELS["gpt-4o"]

def list_supported_models() -> List[ModelInfo]:
    return list(SUPPORTED_MODELS.values())
