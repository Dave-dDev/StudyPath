import type { AIGenerator, AIConfig, ChatMessage } from "./types";

// Gemini uses its own API format — converts from OpenAI-style messages
export function createGeminiGenerator(config: AIConfig): AIGenerator {
  return {
    async chat(messages: ChatMessage[]): Promise<string> {
      // Extract system message and user messages
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

      // Add system instruction if present
      if (systemMsg) {
        body.systemInstruction = { parts: [{ text: systemMsg }] };
      }

      const url = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
