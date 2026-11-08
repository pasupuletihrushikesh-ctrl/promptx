from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum
from datetime import datetime

class OptimizationMode(str, Enum):
    QUICK = "QUICK"
    BALANCED = "BALANCED"
    DEEP = "DEEP"
    EXTREME = "EXTREME"

class ModelFamily(str, Enum):
    OPENAI = "openai"
    CLAUDE = "claude"
    GEMINI = "gemini"
    DEEPSEEK = "deepseek"
    LLAMA = "llama"
    QWEN = "qwen"
    OLLAMA = "ollama"

class ModelInfo(BaseModel):
    id: str
    name: str
    family: ModelFamily
    context_window: int
    tokenizer_name: str
    supports_system_prompt: bool = True
    supports_xml_tags: bool = False
    supports_thinking: bool = False
    description: str

class IntentAnalysis(BaseModel):
    objective: str
    audience: str
    context: str
    constraints: List[str] = Field(default_factory=list)
    desired_output: str
    missing_information: List[str] = Field(default_factory=list)
    ambiguity_detected: bool = False
    clarification_needed: bool = False
    reasoning: str

class TaskClassification(BaseModel):
    primary_category: str
    secondary_category: Optional[str] = None
    confidence: float = 0.95
    recommended_strategy: str
    reason: str

class StrategySelection(BaseModel):
    strategy: str
    sub_techniques: List[str] = Field(default_factory=list)
    structure_type: str = "Markdown"
    reason: str

class TokenOptimizationTrace(BaseModel):
    original_tokens: int
    compressed_tokens: int
    reduction_percentage: float
    removed_redundancies: List[str] = Field(default_factory=list)
    consolidated_phrases: List[str] = Field(default_factory=list)
    deduplicated_context: List[str] = Field(default_factory=list)
    preserved_constraints: List[str] = Field(default_factory=list)

class PromptVariants(BaseModel):
    optimized: str
    compact: str
    detailed: str

class QualityMetrics(BaseModel):
    intent_preservation: float = Field(ge=0, le=100)
    instruction_clarity: float = Field(ge=0, le=100)
    completeness: float = Field(ge=0, le=100)
    constraint_preservation: float = Field(ge=0, le=100)
    output_format_accuracy: float = Field(ge=0, le=100)
    ambiguity_reduction: float = Field(ge=0, le=100)
    token_efficiency: float = Field(ge=0, le=100)
    expected_task_performance: float = Field(ge=0, le=100)
    overall_score: float = Field(ge=0, le=100)
    evaluation_summary: str
    passes_threshold: bool

class AgentReasoningStep(BaseModel):
    agent_name: str
    status: str = "completed"
    details: str
    execution_time_ms: float

class OptimizationRequest(BaseModel):
    raw_prompt: str
    target_model: str = "gpt-4o"
    mode: OptimizationMode = OptimizationMode.BALANCED
    custom_instructions: Optional[str] = None
    preserve_exact_terms: List[str] = Field(default_factory=list)
    target_token_budget: Optional[int] = None
    temperature: Optional[float] = 0.7
    api_key_override: Optional[str] = None

class OptimizationResponse(BaseModel):
    id: str
    raw_prompt: str
    target_model: str
    mode: OptimizationMode
    raw_tokens: int
    variants: PromptVariants
    tokens: Dict[str, int]
    savings_percent: Dict[str, float]
    intent: IntentAnalysis
    classification: TaskClassification
    strategy: StrategySelection
    quality: QualityMetrics
    agent_reasoning: List[AgentReasoningStep] = Field(default_factory=list)
    iterations_run: int = 1
    total_latency_ms: float
    created_at: str

class PromptTemplate(BaseModel):
    id: str
    title: str
    category: str
    description: str
    template: str
    target_model: str = "gpt-4o"
    tags: List[str] = Field(default_factory=list)

class BatchOptimizationRequest(BaseModel):
    items: List[OptimizationRequest]

class BatchOptimizationResponse(BaseModel):
    total_prompts: int
    successful: int
    results: List[OptimizationResponse]
    average_token_savings: float
    total_time_ms: float

class ABTestRequest(BaseModel):
    raw_prompt: str
    prompt_a: str
    prompt_b: str
    target_model: str = "gpt-4o"

class ABTestResult(BaseModel):
    winner: str
    score_a: float
    score_b: float
    metrics_a: QualityMetrics
    metrics_b: QualityMetrics
    comparison_analysis: str
    simulated_output_a: str
    simulated_output_b: str

class BenchmarkItem(BaseModel):
    id: str
    category: str
    difficulty: str
    raw_prompt: str
    expected_reduction_min: float
    expected_quality_min: float
    notes: Optional[str] = None

class BenchmarkRunResult(BaseModel):
    item_id: str
    category: str
    raw_tokens: int
    optimized_tokens: int
    reduction_percent: float
    quality_score: float
    latency_ms: float
    passed: bool

class BenchmarkSummary(BaseModel):
    total_prompts: int
    passed_prompts: int
    pass_rate_percent: float
    average_token_reduction_percent: float
    average_quality_score: float
    average_latency_ms: float
    results: List[BenchmarkRunResult]
