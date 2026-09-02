export interface SearchResult<T> {
  item: T;
  score: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same dimensions.");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

export function similaritySearch<T>(
  queryEmbedding: number[],
  items: T[],
  embeddings: number[][],
  topK = 3
): SearchResult<T>[] {
  const results = items.map((item, index) => ({
    item,
    score: cosineSimilarity(queryEmbedding, embeddings[index]),
  }));

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}