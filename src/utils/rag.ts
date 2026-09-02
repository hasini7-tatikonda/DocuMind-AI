import { generateEmbedding, generateEmbeddings } from "./embeddings";
import { similaritySearch } from "./vectorSearch";
import type { TextChunk } from "./textChunker";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const GROQ_MODEL =
  import.meta.env.VITE_GROQ_MODEL || "openai/gpt-oss-20b";
  
export interface RagResult {
  answer: string;
  sources: TextChunk[];
  scores: number[];
}

let documentChunks: TextChunk[] = [];
let documentEmbeddings: number[][] = [];

/**
 * Creates embeddings for all document chunks.
 * This is done once after a document is uploaded.
 */
export async function indexDocument(chunks: TextChunk[]) {
  if (!chunks.length) {
    throw new Error("No document chunks available.");
  }

  documentChunks = chunks;

  documentEmbeddings = await generateEmbeddings(
    chunks.map((chunk) => chunk.text)
  );

  return documentEmbeddings.length;
}

/**
 * Retrieves relevant chunks and generates a grounded answer.
 */
export async function askDocument(
  question: string,
  topK = 3
): Promise<RagResult> {
  if (!question.trim()) {
    throw new Error("Please enter a question.");
  }

  if (!documentChunks.length || !documentEmbeddings.length) {
    throw new Error("Please upload and process a document first.");
  }

  if (!GROQ_API_KEY) {
    throw new Error("Groq API key is missing.");
  }

  // 1. Convert the user's question into an embedding.
  const questionEmbedding = await generateEmbedding(question);

  // 2. Find the most relevant document chunks.
  const searchResults = similaritySearch(
    questionEmbedding,
    documentChunks,
    documentEmbeddings,
    topK
  );

  const sources = searchResults.map((result) => result.item);
  const scores = searchResults.map((result) => result.score);

  // 3. Build the context for the language model.
  const context = sources
    .map(
      (source, index) =>
        `SOURCE ${index + 1}:\n${source.text}`
    )
    .join("\n\n");

  // 4. Ground the model's response in retrieved document content.
  const prompt = `
You are DocuMind AI, a document question-answering assistant.

Answer the user's question using ONLY the information contained
in the provided document context.

Do not use outside knowledge.

If the answer cannot be found in the provided context, say:
"I couldn't find this information in the uploaded document."

Keep the answer clear and concise.

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${question}
`;

  // 5. Send the retrieved context and question to Groq.
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${errorText}`);
  }

  const data = await response.json();

  const answer =
    data.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("The AI returned an empty response.");
  }

  return {
    answer,
    sources,
    scores,
  };
}