import React, { useState } from "react";
import { Sparkles, Send, Bot, User, Check, ArrowRight } from "lucide-react";
import { askGeminiCodeChat } from "../gemini";

export default function Chatbot({ currentCode, questionTitle, language, onApplyCode }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your AI Code Assistant. If the code needs fixes, optimizations, or language conversion, ask me below or pick a quick prompt!"
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const quickChips = [
    "⚡ Optimize Time/Space",
    "🐞 Fix Edge Cases",
    "🐍 Convert to Python",
    "☕ Convert to Java",
    "📝 Add Explanations"
  ];

  const handleSend = async (promptToSend) => {
    const prompt = (promptToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    // Append user message
    const newMessages = [...messages, { sender: "user", text: prompt }];
    setMessages(newMessages);
    setInputPrompt("");
    setLoading(true);

    try {
      const response = await askGeminiCodeChat({
        currentCode,
        questionTitle,
        userPrompt: prompt,
        language
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: response.explanation,
          suggestedCode: response.newCode,
          codeLang: response.language
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `⚠️ Error from AI assistant: ${err.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <div className="chat-title">
          <Sparkles size={18} color="#6366f1" />
          <span>AI Code Assistant</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat-msg ${m.sender === "user" ? "chat-msg-user" : "chat-msg-bot"}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600, fontSize: "0.75rem", color: "var(--text-dim)" }}>
              {m.sender === "user" ? <User size={13} /> : <Bot size={13} color="#6366f1" />}
              <span>{m.sender === "user" ? "You" : "Gemini AI"}</span>
            </div>

            <div>{m.text}</div>

            {m.suggestedCode && (
              <div style={{ marginTop: "0.5rem" }}>
                <button
                  onClick={() => onApplyCode(m.suggestedCode, m.codeLang)}
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%", justifyContent: "center" }}
                  title="Replace code in Monaco editor with this revision"
                >
                  <ArrowRight size={14} /> Apply to Editor
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-msg chat-msg-bot" style={{ color: "var(--text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={14} className="spin" color="#6366f1" />
              <span>Analyzing code and generating fix...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="chat-quick-chips">
        {quickChips.map((chip, i) => (
          <button
            key={i}
            className="chip-btn"
            disabled={loading}
            onClick={() => handleSend(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        className="chat-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          className="chat-input"
          placeholder="Ask AI to fix or change code..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={loading || !inputPrompt.trim()}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
