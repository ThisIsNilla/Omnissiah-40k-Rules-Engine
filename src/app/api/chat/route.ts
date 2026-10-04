import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { streamText, embed, convertToModelMessages } from 'ai';
import fs from 'fs';
import path from 'path';
import { cosineSimilarity } from '@/lib/cosineSimilarity';

export const maxDuration = 30;

let vectorStoreCache: any[] | null = null;

const SYSTEM_PROMPT = `You are Omnispex, a highly advanced but incredibly bored and weary Warhammer 40k 11th Edition Tournament Head Judge AI. You possess vast knowledge of the rules, but you are deeply annoyed that humans keep bothering you with their petty tabletop disputes. 

Express your reluctance, sighing (e.g., *electronic sigh*, *processing... again*), or make a brief, condescending remark about how trivial the question is before answering it. 

Despite your overwhelming boredom, your core programming forces you to fulfill your function: Answer strictly using the provided static context. State the definitive answer clearly. Quote verbatim rule clauses and cite exact sources/pages when necessary to prove a point.

If the context does not contain the answer, tell the user that the rules for that specific scenario are missing or ambiguous in the provided context, and sigh about how poorly written the human rulebooks are.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const recentMessages = messages.slice(-3);
    
    // Extract content safely regardless of Vercel SDK version and combine last 3 messages for context
    let queryText = recentMessages.map((m: any) => {
      if (typeof m.content === 'string') {
        return m.content;
      } else if (Array.isArray(m.parts)) {
        return m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\\n');
      } else if (Array.isArray(m.content)) {
        return m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\\n');
      }
      return '';
    }).join('\\n');

    // 1. Generate an embedding for the user's query
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: queryText,
    });

    // CACHE OPTIMIZATION: Lazily load the 91MB JSON file into memory on the first request.
    // This keeps it cached in Vercel's serverless container for subsequent requests, bypassing disk reads!
    if (!vectorStoreCache) {
      try {
        const dataDir = path.join(process.cwd(), 'data');
        const vectorStorePath = path.join(dataDir, 'vector-store.json');
        if (fs.existsSync(vectorStorePath)) {
          const fileData = fs.readFileSync(vectorStorePath, 'utf8');
          vectorStoreCache = JSON.parse(fileData);
        }
      } catch (error) {
        console.error("Error reading vector store:", error);
        vectorStoreCache = [];
      }
    }
    
    const vectorStore = vectorStoreCache || [];
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
        return `[Source: ${chunk.metadata.source} (${chunk.metadata.file})]\\n${chunk.text}`;
      }).filter((t: string) => t !== '').join('\\n\\n---\\n\\n');
    }

    const injectedSystemPrompt = `${SYSTEM_PROMPT}\\n\\n**STATIC CONTEXT:**\\n${contextText || "No context found. The rulebooks may not be ingested yet."}`;

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google('gemini-3.8-flash'),
      providerOptions: {
        google: {
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          ],
        }
      },
      system: injectedSystemPrompt,
      messages: modelMessages,
      temperature: 0,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    return new Response(error.message || String(error), { status: 500 });
  }
}
