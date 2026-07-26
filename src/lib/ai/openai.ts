import type { AIGenerator, AIConfig, ChatMessage, ChatCompletionResponse } from "./types";

// Shared implementation for OpenAI-compatible APIs (OpenAI + Ollama)
export function createOpenAICompatibleGenerator(config: AIConfig): AIGenerator {
  return {
    async chat(messages: ChatMessage[]): Promise<string> {
      const endpoint = `${config.baseUrl.replace(/\/$/, "")}/chat/completions`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (config.apiKey) {
        headers["Authorization"] = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`${config.provider} API error ${response.status}: ${errorBody}`);
      }

      const data = (await response.json()) as ChatCompletionResponse;
      const choice = data.choices?.[0];
      const content = choice?.message?.content ?? choice?.content;

      if (!content || typeof content !== "string") {
        throw new Error(`${config.provider} did not return a text response.`);
      }

      return content;
    },
  };
}
