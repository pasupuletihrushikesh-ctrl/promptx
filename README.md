# PROMPTX — Autonomous AI Prompt Optimization Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15+-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**PROMPTX** is a production-grade autonomous prompt optimization engine designed to transform unstructured, wordy, ambiguous, or inefficient user prompts into mathematically and structurally optimized prompts.

### Optimization Objective
$$\max \text{Output Quality} \quad \text{subject to} \quad \min \text{Token Consumption}$$

PROMPTX never optimizes for token count alone. It preserves all critical constraints, technical parameters, and domain nuances while pruning conversational padding, deduplicating context, and tailoring structure to target LLM tokenizers.

---

## 🏛️ 7-Stage Multi-Agent Architecture

```
[Raw User Prompt]
       │
       ▼
┌──────────────────────────────────────────────┐
│  Agent 1: Intent Understanding Agent         │
│  - Objective extraction                      │
│  - Audience, Context, & Constraint detection │
│  - Ambiguity & Missing Information resolution│
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Agent 2: Task Classification Agent          │
│  - 10 Specialized Domains                    │
│  - Confidence scoring & category mapping     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Agent 3: Prompt Strategy Engine             │
│  - Zero-shot / Few-shot / Decomposition      │
│  - Role / Constraint / Structured output     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Agent 4: Token Optimization Engine (Central)│
│  - Redundancy pruning & Fluff elimination    │
│  - Semantic compression & Context dedup      │
│  - Exact tokenizer calibration (Tiktoken/BPE)│
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Agent 5: Prompt Generation Agent            │
│  - Synthesizes 3 Calibrated Variants:        │
│    1. Balanced Optimized                     │
│    2. Ultra-Compact                          │
│    3. Detailed High-Performance              │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Agent 6: Quality Evaluation Agent           │
│  - 8-Dimensional Quality Index (0-100)       │
│  - Iterative Refinement Feedback Loop        │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Agent 7: Model Adaptation Engine            │
│  - Model-specific XML tags (Claude)          │
│  - Reasoning directive pruning (o1/o3/R1)    │
│  - Hierarchical Markdown (Gemini/Llama/Qwen) │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
[Optimized Prompt Result with Exact Metrics & Traces]
```

### 1. Agent 1: Intent Understanding Agent
Analyzes the raw prompt to extract core user goals, target audience, technical constraints, output formats, and flags ambiguities or unreferenced pronouns.

### 2. Agent 2: Task Classification Agent
Classifies prompts across 10 specialized categories:
- Coding and software engineering
- Mathematical reasoning
- Research and analysis
- Creative writing
- Education and tutoring
- Data analysis
- Business and strategy
- Image generation
- AI/ML engineering
- General-purpose tasks

### 3. Agent 3: Prompt Strategy Engine
Dynamically selects the leanest, highest-leverage prompting strategy:
- Zero-shot prompting
- Few-shot prompting
- Role-based prompting
- Structured output prompting
- Constraint-based prompting
- Context-aware prompting
- Decomposition prompting
- Retrieval-aware prompting
- Tool-use prompting

### 4. Agent 4: Token Optimization Engine
The central linguistic compressor:
- Redundancy detection & conversational padding elimination
- Semantic compression
- Instruction consolidation & sentence deduplication
- Constraint & variable preservation via masking
- Model-calibrated tokenizer integration (OpenAI `o200k_base`, `cl100k_base`, Claude, Llama 3, Gemini BPE)

### 5. Agent 5: Prompt Generation Agent
Produces 3 calibrated versions:
1. **Balanced Optimized**: High signal-to-noise ratio, direct imperatives, structured bullets.
2. **Ultra-Compact**: Dense telegraphic prompt maximizing token savings while strictly retaining core requirements.
3. **Detailed High-Performance**: Comprehensive hierarchy with role anchor, boundary conditions, and output specifications.

