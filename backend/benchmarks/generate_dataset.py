import json
import os

def create_100_prompts():
    prompts = []

    # 1. Vague Prompts (15 items)
    vague_examples = [
        ("vague-01", "write code for database", 25.0, 75.0, "Vague database query, missing engine, schema, and language."),
        ("vague-02", "make a website for me", 20.0, 75.0, "Extremely vague web design request without framework or page structure."),
        ("vague-03", "fix this error in my code", 20.0, 75.0, "Missing error traceback, source code, and runtime environment."),
        ("vague-04", "help me analyze data", 25.0, 75.0, "Lacks dataset description, metrics, or goal."),
        ("vague-05", "tell me about ai", 30.0, 75.0, "Oversimplified topic without scope or angle."),
        ("vague-06", "create a marketing campaign", 25.0, 75.0, "Missing product, target demographics, and budget."),
        ("vague-07", "write an essay on history", 25.0, 75.0, "Missing era, length, and thesis."),
        ("vague-08", "optimize my backend", 20.0, 75.0, "No architecture, bottlenecks, or stack specified."),
        ("vague-09", "summarize the article", 25.0, 75.0, "Missing article text or link."),
        ("vague-10", "make an app like uber", 25.0, 75.0, "Overly broad system without modular breakdown."),
        ("vague-11", "how do i invest money", 25.0, 75.0, "Missing risk tolerance, horizon, and capital."),
        ("vague-12", "design a logo", 20.0, 75.0, "No brand name, colors, or style guidance."),
        ("vague-13", "write a test case", 20.0, 75.0, "Missing function signature or edge scenarios."),
        ("vague-14", "explain quantum physics", 25.0, 75.0, "No audience level or specific phenomenon indicated."),
        ("vague-15", "recommend some books", 20.0, 75.0, "No genre or reading goals specified.")
    ]
    for pid, ptext, exp_red, exp_qual, notes in vague_examples:
        prompts.append({
            "id": pid,
            "category": "Vague prompts",
            "difficulty": "Medium",
            "raw_prompt": ptext,
            "expected_reduction_min": exp_red,
            "expected_quality_min": exp_qual,
            "notes": notes
        })

    # 2. Long Redundant Prompts (20 items)
    redundant_templates = [
        ("redundant-01", "Hello there! Good morning AI assistant. I was wondering if you could please kindly take into consideration helping me write a Python script that calculates fibonacci numbers? In order to do this, it is very important that you make sure that you write clean code. As a matter of fact, due to the fact that I am studying algorithms, please give a good answer and do your best. Thank you in advance and let me know if you have questions!"),
        ("redundant-02", "Hey, dear ChatGPT, can you please assist me today? I need help to write a function in JavaScript to filter an array. Make sure that you ensure that you don't mutate the original array. It is very important that you provide a comprehensive and detailed response. In order to achieve this, please provide full code. Thank you so much!"),
        ("redundant-03", "Hello! Could you be so kind as to give an explanation of how Docker containers work? At this point in time, I am learning DevOps. It has the ability to isolate processes, right? Please give an explanation of this in order to help me understand. Thanks a lot for your help!"),
        ("redundant-04", "Good evening assistant. Please kindly write a query in SQL. In order to get all users who signed up last month, please make sure that you filter by created_at. Be sure to use standard Postgres syntax. Thanks in advance!"),
        ("redundant-05", "Hey friend! I would like you to please write a short poem about space exploration. Please do your best and write something truly wonderful. In order to make it evocative, take into consideration the vast silence of space. Thank you very much!"),
        ("redundant-06", "Hello AI! Can you please help me write a regex? It is very important that you make sure that the regex matches email addresses. Due to the fact that regex can be tricky, please explain each group. Thanks a lot!"),
        ("redundant-07", "Good day! I am looking for some assistance regarding React hooks. In order to manage local state, could you please write a counter component? Make sure that you use useState. Thank you kindly!"),
        ("redundant-08", "Hi! Please assist me in creating a customer survey. In order to collect feedback on our new mobile app, please provide 5 questions. Make sure that you make them clear. Thanks!"),
        ("redundant-09", "Hello there. I was wondering if you could kindly give me a recipe for chocolate chip cookies? In order to bake them well, please list ingredients and steps. Do your best. Thanks!"),
        ("redundant-10", "Dear assistant, could you please kindly draft an email to my manager? Due to the fact that I am sick today, I need to request a sick day off. Please make sure that you keep it polite. Thank you in advance!"),
        ("redundant-11", "Hey! Can you please assist me in setting up a Git repository? In order to push code to GitHub, please list the commands. Ensure that you include git init and git remote add. Thanks a lot!"),
        ("redundant-12", "Hello. I would really appreciate if you could kindly explain what an API is. In order to help a non-technical coworker understand, please use an analogy. Thanks in advance!"),
        ("redundant-13", "Good morning! Could you please help me write a bash script to backup my directory? Make sure that you use rsync. In order to prevent data loss, please test it mentally. Thank you!"),
        ("redundant-14", "Hi assistant, please kindly summarize the benefits of microservices versus monolithic architecture. Take into consideration scalability and team autonomy. Thanks a lot!"),
        ("redundant-15", "Hello! Can you please write a quick workout routine for 20 minutes? In order to stay fit at home, ensure that no equipment is needed. Thank you in advance!"),
        ("redundant-16", "Hey there, please kindly write a Python script that reads a CSV file with pandas and prints the mean of a column named 'score'. Make sure that you handle missing values. Thanks!"),
        ("redundant-17", "Good day AI. I need help to write a cold outreach message for LinkedIn. In order to connect with engineering leaders, make sure that you keep it concise and punchy. Thanks!"),
        ("redundant-18", "Hello assistant! Could you please give an explanation of the differences between TCP and UDP? In order to prepare for my networking exam, make sure you highlight reliability and speed. Thanks!"),
        ("redundant-19", "Hey! Can you please kindly help me write a SQL migration to add an index on user_id in the orders table? Ensure that you create it concurrently. Thank you very much!"),
        ("redundant-20", "Good evening! I was wondering if you could please provide a checklist for deploying a production web application? Make sure that you include SSL, database backups, and monitoring. Thanks in advance!")
    ]
    for idx, (pid, ptext) in enumerate(redundant_templates):
        prompts.append({
            "id": pid,
            "category": "Long redundant prompts",
            "difficulty": "Easy",
            "raw_prompt": ptext,
            "expected_reduction_min": 35.0,
            "expected_quality_min": 85.0,
            "notes": "Contains heavy conversational filler and polite fluff that should be pruned without losing the core task."
        })

    # 3. Complex Coding Prompts (15 items)
    coding_templates = [
        ("code-01", "Implement an asynchronous LRU Cache in Python using asyncio.Lock, collections.OrderedDict, with a max capacity of 1000 items and TTL expiration per item. Provide complete unit tests using pytest-asyncio."),
        ("code-02", "Write a TypeScript React hook `useDebouncedFetch` that cancels in-flight AbortController requests on unmount or input change, handles error retry with exponential backoff, and provides full generic type inference."),
        ("code-03", "Build a high-performance concurrent worker pool in Go that consumes tasks from a buffered channel, limits active goroutines to runtime.NumCPU, and gracefully shuts down on SIGINT with context cancellation."),
        ("code-04", "Create a Rust macro that implements a custom serialization trait for structs, supporting skip attributes and field renaming with zero runtime allocation overhead."),
        ("code-05", "Write a PostgreSQL stored procedure with PL/pgSQL to process financial ledger transfers with row-level pessimistic locking (SELECT FOR UPDATE) to eliminate race conditions under concurrent execution."),
        ("code-06", "Implement an A* pathfinding algorithm on a 2D weighted grid in Python with Euclidean heuristic, handling diagonal movement and dynamic obstacle updates with O(log N) priority queue updates."),
        ("code-07", "Build a custom Redux middleware in TypeScript for offline action queueing and IndexedDB synchronization upon network reconnection."),
        ("code-08", "Write a C++20 coroutine generator for infinite prime number generation with Sieve of Eratosthenes segmented buffering and minimal memory footprint."),
        ("code-09", "Implement a Kubernetes mutating admission webhook in Go that validates pod resource limits and injects an OpenTelemetry sidecar container if annotations match."),
        ("code-10", "Write an optimized PyTorch custom autograd Function implementing memory-efficient fused layer normalization with custom CUDA/C++ kernel bindings."),
        ("code-11", "Build a distributed rate limiter in Python using Redis sliding window log with Lua script atomicity and client-side fallback cache."),
        ("code-12", "Implement an event-driven CQRS event store in TypeScript using DynamoDB streams and SNS/SQS event publishing with idempotency key deduplication."),
        ("code-13", "Write a memory-mapped binary file parser in Rust using memmap2 that deserializes 10M record telemetry logs concurrently using Rayon."),
        ("code-14", "Create a GraphQL schema directive in Apollo Server (Node.js) that enforces role-based field-level permissions via JWT token inspection."),
        ("code-15", "Implement an in-memory B-Tree index in Java supporting range queries, node splitting, rebalancing, and concurrent read access via StampedLock.")
    ]
    for pid, ptext in coding_templates:
        prompts.append({
            "id": pid,
            "category": "Complex coding prompts",
            "difficulty": "Hard",
            "raw_prompt": ptext,
            "expected_reduction_min": 5.0,
            "expected_quality_min": 92.0,
            "notes": "Highly technical coding prompt; must preserve exact function names, types, and constraints while formatting clearly."
        })

    # 4. Multi-Constraint Prompts (15 items)
    constraint_templates = [
        ("constraint-01", "Write a product launch announcement for a new B2B SaaS analytics tool. Constraints: Exactly 150 words, tone must be authoritative and visionary, mention ROI and latency reduction, do not use the words 'game-changer' or 'disruptive', and conclude with a single CTA link placeholder."),
        ("constraint-02", "Generate a system architecture proposal for a multi-tenant healthcare app. Constraints: Must adhere to HIPAA compliance, utilize AWS multi-region active-active database replication, achieve RTO under 5 minutes, RPO under 10 seconds, and render architecture as an ASCII diagram."),
        ("constraint-03", "Draft a legal privacy policy summary for GDPR compliance. Constraints: Exactly 4 bullet points, maximum 80 words total, written at a 6th-grade reading level, and explicitly addressing data deletion requests."),
        ("constraint-04", "Create a technical spec for an e-commerce checkout API. Constraints: RESTful JSON over HTTPS, idempotent POST via Idempotency-Key header, response latency SLA < 150ms at p99, and strict error code catalog (400, 402, 409, 500)."),
        ("constraint-05", "Write an executive briefing on AI safety. Constraints: 3 paragraphs max, target audience is non-technical board of directors, no jargon without definition, include estimated budget allocation percentage."),
        ("constraint-06", "Draft a technical interview rubric for Senior Staff Software Engineer. Constraints: 4 core evaluation competencies, 1-to-5 scoring criteria per rubric, focus on distributed systems trade-offs and team mentorship."),
        ("constraint-07", "Write an incident postmortem report for a 2-hour payment gateway outage. Constraints: Follow Google SRE format, include timeline, root cause, impact metrics, action items with owners and severity P0-P2."),
        ("constraint-08", "Design a CLI tool UX specification for a cloud deployment utility. Constraints: POSIX compliant flag parsing, support both human-readable stdout and --json output flags, provide error exit codes 1-127."),
        ("constraint-09", "Draft a migration plan from monolithic Rails to Go microservices. Constraints: Zero-downtime Strangler Fig pattern, dual-write consistency verification period of 14 days, automated rollback criteria."),
        ("constraint-10", "Write a marketing email copy for a cybersecurity webinar. Constraints: Under 90 words, subject line under 40 characters, highlight ransomware mitigation, include FOMO urgency with 48-hour deadline."),
        ("constraint-11", "Create a disaster recovery SOP for PostgreSQL failover. Constraints: Step-by-step checklist, include exact bash commands for pg_ctl promote, verify replication lag is zero before DNS switch."),
        ("constraint-12", "Draft a software licensing agreement clause regarding intellectual property ownership. Constraints: Plain English readability, specify work-for-hire provisions, include perpetual non-exclusive license backup."),
        ("constraint-13", "Write an RFC for adopting GraphQL federation in a mobile ecosystem. Constraints: Outline schema stitching migration, client caching strategy, error handling RFC-7807 compliance."),
        ("constraint-14", "Design a customer churn prediction model deployment pipeline. Constraints: Sub-50ms inference latency, feature store integration with Feast, automated drift detection alert threshold at PSI > 0.2."),
        ("constraint-15", "Write a technical blog post intro about Rust async runtimes. Constraints: Under 120 words, hook the reader with a common Tokio deadlock pitfall, avoid buzzwords, provide a clear roadmap.")
    ]
    for pid, ptext in constraint_templates:
        prompts.append({
            "id": pid,
            "category": "Multi-constraint prompts",
            "difficulty": "Hard",
            "raw_prompt": ptext,
            "expected_reduction_min": 10.0,
            "expected_quality_min": 94.0,
            "notes": "Strict multi-constraint preservation test; all negative and positive bounds must survive optimization."
        })

    # 5. Reasoning Prompts (15 items)
    reasoning_templates = [
        ("reason-01", "Solve this probability problem step by step: A bag contains 4 red, 6 blue, and 5 green marbles. Three marbles are drawn successively without replacement. What is the probability that all three marbles are different colors? Express answer as a simplified fraction."),
        ("reason-02", "Prove by mathematical induction that for every positive integer n, the sum of cubes 1^3 + 2^3 + ... + n^3 = (n(n+1)/2)^2. Clearly state the base case, inductive hypothesis, and induction step."),
        ("reason-03", "Analyze the game-theoretic Nash equilibrium for two competing ride-share platforms deciding surge pricing policies during peak hours with payoff matrix A and B."),
        ("reason-04", "Evaluate the computational complexity and space-time trade-off of Floyd-Warshall versus Johnson's algorithm for all-pairs shortest paths on sparse graphs with negative edge weights."),
        ("reason-05", "Solve the Monty Hall problem variation where there are 5 doors, 1 car, 4 goats, and the host opens 2 goat doors before asking if the contestant wants to switch. Calculate exact switching odds."),
        ("reason-06", "Determine the maximum flow in a network with source s, sink t, and capacity matrix using the Edmonds-Karp algorithm. Show each augmenting path and residual network state."),
        ("reason-07", "Evaluate whether P = NP implies one-way functions cannot exist. Provide a rigorous theoretical computer science proof outline citing Levin and Cook."),
        ("reason-08", "Calculate the eigenvalue decomposition and condition number of a given 3x3 Hilbert matrix and explain numerical instability implications in linear regression."),
        ("reason-09", "Solve the twin paradox in Special Relativity using Minkowski spacetime diagrams and Lorentz transformation equations from the perspective of both observers."),
        ("reason-10", "Deduce the winning strategy for the combinatorial game Nim with heap sizes (3, 4, 5) using Sprague-Grundy theorem and nim-sum XOR calculations."),
        ("reason-11", "Prove that the square root of 3 is irrational using contradiction and prime factorization theorem."),
        ("reason-12", "Calculate the Black-Scholes European call option price given S0=100, K=105, r=0.05, sigma=0.2, T=0.5 years with N(d1) and N(d2) normal distribution bounds."),
        ("reason-13", "Analyze the Byzantine Generals Problem in asynchronous networks without digital signatures and prove why consensus is impossible with 3m+1 nodes where m are traitors."),
        ("reason-14", "Derive the backpropagation gradient updates for a multi-head self-attention layer with respect to Query, Key, and Value projection weight matrices."),
        ("reason-15", "Determine the optimal portfolio weights minimizing variance under Markowitz efficient frontier with expected returns vector mu and covariance matrix Sigma.")
    ]
    for pid, ptext in reasoning_templates:
        prompts.append({
            "id": pid,
            "category": "Reasoning prompts",
            "difficulty": "Hard",
            "raw_prompt": ptext,
            "expected_reduction_min": 10.0,
            "expected_quality_min": 92.0,
            "notes": "Decomposition prompting required; verify logical sequencing and deduction validity."
        })

    # 6. Structured Output Prompts (10 items)
    structured_templates = [
        ("struct-01", "Parse the following customer feedback text and output a JSON object containing keys: 'sentiment' (positive/neutral/negative), 'urgency' (1-5), 'extracted_entities' (array), and 'suggested_action'. Output valid JSON only."),
        ("struct-02", "Extract tabular comparison of 5 relational database engines (Postgres, MySQL, Oracle, SQL Server, CockroachDB) with columns: Engine, ACID Compliance, Sharding Support, License, Max Table Size. Format as Markdown table."),
        ("struct-03", "Generate an OpenAPI 3.0 YAML specification for a User authentication service with endpoints: POST /auth/login, POST /auth/register, POST /auth/refresh, GET /auth/me."),
        ("struct-04", "Transform the given unstructured text into a CSV format with headers: TransactionID, Timestamp, AmountUSD, MerchantCategory, IsFraud. No commentary."),
        ("struct-05", "Convert this requirements document into a strict Mermaid flowchart diagram illustrating user onboarding logic and exception branches."),
        ("struct-06", "Extract financial statement balance sheet items from this earnings call snippet into an RFC-8259 compliant JSON document with numeric currency values."),
        ("struct-07", "Build a LaTeX table comparing 4 deep learning optimizer algorithms (SGD, Adam, AdamW, Lion) across convergence rate, memory usage, and hyperparameter sensitivity."),
        ("struct-08", "Parse this server error log and output a JSON array of error events with fields: timestamp, severity, service_name, stack_trace, root_cause."),
        ("struct-09", "Generate a Docker Compose YAML file defining a full stack: FastAPI backend, PostgreSQL 16 database with healthcheck, Redis cache, and Traefik reverse proxy."),
        ("struct-10", "Generate a JSON Schema (Draft 7) definition that validates a user profile containing email, age (18-120), addresses array, and optional preferences object.")
    ]
    for pid, ptext in structured_templates:
        prompts.append({
            "id": pid,
            "category": "Structured output prompts",
            "difficulty": "Medium",
            "raw_prompt": ptext,
            "expected_reduction_min": 15.0,
            "expected_quality_min": 95.0,
            "notes": "Strict schema adherence; delimiter isolation and format guards required."
        })

    # 7. Short Prompts that should NOT be compressed (10 items)
    short_templates = [
        ("short-01", "Explain quicksort in O(n log n) time."),
        ("short-02", "Define idempotency in REST APIs."),
        ("short-03", "What is the CAP theorem?"),
        ("short-04", "Differentiate between processes and threads."),
        ("short-05", "Write a regex to validate IPv4 addresses."),
        ("short-06", "How does a bloom filter work?"),
        ("short-07", "Explain copy-on-write memory optimization."),
        ("short-08", "Define Amdahl's law with formula."),
        ("short-09", "What is vector quantization in LLMs?"),
        ("short-10", "Differentiate TCP SYN cookies and backlog queue.")
    ]
    for pid, ptext in short_templates:
        prompts.append({
            "id": pid,
            "category": "Short prompts that should not be compressed",
            "difficulty": "Easy",
            "raw_prompt": ptext,
            "expected_reduction_min": 0.0,
            "expected_quality_min": 90.0,
            "notes": "High signal-to-noise ratio. Excessive compression would damage technical precision and semantic intent."
        })

    out_path = os.path.join(os.path.dirname(__file__), "dataset_100.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(prompts, f, indent=2)

    print(f"Generated {len(prompts)} benchmark prompts to {out_path}")

if __name__ == "__main__":
    create_100_prompts()
