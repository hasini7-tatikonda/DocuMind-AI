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
  topK = 3,
  minScore = 0.25
): SearchResult<T>[] {
  const results: SearchResult<T>[] = [];

  for (let i = 0; i < items.length; i++) {
    const embedding = embeddings[i];

    if (!embedding || embedding.length !== queryEmbedding.length) {
      continue;
    }

    const score = cosineSimilarity(queryEmbedding, embedding);

    if (score >= minScore) {
      results.push({
        item: items[i],
        score,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}