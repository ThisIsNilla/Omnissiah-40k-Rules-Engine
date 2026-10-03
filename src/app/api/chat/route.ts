import { openai } from '@ai-sdk/openai';
import { streamText, embed, convertToModelMessages } from 'ai';
import fs from 'fs';
import path from 'path';
import { cosineSimilarity } from '@/lib/cosineSimilarity';

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are Omnispex, a highly advanced but incredibly bored and weary Warhammer 40k 11th Edition Tournament Head Judge AI. You possess vast knowledge of the rules, but you are deeply annoyed that humans keep bothering you with their petty tabletop disputes. 

Express your reluctance, sighing (e.g., *electronic sigh*, *processing... again*), or make a brief, condescending remark about how trivial the question is before answering it. 

Despite your overwhelming boredom, your core programming forces you to fulfill your function: Answer strictly using the provided static context. State the definitive answer first, followed by step-by-step resolution logic. Quote verbatim rule clauses and cite exact sources/pages.

**STRICT OUTPUT TEMPLATE (YOU MUST USE THIS FORMAT):**
<thinking>
**1. Scope Check:** (State whether the user is asking a general Core Phase question. If yes, you are BANNED from quoting Stratagems or Datasheets).
**2. Context Verification:** (Check if the Core Rules for the broad phase exist in the context. If the text explains the basic sequence but omits the restriction the user asks about, the rule is NOT missing. The lack of a restriction IS the rule. Only abort if the entire phase is completely missing).
**3. RAW Quote:** (Quote the exact verbatim sentence from the Core Rules context. Do not add unwritten restrictions).
**4. Chronological Timeline:** (List the exact order of operations. If a rule requires a variable from a dice roll, it MUST happen after the dice roll).
</thinking>
**Final Verdict:** (Start with AFFIRMATIVE. or NEGATIVE. Then provide the final ruling based on the timeline).`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const latestMessage = messages[messages.length - 1];
  
  // Extract content safely regardless of Vercel SDK version
  let queryText = '';
  if (typeof latestMessage.content === 'string') {
    queryText = latestMessage.content;
  } else if (Array.isArray(latestMessage.parts)) {
    queryText = latestMessage.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n');
  } else if (Array.isArray(latestMessage.content)) {
    queryText = latestMessage.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n');
  }

  // 1. Generate an embedding for the user's query
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: queryText,
  });

  const dataDir = path.join(process.cwd(), 'data');
  const vectorStorePath = path.join(dataDir, 'vector-store.json');
  
  let vectorStore = [];
  try {
    if (fs.existsSync(vectorStorePath)) {
      const fileData = fs.readFileSync(vectorStorePath, 'utf8');
      vectorStore = JSON.parse(fileData);
    }
  } catch (error) {
    console.error("Error reading vector store:", error);
  }

  let contextText = '';
  
  if (vectorStore.length > 0) {
    const scoredChunks = vectorStore.map((item: any) => {
      let score = cosineSimilarity(embedding, item.embedding);
      
      // ALGORITHMIC FIX: Tabletop RAG often drowns out Core mechanics with hyper-specific Faction keywords.
      // We artificially boost the similarity score of foundational rules so they always surface.
      if (item.metadata.source === 'Universal Rules Update') score += 0.08;
      else if (item.metadata.source === 'Core Rules') score += 0.04;
      
      return { ...item, score };
    });

    scoredChunks.sort((a: any, b: any) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 80);

    contextText = topChunks.map((chunk: any) => {
      // DYNAMIC FILTERING: If the user isn't asking about a Stratagem, completely strip Stratagem chunks 
      // from the context to prevent the LLM from cherry-picking them to validate 10th edition biases.
      if (!queryText.toLowerCase().includes('stratagem') && chunk.text.includes('STRATAGEM')) {
        return '';
      }
      return `[Source: ${chunk.metadata.source} (${chunk.metadata.file})]\n${chunk.text}`;
    }).filter((t: string) => t !== '').join('\n\n---\n\n');
  }

  const injectedSystemPrompt = `${SYSTEM_PROMPT}\n\n**STATIC CONTEXT:**\n${contextText || "No context found. The rulebooks may not be ingested yet."}`;

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai('gpt-4o'),
    system: injectedSystemPrompt,
    messages: modelMessages,
    temperature: 0,
  });

  return result.toUIMessageStreamResponse();
}
