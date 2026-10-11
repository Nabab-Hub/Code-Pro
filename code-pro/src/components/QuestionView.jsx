import React, { useState } from "react";
import { ChevronDown, ChevronUp, Zap, FileText, Code2 } from "lucide-react";

export default function QuestionView({ question }) {
  const [showFullDesc, setShowFullDesc] = useState(false);

  if (!question) return null;

  // Ensure single line concise title
  const singleLineTitle = (question.title || "Untitled Coding Question")
    .replace(/[\r\n]+/g, " ")
    .trim();

  return (
    <div className="workspace-header">
      <div className="question-title-single">
        <Zap size={22} color="#6366f1" />
        <span>{singleLineTitle}</span>
      </div>

      <div className="question-tags">
        {question.complexity && (
          <span className="tag-pill complexity">
            <Zap size={13} /> {question.complexity}
          </span>
        )}

        <span className="tag-pill">
          <Code2 size={13} /> Language: {(question.language || "cpp").toUpperCase()}
        </span>

        {question.description && (
          <button
            onClick={() => setShowFullDesc(!showFullDesc)}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: "auto", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
          >
            <FileText size={13} />
            {showFullDesc ? "Hide Full Problem" : "Show Full Problem & Constraints"}
            {showFullDesc ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>

      {showFullDesc && question.description && (
        <div className="description-details">
          <div className="description-content">{question.description}</div>
        </div>
      )}
    </div>
  );
}
