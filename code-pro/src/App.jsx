import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import QuestionList from "./components/QuestionList";
import QuestionView from "./components/QuestionView";
import CodeEditor from "./components/CodeEditor";
import Chatbot from "./components/Chatbot";
import { listenBotStatus, listenQuestions } from "./firebase";
import { Terminal, ListFilter, Code2, Sparkles } from "lucide-react";

export default function App() {
  const [botActive, setBotActive] = useState(false);
  const [questions, setQuestions] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [editorCode, setEditorCode] = useState("");
  const [editorLang, setEditorLang] = useState("cpp");
  
  // Mobile active tab: 'questions' | 'editor' | 'chat'
  const [mobileTab, setMobileTab] = useState("editor");

  // 1. Listen to Realtime Bot Status
  useEffect(() => {
    const unsubscribe = listenBotStatus((isActive) => {
      setBotActive(isActive);
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen to Realtime Questions
  useEffect(() => {
    const unsubscribe = listenQuestions((data) => {
      setQuestions(data || {});
    });
    return () => unsubscribe();
  }, []);

  // 3. Keep selected question in sync
  useEffect(() => {
    const keys = Object.keys(questions);
    if (keys.length === 0) {
      setSelectedId(null);
      setEditorCode("");
      return;
    }

    if (!selectedId || !questions[selectedId]) {
      const sortedKeys = keys.sort((a, b) => {
        return (questions[b].timestamp || 0) - (questions[a].timestamp || 0);
      });
      const latestKey = sortedKeys[0];
      setSelectedId(latestKey);
      setEditorCode(questions[latestKey].solution_code || "");
      setEditorLang(questions[latestKey].language || "cpp");
    }
  }, [questions, selectedId]);

  const handleSelectQuestion = (id) => {
    setSelectedId(id);
    if (questions[id]) {
      setEditorCode(questions[id].solution_code || "");
      setEditorLang(questions[id].language || "cpp");
      // On mobile, immediately switch to editor tab when question selected
      setMobileTab("editor");
    }
  };

  const handleResetCode = () => {
    if (selectedId && questions[selectedId]) {
      setEditorCode(questions[selectedId].solution_code || "");
      setEditorLang(questions[selectedId].language || "cpp");
    }
  };

  const handleApplyChatbotCode = (newCode, newLang) => {
    if (newCode) {
      setEditorCode(newCode);
      if (newLang) setEditorLang(newLang);
      // On mobile, switch to editor so user sees the applied fix
      setMobileTab("editor");
    }
  };

  const currentQuestion = selectedId ? questions[selectedId] : null;
  const questionCount = Object.keys(questions).length;

  return (
    <div className="app-container">
      <Navbar
        botActive={botActive}
        questionCount={questionCount}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
      />

      {/* Mobile Top Navigation Switcher */}
      <div className="mobile-tabs-bar">
        <button
          className={`mobile-tab-btn ${mobileTab === "questions" ? "active" : ""}`}
          onClick={() => setMobileTab("questions")}
        >
          <ListFilter size={16} />
          <span>Problems ({questionCount})</span>
        </button>

        <button
          className={`mobile-tab-btn ${mobileTab === "editor" ? "active" : ""}`}
          onClick={() => setMobileTab("editor")}
        >
          <Code2 size={16} />
          <span>Editor & Code</span>
        </button>

        <button
          className={`mobile-tab-btn ${mobileTab === "chat" ? "active" : ""}`}
          onClick={() => setMobileTab("chat")}
        >
          <Sparkles size={16} />
          <span>AI Chat</span>
        </button>
      </div>

      <div className={`main-layout mobile-view-${mobileTab}`}>
        {/* Left: Questions List */}
        <div className={`pane-wrapper pane-questions ${mobileTab !== "questions" ? "mobile-hidden" : ""}`}>
          <QuestionList
            questions={questions}
            selectedId={selectedId}
            onSelect={handleSelectQuestion}
          />
        </div>

        {/* Center: Main Workspace */}
        <div className={`pane-wrapper pane-workspace ${mobileTab !== "editor" ? "mobile-hidden" : ""}`}>
          <div className="workspace">
            {currentQuestion ? (
              <>
                <QuestionView question={currentQuestion} />
                <CodeEditor
                  code={editorCode}
                  language={editorLang}
                  onChange={(newVal) => setEditorCode(newVal)}
                  onReset={handleResetCode}
                />
              </>
            ) : (
              <div className="empty-state">
                <Terminal size={48} color="#6366f1" style={{ opacity: 0.7 }} />
                <h2 style={{ fontSize: "1.15rem", color: "var(--text-main)" }}>
                  Waiting for Coding Questions
                </h2>
                <p style={{ maxWidth: "420px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Run your Python bot to scan and solve coding challenges from your browser:
                </p>
                <div
                  style={{
                    background: "var(--bg-card)",
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    color: "#38bdf8"
                  }}
                >
                  python code-bot/bot.py
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Assistant Chatbot */}
        <div className={`pane-wrapper pane-chat ${mobileTab !== "chat" ? "mobile-hidden" : ""}`}>
          <Chatbot
            currentCode={editorCode}
            questionTitle={currentQuestion?.title || "Coding Problem"}
            language={editorLang}
            onApplyCode={handleApplyChatbotCode}
          />
        </div>
      </div>
    </div>
  );
}
