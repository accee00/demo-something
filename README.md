# SentinelQA: Autonomous UI Test Generation & Self-Healing Engine
> **INNOVISTA 36-Hour Hackathon &bull; Problem Statement 08: The Flaky Testing Nightmare**

SentinelQA eliminates the bottleneck between "code complete" and "QA tested" by generating, executing, and autonomously self-healing Playwright UI test scripts directly from Jira Acceptance Criteria.

---

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd backend
npm install
npm start
```
* Backend API: `http://localhost:5001`
* Live WebSocket Telemetry: `ws://localhost:5001/ws`

### 2. Start the Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
* Web Dashboard & Demo Store: `http://localhost:5173`

---

## 📚 Complete Documentation
For detailed architecture, component diagrams, API specifications, and the hackathon demo walkthrough:
* 📖 [ARCHITECTURE_AND_DESIGN.md](file:///Users/accee/Desktop/FlakyTesting/ARCHITECTURE_AND_DESIGN.md)
* 📄 [Executive Analysis PDF (Monochrome Edition)](file:///Users/accee/Desktop/FlakyTesting/SentinelQA_Problem_Statement_8_Analysis.pdf)
* 🌐 [HTML Source of Analysis](file:///Users/accee/Desktop/FlakyTesting/SentinelQA_Analysis.html)

---

## 🛠️ Tech Stack
* **Backend:** Node.js (v20+), Express, WebSockets (`ws`), Playwright, Google Gemini API (`@google/genai`), Babel AST, Axios, Diff.
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons.
* **Integrations:** Atlassian Jira Cloud REST API (with pre-seeded mock ticket bank for zero-setup offline demos).

# demo-something
