import type { Message } from "@rosalia/shared";

export interface LLMProvider {
  stream(
    messages: Pick<Message, "role" | "content">[],
    systemPrompt: string
  ): AsyncGenerator<string>;
}
