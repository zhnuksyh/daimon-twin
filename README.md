# Daimon Twin

> "An intellectual companion, a mirror, and a sounding board."

Daimon Twin is a highly personalized, RAG-powered AI ghostwriter and companion. Instead of a generic LLM, Daimon is grounded in a "memory core" built directly from the user's private journals and philosophical musings. It combines a dark academia aesthetic with modern vector search capabilities to provide deeply contextual, introspective, and intentional responses.

<!-- DYNAMIC_SECTION:START -->
## 🧠 Memory Core Status
- **Journal Entries Ingested:** 0
- **Last Sync:** Sun, 01 Mar 2026 09:01:11 GMT
<!-- DYNAMIC_SECTION:END -->

## 🏗️ Architecture & Stack

The application is built with a modern, modular stack designed for scalability and speed:

*   **Frontend:** Vite + React + TypeScript
*   **Styling:** Tailwind CSS v4 + Lucide React icons
*   **Vector Database:** Supabase (`pgvector`) for storing and retrieving embedded journal chunks
*   **AI Models:** Google Generative AI (Gemini)
    *   `gemini-embedding-001` (768-dimensions) for vectorizing text chunks.
    *   `gemini-2.5-flash` for high-speed streaming generation using the retrieved context.

## 🚀 The RAG Pipeline (How it works)

1.  **Ingestion (`npm run ingest`):** A Node.js script parses local markdown journal entries, splits them into semantic paragraph chunks, generates embeddings via Google API, and upserts them into a secure Supabase database with Row Level Security (RLS) and deduplication.
2.  **Retrieval:** When the user sends a message, it is embedded on the fly. Supabase's vector similarity search (cosine distance) retrieves the most relevant journal chunks.
3.  **Generation:** The system constructs a massive prompt containing Daimon's engineered "system persona," the retrieved context chunks, the chat history, and the user's input. Gemini 2.5 Flash streams the response back to the UI in real-time.

## 💻 Local Development Setup

To run Daimon Twin locally, you'll need Supabase and Google AI API keys.

1.  **Clone down the repository:**
    ```bash
    git clone https://github.com/zhnuksyh/daimon-twin.git
    cd daimon-twin
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root based on `.env.example`:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_GOOGLE_API_KEY=your_google_gemini_api_key
    ```

4.  **Database Migration:**
    Run the SQL migrations inside `supabase/migrations/` in your Supabase SQL Editor to set up `pgvector`, the `journal_embeddings` table, and the related RPC functions/RLS policies.

5.  **Ingest Journals (Optional):**
    Drop your markdown files into the `journals/` directory and run:
    ```bash
    npm run ingest
    ```
    *(Run `npm run ingest:force` to wipe and re-embed all files)*

6.  **Start the Dev Server:**
    ```bash
    npm run dev
    ```

---
*Developed with intentionality. Designed to help step back from cognitive overload and focus on what matters.*
