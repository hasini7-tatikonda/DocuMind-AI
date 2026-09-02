import { useState } from "react";
import { extractTextFromFile } from "./utils/pdfExtractor";
import { chunkText, type TextChunk } from "./utils/textChunker";
import { indexDocument, askDocument } from "./utils/rag";
import "./App.css";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [retrievedChunks, setRetrievedChunks] = useState<TextChunk[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const extension = selectedFile.name.toLowerCase().split(".").pop();

    if (extension !== "pdf" && extension !== "txt") {
      setError("Please upload a PDF or TXT file.");
      return;
    }

    setFile(selectedFile);
    setText("");
    setChunks([]);
    setQuestion("");
    setAnswer("");
    setRetrievedChunks([]);
    setScores([]);
    setError("");
    setLoading(true);

    try {
      // Extract text from the uploaded document.
      const extractedText = await extractTextFromFile(selectedFile);

      if (!extractedText.trim()) {
        throw new Error("No readable text was found in this document.");
      }

      // Split the document into smaller chunks.
      const documentChunks = chunkText(extractedText);

      if (!documentChunks.length) {
        throw new Error("Could not create usable document chunks.");
      }

      // Generate and store embeddings for the chunks.
      await indexDocument(documentChunks);

      setText(extractedText);
      setChunks(documentChunks);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process the document."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    setError("");
    setAnswer("");
    setRetrievedChunks([]);
    setScores([]);

    if (!file) {
      setError("Please upload a document first.");
      return;
    }

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    if (chunks.length === 0) {
      setError("The uploaded document contains no usable text.");
      return;
    }

    setAsking(true);

    try {
      const result = await askDocument(question, 3);

      setAnswer(result.answer);
      setRetrievedChunks(result.sources);
      setScores(result.scores);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate an answer."
      );
    } finally {
      setAsking(false);
    }
  };

  return (
    <main className="app">
      <h1>DocuMind AI</h1>

      <p className="subtitle">
        Ask questions about your uploaded PDF or TXT documents.
      </p>

      <div className="upload-box">
        <label htmlFor="file-upload">Upload Document</label>

        <input
          id="file-upload"
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={handleFileChange}
        />
      </div>

      {file && (
        <p className="file-name">
          Selected file: <strong>{file.name}</strong>
        </p>
      )}

      {loading && (
        <p className="status">
          Processing document and generating embeddings...
        </p>
      )}

      {error && <p className="error">{error}</p>}

      {text && !loading && (
        <section className="result">
          <h2>Document Processed</h2>

          <p>
            Successfully extracted{" "}
            <strong>{text.length}</strong> characters and created{" "}
            <strong>{chunks.length}</strong> chunks.
          </p>
        </section>
      )}

      {chunks.length > 0 && (
        <section className="question-section">
          <h2>Ask a Question</h2>

          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask something about your document..."
            rows={4}
          />

          <button
            type="button"
            onClick={handleAsk}
            disabled={asking}
          >
            {asking ? "Searching..." : "Ask DocuMind"}
          </button>
        </section>
      )}

      {answer && (
        <section className="result">
          <h2>Answer</h2>

          <div className="answer-box">
            {answer}
          </div>
        </section>
      )}

      {retrievedChunks.length > 0 && (
        <section className="result">
          <h2>Retrieved Context</h2>

          <p>
            These document sections were retrieved as supporting
            context for the answer.
          </p>

          {retrievedChunks.map((chunk, index) => (
            <article className="chunk" key={chunk.id}>
              <h3>
                Source {index + 1}
                {" — "}
                Similarity: {(scores[index] * 100).toFixed(1)}%
              </h3>

              <p>{chunk.text}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default App;