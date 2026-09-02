import {
  pipeline,
  env,
  type FeatureExtractionPipeline,
} from "@xenova/transformers";

// Use the online Hugging Face model.
// Disable browser caching because a cached HTML/error page
// can cause: Unexpected token '<' ... is not valid JSON
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
  const embeddings: number[][] = [];

  for (const text of texts) {
    embeddings.push(await generateEmbedding(text));
  }

  return embeddings;
}