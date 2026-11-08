import pytest
from app.tokenizers.tokenizer_service import tokenizer_service

def test_tokenizer_counting():
    text = "Hello world! This is a test prompt for PROMPTX autonomous prompt optimization."
    tokens_gpt4o = tokenizer_service.count_tokens(text, "gpt-4o")
    tokens_claude = tokenizer_service.count_tokens(text, "claude-3-5-sonnet")
    tokens_llama = tokenizer_service.count_tokens(text, "llama-3.3-70b")
    
    assert tokens_gpt4o > 0
    assert tokens_claude > 0
    assert tokens_llama > 0
    assert isinstance(tokens_gpt4o, int)

def test_tokenizer_encode_decode():
    text = "Autonomous AI Prompt Optimization Engine"
    encoded = tokenizer_service.encode(text, "gpt-4o")
    decoded = tokenizer_service.decode(encoded, "gpt-4o")
    assert len(encoded) > 0
    assert len(decoded) > 0
