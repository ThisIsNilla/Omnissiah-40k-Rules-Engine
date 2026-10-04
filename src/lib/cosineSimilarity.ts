// OpenAI embeddings are pre-normalized (magnitude of 1).
// Therefore, cosine similarity is exactly equal to the dot product.
// This skips millions of redundant Math.sqrt and multiplication operations!
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}
