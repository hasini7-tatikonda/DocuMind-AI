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

```text

## Technologies Used

- React
- TypeScript
- Vite
- CSS
- Transformers.js
- Xenova/all-MiniLM-L6-v2
- Groq API
- PDF.js

---

## How It Works

### 1. Document Upload

The user uploads a PDF or TXT document through the application interface.

### 2. Text Extraction

The application extracts readable text from the uploaded document.

### 3. Chunking

The extracted text is divided into smaller sections so that relevant parts can be retrieved efficiently.

### 4. Embedding Generation

Each document chunk is converted into a numerical vector using:

`Xenova/all-MiniLM-L6-v2`

These embeddings represent the semantic meaning of the text.

### 5. Similarity Search

When the user asks a question, the question is also converted into an embedding.

The application compares the question embedding with the document chunk embeddings using cosine similarity and selects the most relevant chunks.

### 6. Grounded Answer Generation

The retrieved document context is provided to the Groq-powered language model.

The model is instructed to answer using the retrieved document context and avoid introducing information that is not supported by the uploaded document.

### 7. Retrieved Context

The application displays the retrieved sources and their similarity scores so that users can see which parts of the document supported the answer.

---

## Validation

DocuMind AI includes basic input validation.

If the user submits an empty question, the application asks them to enter a question instead of sending an unnecessary API request.

If the requested information cannot be found in the uploaded document, the application responds accordingly rather than intentionally generating an unrelated answer.

This helps keep responses grounded in the uploaded document.

---

## Example

A user can upload a document such as an internship task list and ask:

> What are the requirements for the Intermediate Level?

DocuMind AI retrieves the relevant sections of the uploaded document and generates an answer based on that context.

For questions where the requested information is not available in the document, the application indicates that the information could not be found.
