# KhidmatAI 🧠
### *Empowering Pakistan's Informal Economy through Resilient Multi-Agent AI*

**KhidmatAI** is a production-ready mobile platform built with **Expo SDK 54** and **Node.js Express** that connects home service seekers with verified informal-economy workers (plumbers, electricians, AC technicians, painters) in Pakistan. 

It allows users to book services using natural language in **Urdu, Roman Urdu, or English** (e.g., *"AC technician G-13 kal subah"* or *"fan nahi chal raha"*), running them through a structured **5-Agent AI pipeline** to extract intent, match location, evaluate safety, and secure bookings.

---

## 🏗️ 1. Architecture Overview

KhidmatAI uses a secure, decoupled client-server architecture. All API keys and database credentials are kept on the server to prevent decompilation leaks from the mobile application.

```mermaid
graph TD
    A[Mobile Frontend: React Native + Expo] -- "1. Secure tRPC (superjson)" --> B[Backend Server: Express Adapter]
    B -- "2. Schema Queries (Drizzle)" --> C[(Neon.tech PostgreSQL Cloud Database)]
    B -- "3. Fallback Client (fetch)" --> D{LLM Fallback Chain}
    
    subgraph LLM Fallback Chain
        D -- "Try Primary" --> E[Gemini-2.5-Flash (Key 1)]
        D -- "On Rate Limit" --> F[Gemini-2.5-Flash (Key 2)]
        D -- "On Fail" --> G[Llama-3.3-70b-Versatile (Groq)]
    end

    C --> |Returns Providers & Chats| B
    E & F & G --> |Returns Structured JSON| B
    B --> |Streamed Agent Traces| A
```

---

## 🤖 2. The 5-Agent Multi-Agent Pipeline

When a user types a request, the backend coordinates a **five-stage agent execution trace**. The user sees animated step-by-step status updates directly on their screen as the agents think, rank, and book.

```
[User Message] ➜ [IntentAgent] ➜ [DiscoveryAgent] ➜ [MatchingAgent] ➜ [BookingAgent] ➜ [FollowUpAgent] ➜ [Success]
```

### 🧠 Agent 1: IntentAgent
* **Role:** Extracts structural parameters from informal natural language requests (including mixed Roman Urdu and English slang).
* **LLM Input:** User prompt + System prompt.
* **Extracted Schema:**
  ```json
  {
    "service_type": "electrician",
    "task_description": "fan repair (fan nahi chal raha)",
    "location": "G-11, Islamabad",
    "time": "Tomorrow morning",
    "budget": "negotiable",
    "is_complete": true
  }
  ```
* **Failure Handling:** If `service_type` or `location` is missing, the agent halts execution, sets `is_complete` to `false`, and generates a polite follow-up question in the **same language/script** that the user used.

### 🔍 Agent 2: DiscoveryAgent
* **Role:** Performs spatial database retrieval.
* **Process:** 
  1. Resolves the user's location via local coordinate resolution.
  2. Queries the Neon cloud database for active, verified providers matching the `service_type`.
  3. Applies the **Haversine Formula** to sort and filter providers within a strict **15km radius**.

### ⭐ Agent 3: MatchingAgent
* **Role:** Scores, matches, and ranks candidate workers.
* **Process:** Uses the LLM fallback chain to analyze the parsed task description against candidate profiles (reviews, rating weight, verified status, hourly rates). It ranks the top three matching workers and writes a custom, context-aware reasoning string explaining why they are the best fit for this specific job.

### ✅ Agent 4: BookingAgent
* **Role:** Handles transactional security.
* **Process:** Generates a randomized transaction tracking code (e.g., `KH-T3A9B2`) and persists the booking entry into the cloud database under `confirmed` status.

### 📢 Agent 5: FollowUpAgent
* **Role:** Analyzes risk, cost, and schedules notifications.
* **Process:**
  * Checks if the task description involves dangerous work (e.g. working with high voltage or climbing heights). If so, it flags a safety warning with custom warnings.
  * Estimates cost ranges and formats push notifications for the user.

