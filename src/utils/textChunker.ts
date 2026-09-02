export interface TextChunk {
  id: number;
  text: string;
}

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export function chunkText(text: string): TextChunk[] {
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleanedText) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let id = 0;

  while (start < cleanedText.length) {
    let end = Math.min(start + CHUNK_SIZE, cleanedText.length);

    // Move the end forward to a word boundary.
    if (end < cleanedText.length) {
      const nextSpace = cleanedText.indexOf(" ", end);

      if (nextSpace !== -1 && nextSpace <= end + 100) {
        end = nextSpace;
      }
    }

    const chunkText = cleanedText.slice(start, end).trim();

    if (chunkText) {
      chunks.push({
        id,
        text: chunkText,
      });

      id++;
    }

    if (end >= cleanedText.length) {
      break;
    }

    // Keep overlap internally for better retrieval.
    let nextStart = Math.max(0, end - CHUNK_OVERLAP);

    // Make sure the next chunk also starts at a complete word.
    const nextSpace = cleanedText.indexOf(" ", nextStart);

    if (nextSpace !== -1 && nextSpace < end) {
      nextStart = nextSpace + 1;
    }

    start = nextStart;
  }

  return chunks;
}