### 6. Agent 6: Quality Evaluation Agent
Scores every candidate prompt across 8 dimensions (0 to 100):
- Intent Preservation
- Instruction Clarity
- Completeness
- Constraint Preservation
- Output-Format Accuracy
- Ambiguity Reduction
- Token Efficiency
- Expected Task Performance

If the score fails quality thresholds, it triggers an iterative refinement loop (up to max cycles per mode) to guarantee quality.

### 7. Agent 7: Model Adaptation Engine
Adapts prompts to target model specifications without inventing unsupported capabilities:
- **Anthropic Claude**: Structured XML blocks (`<instructions>`, `<guidelines>`, `<output_format>`).
- **OpenAI o1 / o3-mini**: Prunes artificial "think step by step" tags so the internal chain-of-thought engine functions natively.
- **DeepSeek R1**: Streamlines persona boilerplate into direct problem formulation.
- **Meta Llama 3.3 / Qwen 2.5 / Gemini**: Clean Markdown directive blocks.

---

## ⚡ Optimization Modes

| Mode | Iteration Passes | Optimization Strategy | Ideal For |
| :--- | :---: | :--- | :--- |
| **QUICK** | 1 Pass | Single-pass token compression, sub-millisecond latency | High-throughput streaming & quick interactive queries |
| **BALANCED** | Up to 2 Passes | Balanced quality preservation with strong token savings | Standard daily production workflows |
| **DEEP** | Up to 3 Passes | Multi-pass iterative refinement and rigorous quality validation | Complex architecture, legal, math, and system prompts |
| **EXTREME** | Up to 3 Passes | Aggressive token elimination with strict semantic preservation checks | Strict context-window constraints and batch cost minimization |

---

## 📊 100-Prompt Benchmark Suite Results

PROMPTX includes a built-in benchmark dataset (`dataset_100.json`) testing 100 diverse prompt archetypes:
- **Vague prompts** (missing context & constraints)
- **Long redundant prompts** (heavy polite filler & fluff)
- **Complex coding prompts** (concurrency, memory bounds, type safety)
- **Multi-constraint prompts** (positive and negative boundaries)
- **Reasoning prompts** (math, logic puzzles, game theory)
- **Structured output prompts** (JSON schemas, tables, CSV)
- **Short prompts that should not be compressed** (high-signal definitions)

### Benchmark Summary Metrics
- **Total Prompts Tested**: 100 / 100
- **Pass Rate**: **99.0%**
- **Average Quality Score**: **95.39 / 100**
- **Average Token Reduction**: **16.39%** (with **60% to 91%** reduction on redundant prompts, and **0%** reduction on terse high-signal prompts to avoid semantic degradation)
- **Average Pipeline Latency**: **0.31 ms**

---

## 🚀 Quickstart

### Option 1: Run Locally

#### 1. Backend (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Interactive Swagger API documentation: `http://localhost:8000/docs`

#### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

### Option 2: Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 Testing

Run the full pytest suite for tokenizers, agents, and pipeline:
```bash
cd backend
python -m pytest tests/ -v
```

Execute the 100-prompt benchmark suite:
```bash
cd backend
python benchmarks/run_benchmark.py 100
```

---

## 🌐 API Reference

### `POST /api/optimize`
Optimize a prompt through the 7-stage multi-agent pipeline.
```json
{
  "raw_prompt": "Hello dear AI! Could you please kindly write a Python script that calculates prime numbers up to N? Make sure that you handle edge cases. Thank you in advance!",
  "target_model": "gpt-4o",
  "mode": "BALANCED",
  "preserve_exact_terms": ["prime numbers"]
}
```

### `POST /api/batch`
Batch optimize an array of prompts concurrently with aggregated statistics.

### `POST /api/ab-test`
Head-to-head empirical prompt comparison with simulated model output and dimension scoring.

### `GET /api/history`
Query recent optimization runs with favorite filtering.

### `GET /api/benchmark/latest`
Fetch latest benchmark run statistics across 100 test prompts.

---

## 📄 License
MIT License. Built for production-grade agentic AI systems.