---

## 🔌 3. Type-Safe tRPC API Integration

KhidmatAI establishes unified typesafety between the server and mobile client using **tRPC v11**. This eliminates boilerplate fetch code and ensures compile-time check validation.

### API Endpoints (`server/routers/booking.ts`)

1. **`chat` (Mutation):** 
   * **Input:** `message: string, sessionId?: string`
   * **Output:** Extracts user intent, updates message history, and saves state to the database.
2. **`recommend` (Mutation):**
   * **Input:** `sessionId: string, userLocation?: string`
   * **Output:** Performs Discovery geocoding, filters workers, ranks them using the LLM, and returns top matched profiles.
3. **`confirm` (Mutation):**
   * **Input:** `sessionId: string, providerId: number`
   * **Output:** Confirms the final transaction and returns unique tracking receipt codes.

---

## 🔑 4. Zero-Cost & Resilient LLM Fallback Pipeline

API rate-limits and network hiccups are the primary causes of application crashes during hackathon evaluations. To prevent this, KhidmatAI features a **resilient multi-provider client**:

```typescript
// server/_core/llm.ts
const modelsToTry = [
  {
    provider: "gemini-primary",
    model: "gemini-2.5-flash",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    key: ENV.geminiApiKey1,
  },
  {
    provider: "gemini-secondary",
    model: "gemini-2.5-flash",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    key: ENV.geminiApiKey2,
  },
  {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: ENV.groqApiKey,
  }
];
```

* **How it works:** When `invokeLLM()` is called, it attempts to query `gemini-primary` first. If a 429 (Rate Limit), 503 (Overloaded), or connection error is encountered, it logs a warning, skips to `gemini-secondary`, and if that fails, routes to `groq` as a final fail-safe. This guarantees **100% execution uptime** with zero billing costs.

---

## 🛠️ 5. Development & Local Run Instructions

### Prerequisites
* **Node.js** v18+ and **pnpm** installed.
* **Expo Go** application installed on your iOS/Android phone.

### Step 1: Environment Variables
Create a `.env` file in the root directory:
```env
# Database (Neon PostgreSQL Cloud Database)
DATABASE_URL="postgresql://neondb_owner:..."

# Fallback LLM Keys
GEMINI_API_KEY_1="AIzaSy..."
GEMINI_API_KEY_2="AIzaSy..."
GROQ_API_KEY="gsk_..."
```

### Step 2: Install Dependencies
```bash
pnpm install
```

### Step 3: Run Local Development Server
Start the Express API server and Metro bundler concurrently:
```bash
pnpm dev
```
* **Metro Bundler:** Runs on [http://localhost:8081](http://localhost:8081)
* **Express API Server:** Runs on [http://localhost:3000](http://localhost:3000)

### Step 4: Access Mobile App
* Scan the terminal's generated **QR Code** using your phone’s camera (iOS) or the Expo Go app (Android).
* *Note: Go to **Settings** in the mobile app and turn OFF "Use Mock Data" to connect live to your local Node server.*

---

## 🚢 6. Cloud Deployment & APK Compilation

### Deploy Backend Server (Render/Railway)
1. Link your GitHub repository to Render/Railway.
2. Configure build settings:
   * **Build Command:** `pnpm install && pnpm run build`
   * **Start Command:** `pnpm run start`
3. Paste all variables from your `.env` file into the cloud dashboard environment settings.
4. Render/Railway will compile `server/_core/index.ts` to `/dist` and start the server publicly.

### Compile Deployed APK
1. Set the cloud API URL in your mobile `.env`:
   ```env
   EXPO_PUBLIC_API_BASE_URL="https://your-public-backend-url.com"
   ```
2. Log in and build using Expo Application Services (EAS):
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform android --profile preview
   ```
3. Expo will compile your binary in the cloud and output a direct, installable **`.apk` file** download link in your terminal!
