# Omnissiah 40k Rules Engine: Logic Map & Architecture

## 1. High-Level Architecture
The Omnissiah Tactical Rules Engine is a completely self-contained, statically-hosted Retrieval-Augmented Generation (RAG) system built with Next.js and the Vercel AI SDK. 

- **Frontend:** Responsive dual-layout (Desktop & Mobile) using Tailwind CSS v4, featuring a dynamic Next.js Client Component (`page.tsx`) that streams AI responses in real-time.
- **Backend (Hybrid Model Architecture):** A serverless Next.js API Route (`/api/chat/route.ts`) that orchestrates vector embeddings via OpenAI (`text-embedding-3-small`) and delegates conversational generation and logic processing to Google (`gemini-3.8-flash`) to maximize reasoning while minimizing API costs.
- **Data Source:** A local `/rulebooks` directory containing canonical 11th Edition Warhammer 40k PDFs (Core Rules and Faction Indexes), bundled directly into Vercel serverless functions using `outputFileTracingIncludes`.

---

## 2. Deterministic RAG Pipeline
A major challenge with querying LLMs about Warhammer 40k is their pre-trained bias towards older editions (9th/10th) and their tendency to hallucinate non-existent rules. To enforce strict 11th Edition adherence, the engine uses a highly constrained, deterministic RAG pipeline:

1. **Context Bridging (Vector Query):** Instead of only embedding the user's final question, the engine concatenates the last 3 conversational messages to generate the search query. This ensures that follow-up questions (e.g., *"Why?"*) retain the vector context of the original tactical scenario.
2. **Algorithmic Score Boosting:** To prevent foundational Core Rules from being drowned out by highly-specific Faction Stratagems, the cosine similarity scoring algorithm artificially boosts chunks from `Core Rules` (+0.04) and `Universal Rules Update` (+0.08).
3. **Dynamic Stratagem Filtering:** If the user's query does not contain the word "stratagem", the backend actively intercepts and deletes any chunk containing the word "STRATAGEM" from the context. This prevents the LLM from cherry-picking niche edge cases (like *Heroic Intervention*) to validate incorrect generic rulings.
4. **Zero-Temperature Determinism:** The LLM is invoked with `temperature: 0`, completely stripping it of its pre-trained creativity and forcing it to rely solely on the provided static context.

---

## 3. The 4-Step Chain of Thought Protocol
Even with perfect RAG context, LLMs struggle with permissive rule systems (where the lack of a restriction *is* the rule). To solve this, the engine forces the AI to execute a rigorous 4-step logic check **before** it is allowed to answer. 

The AI must format its internal reasoning using a strict XML `<thinking>` block:

> **1. Scope Check:** Determines if the question is a general Core Phase query. If yes, the AI is banned from quoting datasheets or stratagems.
> **2. Context Verification:** Verifies that the Core Rules for the broad phase exist in the context, explicitly teaching the AI that the *omission* of a restriction means the action is permitted.
> **3. RAW Quote:** Forces the AI to quote the exact verbatim sentence from the context, preventing hallucinations.
> **4. Chronological Timeline:** Maps out the exact order of operations (e.g., "Dice rolls must happen before targets can be changed based on the dice result").

Only after completing this protocol is the AI permitted to output its **Final Verdict** (starting with `AFFIRMATIVE.` or `NEGATIVE.`).

---

## 4. UI/UX: The "Cogitation" Mask
While the 4-step Chain of Thought is computationally necessary to prevent hallucinations, exposing the raw logic steps to the user creates a bloated, unreadable chat experience.

To solve this, the frontend employs a **Thematic UI Filter** during the Vercel AI SDK streaming process:
- As the AI streams its internal `<thinking>` block, the React component intercepts the text and replaces it with a flashing, thematic placeholder: `*Cogitating protocol sequence...*`
- The exact moment the AI outputs `</thinking>` and begins streaming the Final Verdict, a regex filter completely strips the internal logic from the DOM.
- The user experiences a sleek, thematic loading state followed instantly by a crisp, punchy `AFFIRMATIVE` or `NEGATIVE` ruling—while the AI secretly performs rigorous logic checks under the hood.

---

## 5. Conversational Adaptability
To ensure the system remains user-friendly, the backend prompt distinguishes between **New Rules Queries** and **Conversational Follow-ups**. 
- If a user proposes a new tactical scenario, the engine enforces the strict `AFFIRMATIVE/NEGATIVE` verdict template.
- If a user asks for clarification (e.g., *"Can you explain that?"*), the prompt dynamically permits the AI to bypass the strict verdict constraints and provide a detailed, conversational explanation of its logic, utilizing the bridged RAG context.

---

## 6. Hybrid Cost-Optimization Architecture
RAG pipelines are notoriously expensive due to the massive token requirements of injecting document context into every query. To solve this, the engine employs a multi-provider hybrid architecture:
1. **Vector Embeddings (OpenAI):** The initial indexing and real-time query vectorization is handled by OpenAI's `text-embedding-3-small`, an industry standard for semantic search that operates at a virtually free $0.02 per 1M tokens.
2. **Logic & Inference (Google Gemini):** Instead of using GPT-4o for generation ($5.00 per 1M input tokens), the heavy lifting of reading the massive text context and executing the 4-step logic protocol is delegated to Google's `gemini-3.8-flash`. 
By routing the inference through Gemini Flash ($0.75 per 1M tokens) while maintaining OpenAI for semantic search, the engine achieves a staggering **85% reduction in operational API costs** with zero degradation in reasoning quality.
