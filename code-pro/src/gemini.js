const envKeys = [
  import.meta.env.VITE_GEMINI_API_KEY_1,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  import.meta.env.VITE_GEMINI_API_KEY_4,
  import.meta.env.VITE_GEMINI_API_KEY_5
].filter(Boolean);

const RAW_KEYS = envKeys;
const GEMINI_KEYS = RAW_KEYS.map((k) => k.replace(/\s+/g, ""));

const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview"
];

export async function askGeminiCodeChat({ currentCode, questionTitle, userPrompt, language }) {
  if (GEMINI_KEYS.length === 0) {
    throw new Error("No Gemini API keys found. Please configure VITE_GEMINI_API_KEY_1 in your .env file.");
  }

  const systemInstruction = `You are an expert coding assistant integrated directly into an online IDE.
The user is working on the following coding problem:
Problem: ${questionTitle || "Coding Problem"}
Current Code (${language || "cpp"}):
\`\`\`${language || "cpp"}
${currentCode}
\`\`\`

User Request: "${userPrompt}"

Provide a clear, helpful response. If your solution modifies or improves the code, you MUST return a valid JSON object with:
{
  "explanation": "Clear explanation of what was fixed or changed",
  "new_code": "The complete revised code ready to be pasted into the editor, or null if no code changes needed",
  "detected_language": "The programming language of the new code (e.g. cpp, python, java, javascript)"
}
Return ONLY valid JSON.`;

  const payload = {
    contents: [
      {
        parts: [{ text: systemInstruction }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2
    }
  };

  let lastError = null;

  for (let k = 0; k < GEMINI_KEYS.length; k++) {
    const key = GEMINI_KEYS[k];
    for (let m = 0; m < CANDIDATE_MODELS.length; m++) {
      const model = CANDIDATE_MODELS[m];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=${key}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data?.candidates?.[0];
          const rawText = candidate?.content?.parts?.[0]?.text;
          if (rawText) {
            try {
              const parsed = JSON.parse(rawText);
              return {
                success: true,
                explanation: parsed.explanation || "Code updated.",
                newCode: parsed.new_code || null,
                language: parsed.detected_language || language
              };
            } catch {
              return {
                success: true,
                explanation: rawText,
                newCode: null
              };
            }
          }
        } else if (response.status === 429) {
          break;
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = errData?.error?.message || `HTTP ${response.status}`;
        }
      } catch (err) {
        lastError = err.message;
      }
    }
  }

  throw new Error(`Gemini Chat error: ${lastError || "Could not generate response"}`);
}
