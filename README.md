# DocuMind AI

### Intermediate Level – Document-Based RAG Assistant

DocuMind AI is a document-based question-answering assistant that allows users to upload PDF or TXT documents and ask questions based on their content.

The application uses Retrieval-Augmented Generation (RAG) to extract document content, split it into smaller chunks, generate embeddings, retrieve the most relevant sections, and use the retrieved context to generate grounded answers through the Groq API.

---

## Features

- Upload PDF and TXT documents
- Extract text from uploaded documents
- Split documents into smaller chunks
- Generate embeddings for document chunks
- Perform similarity-based vector search
- Retrieve relevant document context
- Generate grounded answers using the Groq API
- Display retrieved sources and similarity scores
- Handle empty questions with validation
- Respond appropriately when information is not available in the document
- Clean and responsive user interface

---

## RAG Workflow

The application follows this workflow:

```text
Upload PDF / TXT
       ↓
Document Text Extraction
       ↓
Text Chunking
       ↓
Embedding Generation
       ↓
Store Chunk Embeddings
       ↓
User Question
       ↓
Question Embedding
       ↓
Cosine Similarity Search
       ↓
Retrieve Top Relevant Chunks
       ↓
Build Grounded Prompt
       ↓
Groq LLM
       ↓
Final Answer + Retrieved Sources
