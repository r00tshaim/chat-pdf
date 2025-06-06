# Chat with Your PDF – RAG Application

This project is a **Retrieval-Augmented Generation (RAG)** application that allows users to upload PDF documents and interact with them using natural language queries. The system leverages vector embeddings, a vector database, and a large language model (LLM) to provide accurate, context-aware answers based on the content of your PDFs.

---

## Features

- **PDF Upload:** Securely upload your PDF files.
- **Chat Interface:** Ask questions about your uploaded PDFs and get instant, relevant answers.
- **RAG Pipeline:** Combines vector search (Qdrant) and LLM (Google Gemini or OpenAI) for context-driven responses.
- **User Authentication:** Clerk integration for secure user management.
- **Scalable Architecture:** Decoupled processing using BullMQ and Valkey (Redis-compatible).

---

## Use Cases

- **Document Q&A:** Instantly query large PDF documents (manuals, research papers, invoices, etc.).
- **Knowledge Extraction:** Extract structured information from unstructured PDF content.
- **Enterprise Search:** Enable employees to interact with internal documents using natural language.
- **Education:** Students and teachers can quickly find answers in textbooks or lecture notes.

---

## System Design

![RAG System Design](attachment:image)

**Design Summary:**
1. **User uploads a PDF** via the web interface. The file is stored on the server.
2. A **Node.js worker** processes the PDF, splits it into chunks, and generates vector embeddings for each chunk using an embedding model.
3. These embeddings are stored in a **vector database** (Qdrant).
4. When the user asks a question, the query is embedded and used to search for relevant document chunks in the vector database.
5. The most relevant chunks are retrieved and sent, along with the user’s query, to an LLM as context.
6. The LLM generates a context-aware answer, which is displayed in the chat interface.

---

## Getting Started

### 1. Clone the Repository

```sh
git clone <your-repo-url>
cd chat-pdf
```

### 2. Install Dependencies

Install dependencies for both client and server:

```sh
cd client
pnpm install
cd ../server
pnpm install
```

### 3. Environment Variables

Create `.env` files in both `client` and `server` directories with the required API keys and configuration.

**Example for `/server/.env`:**
```
GOOGLE_API_KEY=your_google_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

**Example for `/client/.env`:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Start Qdrant and Valkey (Redis-compatible)

You can use Docker Compose to start both services from the `/server` directory:

```sh
cd server
docker-compose up -d
```

### 5. Start the Backend Server

```sh
pnpm dev
```

### 6. Start the Frontend

```sh
cd ../client
pnpm dev
```

- The frontend will be available at [http://localhost:3000](http://localhost:3000)
- The backend will run at [http://localhost:8000](http://localhost:8000)

---

## Folder Structure

```
chat-pdf/
  client/   # Next.js frontend
  server/   # Node.js backend
```

---

## License

MIT

---

## Credits

- [Next.js](https://nextjs.org/)
- [Qdrant](https://qdrant.tech/)
- [LangChain](https://js.langchain.com/)
- [Clerk](https://clerk.com/)
- [Google Generative AI](https://ai.google.dev/)
