import type { AIGenerator, AIConfig, ChatMessage } from "./types";

// Gemini uses its own API format — converts from OpenAI-style messages
// Supports both API keys (query param) and OAuth2 tokens (Authorization header)
export function createGeminiGenerator(config: AIConfig): AIGenerator {
  return {
    async chat(messages: ChatMessage[]): Promise<string> {
      const systemMsg = messages.find((m) => m.role === "system")?.content || "";
      const userMsgs = messages.filter((m) => m.role === "user");

      const contents = userMsgs.map((m) => ({
        role: "user",
        parts: [{ text: m.content }],
      }));

      const body: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
          responseMimeType: "application/json",
        },
      };

      if (systemMsg) {
        body.systemInstruction = { parts: [{ text: systemMsg }] };
      }

      // Determine auth method: API keys typically start with "AIza", OAuth2 tokens with "AQ."
      const isApiKey = config.apiKey?.startsWith("AIza");

      let url: string;
      const headers: Record<string, string> = { "Content-Type": "application/json" };

      if (isApiKey) {
        // Standard API key — use query parameter
        url = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;
      } else {
        // OAuth2 or other token — use Authorization header
        url = `${config.baseUrl}/models/${config.model}:generateContent`;
        headers["Authorization"] = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text || typeof text !== "string") {
        throw new Error("Gemini did not return a text response.");
      }

      return text;
    },
  };
}
