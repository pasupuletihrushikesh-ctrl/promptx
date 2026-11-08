export type OptimizationMode = "QUICK" | "BALANCED" | "DEEP" | "EXTREME";

export type ModelFamily = "openai" | "claude" | "gemini" | "deepseek" | "llama" | "qwen" | "ollama";

export interface ModelInfo {
  id: string;
  name: string;
  family: ModelFamily;
  context_window: number;
  tokenizer_name: string;
  supports_system_prompt: boolean;
  supports_xml_tags: boolean;
  supports_thinking: boolean;
  description: string;
}

export interface IntentAnalysis {
  objective: string;
  audience: string;
  context: string;
  constraints: string[];
  desired_output: string;
  missing_information: string[];
  ambiguity_detected: boolean;
  clarification_needed: boolean;
  reasoning: string;
}

export interface TaskClassification {
  primary_category: string;
  secondary_category?: string;
  confidence: number;
  recommended_strategy: string;
  reason: string;
}

export interface StrategySelection {
  strategy: string;
  sub_techniques: string[];
  structure_type: string;
  reason: string;
}

export interface QualityMetrics {
  intent_preservation: number;
  instruction_clarity: number;
  completeness: number;
  constraint_preservation: number;
  output_format_accuracy: number;
  ambiguity_reduction: number;
  token_efficiency: number;
  expected_task_performance: number;
  overall_score: number;
  evaluation_summary: string;
  passes_threshold: boolean;
}

export interface AgentReasoningStep {
  agent_name: string;
  status: string;
  details: string;
  execution_time_ms: number;
}

export interface PromptVariants {
  optimized: string;
  compact: string;
  detailed: string;
}

export interface OptimizationResponse {
  id: string;
  raw_prompt: string;
  target_model: string;
  mode: OptimizationMode;
  raw_tokens: number;
  variants: PromptVariants;
  tokens: {
    raw: number;
    optimized: number;
    compact: number;
    detailed: number;
  };
  savings_percent: {
    optimized: number;
    compact: number;
    detailed: number;
  };
  intent: IntentAnalysis;
  classification: TaskClassification;
  strategy: StrategySelection;
  quality: QualityMetrics;
  agent_reasoning: AgentReasoningStep[];
  iterations_run: number;
  total_latency_ms: number;
  created_at: string;
}

export interface HistoryItem {
  id: string;
  raw_prompt: string;
  target_model: string;
  mode: string;
  raw_tokens: number;
  optimized_tokens: number;
  savings_percent: number;
  quality_score: number;
  optimized_text: string;
  is_favorite: boolean;
  created_at?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  template: string;
  target_model: string;
  tags: string[];
}

export interface BenchmarkRunResult {
  item_id: string;
  category: string;
  raw_tokens: number;
  optimized_tokens: number;
  reduction_percent: number;
  quality_score: number;
  latency_ms: number;
  passed: boolean;
}

export interface BenchmarkSummary {
  total_prompts: number;
  passed_prompts: number;
  pass_rate_percent: number;
  average_token_reduction_percent: number;
  average_quality_score: number;
  average_latency_ms: number;
  results: BenchmarkRunResult[];
}
