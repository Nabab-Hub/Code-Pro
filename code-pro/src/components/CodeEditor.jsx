import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Check, RotateCcw, Code, Eye } from "lucide-react";

export default function CodeEditor({ code, language, onReset }) {
  const [copied, setCopied] = useState(false);
  const [currentLang, setCurrentLang] = useState(language || "cpp");

  // Keep internal language synced when question changes
  React.useEffect(() => {
    if (language) {
      setCurrentLang(language.toLowerCase());
    }
  }, [language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  // Map common language names to Monaco supported identifiers
  const getMonacoLang = (lang) => {
    const l = (lang || "").toLowerCase();
    if (l === "c++" || l === "cpp") return "cpp";
    if (l === "py" || l === "python") return "python";
    if (l === "js" || l === "javascript") return "javascript";
    if (l === "ts" || l === "typescript") return "typescript";
    if (l === "cs" || l === "csharp") return "csharp";
    if (l === "java") return "java";
    if (l === "go") return "go";
    if (l === "rust") return "rust";
    return "cpp";
  };

  const handleEditorDidMount = (editor, monaco) => {
    // 1. Prevent click/pointer events from placing blinking cursor or focusing
    editor.onMouseDown((e) => {
      e.event.preventDefault();
      e.event.stopPropagation();
      // Ensure active element blurs so no keyboard can ever show
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
    });

    const domNode = editor.getDomNode();
    if (domNode) {
      // 2. Prevent focus-in anywhere inside the editor
      domNode.addEventListener("focusin", (e) => {
        if (e.target && e.target.blur) {
          e.target.blur();
        }
      });

      // 3. Neutralize all Monaco hidden textareas (root cause of mobile keyboards)
      const textareas = domNode.querySelectorAll("textarea");
      textareas.forEach((ta) => {
        ta.setAttribute("inputmode", "none");
        ta.setAttribute("readonly", "true");
        ta.setAttribute("tabindex", "-1");
        ta.style.pointerEvents = "none";
        ta.addEventListener("focus", () => ta.blur());
      });
    }
  };

  return (
    <div className="editor-wrapper">
      <div className="editor-toolbar">
        <div className="editor-toolbar-left">
          <Code size={16} color="#6366f1" />
          <select
            className="select-input"
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value)}
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
          </select>

          {/* Clean View-Only Badge (Non-clickable) */}
          <span
            className="badge-view-only"
            title="Read-only display mode. Tap and scroll smoothly without keyboard popups."
          >
            <Eye size={12} color="#10b981" /> View Mode
          </span>
        </div>

        <div className="editor-toolbar-right">
          {onReset && (
            <button
              onClick={onReset}
              className="btn btn-secondary btn-sm"
              title="Reset to Original Bot Solution"
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}

          <button
            onClick={handleCopy}
            className={`btn ${copied ? "btn-success" : "btn-primary"} btn-sm`}
            title="Copy entire code to clipboard"
          >
            {copied ? (
              <>
                <Check size={14} /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy Code
              </>
            )}
          </button>
        </div>
      </div>

      <div
        className="editor-container non-clickable-editor"
        onClick={(e) => {
          // Immediately blur any active element if tapped
          if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
          }
        }}
      >
        <Editor
          height="100%"
          language={getMonacoLang(currentLang)}
          value={code || "// No code available"}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            readOnly: true,
            domReadOnly: true,
            cursorWidth: 0,
            cursorStyle: "line",
            renderLineHighlight: "none",
            selectionHighlight: false,
            occurrencesHighlight: false,
            contextmenu: false,
            links: false,
            matchBrackets: "never",
            selectOnLineNumbers: false,
            glyphMargin: false,
            folding: true,
            lineNumbers: "on",
            fontSize: 14,
            fontFamily: "'Fira Code', Consolas, 'Courier New', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>
    </div>
  );
}
