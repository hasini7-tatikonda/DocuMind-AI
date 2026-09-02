import {
  pipeline,
  env,
  type FeatureExtractionPipeline,
} from "@xenova/transformers";

// Use the online Hugging Face model.
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = false;
env.useFSCache = false;

let extractor: FeatureExtractionPipeline | null = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  return extractor;
}

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const model = await getExtractor();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data as Float32Array);
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const model = await getExtractor();

  // Generate embeddings for all chunks in one call.
  const output = await model(texts, {
    pooling: "mean",
    normalize: true,
  });

  const data = output.data as Float32Array;

  // all-MiniLM-L6-v2 produces 384-dimensional embeddings.
  const dimensions = 384;
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i++) {
    const start = i * dimensions;
    embeddings.push(
      Array.from(data.slice(start, start + dimensions))
    );
  }

  return embeddings;
}