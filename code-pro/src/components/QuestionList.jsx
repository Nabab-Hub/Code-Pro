import React from "react";
import { ListFilter, Trash2, Clock, Terminal } from "lucide-react";
import { deleteQuestion } from "../firebase";

export default function QuestionList({ questions, selectedId, onSelect }) {
  const questionEntries = Object.entries(questions).sort((a, b) => {
    return (b[1].timestamp || 0) - (a[1].timestamp || 0);
  });

  const handleDelete = async (e, qid) => {
    e.stopPropagation();
    if (window.confirm("Delete this question?")) {
      await deleteQuestion(qid);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="questions-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Captured ({questionEntries.length})</span>
        <ListFilter size={16} color="#94a3b8" />
      </div>

      <div className="question-list">
        {questionEntries.length === 0 ? (
          <div style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--text-dim)", fontSize: "0.85rem" }}>
            <Terminal size={28} style={{ margin: "0 auto 0.5rem auto", opacity: 0.5 }} />
            No questions captured yet.<br />
            Run your Python bot to scan problems!
          </div>
        ) : (
          questionEntries.map(([id, q]) => {
            const isSelected = id === selectedId;
            const lang = (q.language || "code").toLowerCase();

            return (
              <div
                key={id}
                className={`question-card ${isSelected ? "active" : ""}`}
                onClick={() => onSelect(id)}
              >
                <div className="question-card-title">
                  {q.title || "Untitled Coding Question"}
                </div>

                <div className="question-card-meta">
                  <span className={`badge badge-${lang}`}>{lang}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {q.timestamp && (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <Clock size={11} /> {formatTime(q.timestamp)}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-dim)",
                        padding: "2px"
                      }}
                      title="Delete Question"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
