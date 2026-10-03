import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rulebooksDir = path.join(__dirname, '../rulebooks');
const dataDir = path.join(__dirname, '../data');
const vectorStorePath = path.join(dataDir, 'vector-store.json');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function main() {
  if (!fs.existsSync(rulebooksDir)) {
    console.error(`Rulebooks directory not found: ${rulebooksDir}`);
    fs.mkdirSync(rulebooksDir, { recursive: true });
    console.log('Created rulebooks directory. Please add PDFs and run again.');
    return;
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const files = fs.readdirSync(rulebooksDir).filter(file => file.endsWith('.pdf'));
  
  if (files.length === 0) {
    console.log('No PDFs found in rulebooks directory.');
    return;
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const vectorStore = [];

  for (const file of files) {
    console.log(`Processing ${file}...`);
    const filePath = path.join(rulebooksDir, file);
    const text = await extractTextFromPDF(filePath);
    
    // Determine source type for metadata
    let source = 'Army Rules';
    const lowerFile = file.toLowerCase();
    if (lowerFile.includes('universal') || lowerFile.includes('update')) {
      source = 'Universal Rules Update';
    } else if (lowerFile.includes('core')) {
      source = 'Core Rules';
    } else {
      source = file.replace('.pdf', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
      
    const chunks = await splitter.splitText(text);
    console.log(`  Split into ${chunks.length} chunks.`);

    const delay = ms => new Promise(res => setTimeout(res, ms));
    const batchSize = 50;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      let success = false;
      let retries = 0;
      
      while (!success && retries < 5) {
        try {
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: batch,
            encoding_format: 'float',
          });
          
          batch.forEach((chunk, index) => {
            vectorStore.push({
              id: `${file}-chunk-${i + index}`,
              text: chunk,
              metadata: {
                source,
                file,
              },
              embedding: embeddingResponse.data[index].embedding,
            });
          });
          console.log(`  Embedded chunks ${i} to ${i + batch.length - 1}`);
          success = true;
          
          // Small delay to respect TPM limits
          await delay(2000);
        } catch (error) {
          if (error.status === 429) {
            console.log(`  Rate limited on batch ${i}. Waiting 10 seconds before retrying...`);
            await delay(10000);
            retries++;
          } else {
            console.error(`  Error embedding batch ${i}:`, error.message);
            break;
          }
        }
      }
    }
  }

  fs.writeFileSync(vectorStorePath, JSON.stringify(vectorStore, null, 2));
  console.log(`\nSuccess! Saved ${vectorStore.length} embedded chunks to ${vectorStorePath}`);
}

main().catch(console.error);
