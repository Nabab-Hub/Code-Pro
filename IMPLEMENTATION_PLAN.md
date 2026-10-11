# Code-Pro System Implementation Plan

## 1. Overview
The system consists of two major components connected via **Firebase Realtime Database**:
1. **`code-bot/` (Python CLI Bot)**:
   - Monitors `bot_status` in Firebase Realtime Database.
   - Provides a CLI interface with hotkey trigger (e.g., `F9` or `Ctrl+Alt+S`) and interactive capture mode.
   - Captures the active coding challenge window, scrolls down to capture the complete problem statement, test cases, and starter code.
   - Passes captured screenshots directly to Google Gemini Multimodal Vision API.
   - Gemini parses the question, derives an accurate solution conforming to the starter template, formats a concise single-line title, and generates clean code.
   - Pushes question details and solution to Firebase Realtime Database.

2. **`code-pro/` (Vite + React Web App)**:
   - Connects in real-time to Firebase Realtime Database (`https://quipu-c6fdb-default-rtdb.firebaseio.com`).
   - **Navbar**:
     - Remote Start / Stop toggle for the bot (updates Firebase `bot_status`).
     - Connection and sync indicators.
   - **Question Browser**:
     - Lists all captured questions with timestamps.
     - Formats questions with single-line concise titles.
     - Expandable view for complete problem descriptions and constraints.
   - **Monaco Editor**:
     - Displays full code solution with syntax highlighting.
     - One-click copy code button with status feedback.
   - **Integrated Chatbot**:
     - Context-aware code refinement using Gemini API.
     - Supports natural language prompts (e.g., "Fix runtime error", "Optimize time complexity", "Convert to Python", "Handle edge cases").
     - "Apply to Editor" functionality to update the solution instantly.

---

## 2. Directory Structure
```
Code-Pro/
├── apis                       # Firebase configuration and Gemini keys
├── IMPLEMENTATION_PLAN.md     # This specification document
├── code-bot/                  # Python CLI Bot
│   ├── requirements.txt       # Dependencies (pillow, pyautogui, keyboard, google-genai, requests, etc.)
│   ├── config.py              # Firebase & Gemini API configuration
│   ├── gemini_solver.py       # Vision analysis and problem solving logic
│   ├── screen_capture.py      # Multi-frame scrolling capture logic
│   ├── firebase_client.py     # Firebase RTDB REST client
│   └── bot.py                 # Interactive CLI entrypoint
└── code-pro/                  # Vite + React Application
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── firebase.js        # Firebase initialization & RTDB helpers
        ├── gemini.js          # Client-side chatbot Gemini integration
        ├── components/
        │   ├── Navbar.jsx     # Header with Start/Stop Bot toggle
        │   ├── QuestionList.jsx  # Question selector & history
        │   ├── QuestionView.jsx  # Single-line title & description
        │   ├── CodeEditor.jsx    # Monaco Editor with copy & actions
        │   └── Chatbot.jsx       # Floating / side drawer AI assistant
        ├── App.jsx
        └── index.css
```

---

## 3. Detailed Implementation Steps

### Step 1: Save Configuration and API Utilities
- Extract Firebase configuration and Gemini API keys (with multi-key failover support).

### Step 2: Implement Python `code-bot`
1. Create `requirements.txt` (`requests`, `Pillow`, `pyautogui`, `keyboard`, `google-genai`).
2. Implement `firebase_client.py`:
   - Set / get `bot_status` (active/inactive).
   - Push new question and solution to `/questions`.
3. Implement `screen_capture.py`:
   - Full screen or active window capture.
   - Auto-scroll (scroll down by delta) and capture second frame to cover long questions.
4. Implement `gemini_solver.py`:
   - Sends both image frames to Gemini Flash Vision.
   - Generates structured output:
     - `title`: Single-line clear problem title.
     - `description`: Full problem description with constraints.
     - `language`: Detected programming language (cpp, python, java, etc.).
     - `code`: Production-ready solution matching starter templates.
5. Implement `bot.py`:
   - Rich CLI menu.
   - Real-time Firebase status polling or hotkey listening.
   - Clear progress messages and feedback.

### Step 3: Implement Vite Frontend `code-pro`
1. Initialize Vite React project in `code-pro/`.
2. Install required packages:
   - `firebase`
   - `@monaco-editor/react`
   - `lucide-react` (clean icons)
3. Setup modern and clean dark/light UI:
   - Responsive layout with question sidebar, editor, and chatbot.
   - Real-time updates from Firebase RTDB.
   - Interactive Monaco editor with copy, language change, and reset.
   - Chatbot with Gemini prompt history and direct editor sync.

### Step 4: Verification & Testing
1. Test Firebase RTDB read/write for `bot_status` and `/questions`.
2. Test Gemini API response for problem solving.
3. Test web app build and launch locally.
