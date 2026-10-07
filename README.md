# Omnissiah: AI-Enabled Tabletop Rules Engine

**Candidate Project: Product Manager, AI Enablement**

## 1. The User Problem & Current Workflow
Tabletop wargames, specifically Warhammer 40k, operate on immensely complex and frequently updated rulesets. A single game requires cross-referencing Core Rules, specific Faction Indexes, and ongoing digital Errata updates. 

**Current Workflow:** When a rules dispute arises, gameplay halts. Players spend 5 to 15 minutes manually flipping through physical books and searching PDFs on their phones to find the exact wording, slowing down the game and increasing cognitive load.

## 2. Proposed Improvement
I built **Omnissiah**, an AI-enabled agentic workflow that resolves tabletop rules disputes instantly. By acting as a digital tournament judge, the workflow ingests the user's query, dynamically retrieves the exact relevant rules from a pre-compiled dataset, and synthesizes a definitive ruling with verbatim citations.

## 3. Architecture & Tools
* **Framework:** Next.js (React) deployed on Vercel.
* **AI Orchestration:** Vercel AI SDK v4.
* **Vectorization:** OpenAI (`text-embedding-3-small`) for generating query embeddings.
* **Inference:** Google Generative AI (`gemini-3.8-flash`) for high-reasoning context synthesis.
* **Workflow:** User Query -> Embedding Generation -> Deterministic Mathematical Vector Search (Cosine Similarity) -> Algorithmic Context Filtering -> LLM Synthesis -> Streaming UI Response.

## 4. Context & Memory Approach
* **Static Ontology (Vector Store):** A massive 91MB pre-compiled JSON file acts as the source of truth, containing vectorized chunks of the Core Rules and Faction Indexes.
* **Runtime Memory Cache:** To prevent severe serverless disk-read timeouts, the 91MB vector store is lazily loaded and cached in Vercel's serverless RAM across requests.
* **Conversational Memory:** The agent retains the last 3 turns of dialogue within the session, allowing users to ask follow-up questions without losing tactical context.

## 5. Iterations, Obstacles, & Key Tradeoffs
* **Tradeoff - Local JSON vs. Vector DB:** I opted for an in-memory JSON array rather than a cloud vector database (like Pinecone) to eliminate network latency during retrieval and keep the architecture fully self-contained for rapid prototyping.
* **Obstacle - Model Hallucinations:** I initially prototyped with `gpt-4o-mini`, but its internal training data overpowered the Retrieval-Augmented Generation (RAG) context, causing it to hallucinate outdated 10th Edition rules. 
* **Iteration - Algorithmic Guardrails:** To fix the hallucinations, I built deterministic guardrails. The workflow mathematically boosts the similarity score of "Core Rules" to keep them at the top of the context window. It also dynamically strips out highly specific "Stratagem" chunks unless the user explicitly asks for them, ensuring the LLM isn't distracted by irrelevant noise.
* **Obstacle - Gemini Safety Filters:** After migrating from OpenAI to Gemini for better reasoning at a lower cost, the Vercel stream began failing silently. I diagnosed that Warhammer terminology (words like "kill", "wound", and "battle-shock") was triggering Google's default "Dangerous Content" safety filters. I resolved this by explicitly injecting safety overrides into the SDK provider options.

## 6. Evaluation & Next Steps

### Representative Checks
* **Test:** "How do Fights First and Counter-Offensive interact?"
* **Result:** The agent successfully retrieves the core melee sequence and accurately chronologizes the alternating activation logic.

### Edge Case / Failure
* **Test:** "Can a Battle-shocked unit use the Insane Bravery stratagem?"
* **Failure:** In early iterations, the LLM falsely claimed "Yes" because the core rules state Stratagems generally work. 
* **Resolution:** My dynamic sorting algorithm fixed this by forcing the exact wording of the updated Errata to the top of the context window, allowing the AI to catch the highly specific restriction.

### Observed Results
* **Time Saved:** Reduces average rules dispute resolution from roughly 10 minutes of manual searching down to 15 seconds.
* **Quality:** completely eliminates human bias in rulings by requiring verbatim citations.

### Known Limitations
* The static JSON vector store does not update automatically when the game publisher releases a new balance dataslate PDF.

### Improvements Before Rollout
If taking this to production, I would migrate the static JSON array to a dedicated vector database (like Supabase or Pinecone). I would also build an automated ingestion pipeline that periodically scrapes the publisher's community site, parses new PDF releases, and updates the vector embeddings automatically so the judge is never out of date.

---
**Time Spent:** Roughly 10 to 15 hours mapping out the architecture, compiling the vector store, troubleshooting Vercel serverless memory constraints, and tuning the AI SDK safety providers.
