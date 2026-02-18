import type { Message } from "@rosalia/shared";
import type { LLMProvider } from "./index";

const DEFAULT_RESPONSE = "Hello! I'm happy to chat with you today. How can I help you?";

const MOCK_RESPONSES = [
  DEFAULT_RESPONSE,
  "That's an interesting question! Let me think about that for a moment...",
  "I understand what you're saying. Tell me more about your thoughts on this.",
  "Great point! Here's my perspective on that matter.",
];

export class MockProvider implements LLMProvider {
  async *stream(
    messages: Pick<Message, "role" | "content">[],
    _systemPrompt: string
  ): AsyncGenerator<string> {
    const lastMessage = messages.at(-1);
    const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length);
    const baseResponse = MOCK_RESPONSES[randomIndex] ?? DEFAULT_RESPONSE;

    const fullResponse: string = lastMessage?.content
      ? `You said: "${lastMessage.content.slice(0, 50)}..." ${baseResponse}`
      : baseResponse;

    for (const char of fullResponse) {
      yield char;
      await new Promise((r) => setTimeout(r, 20 + Math.random() * 30));
    }
  }
}
