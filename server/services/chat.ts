import { db } from "../db";
import { characters, conversations, messages } from "../db/schema";
import { eq } from "drizzle-orm";
import type { LLMProvider } from "./llm";
import { MockProvider } from "./llm/mock";

function generateId(): string {
  return crypto.randomUUID();
}

export class ChatService {
  private llm: LLMProvider;

  constructor(llm: LLMProvider = new MockProvider()) {
    this.llm = llm;
  }

  async getOrCreateConversation(characterId: string): Promise<string> {
    const character = await db
      .select()
      .from(characters)
      .where(eq(characters.id, characterId))
      .get();

    if (!character) {
      throw new Error("Character not found");
    }

    const conversationId = generateId();
    const now = new Date();

    await db.insert(conversations).values({
      id: conversationId,
      characterId,
      title: `Chat with ${character.name}`,
      createdAt: now,
      updatedAt: now,
    });

    return conversationId;
  }

  async getConversationMessages(conversationId: string) {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async *sendMessage(
    conversationId: string,
    content: string,
    systemPrompt: string
  ): AsyncGenerator<string> {
    const now = new Date();
    const userMessageId = generateId();
    const assistantMessageId = generateId();

    await db.insert(messages).values({
      id: userMessageId,
      conversationId,
      role: "user",
      content,
      createdAt: now,
    });

    const history = await this.getConversationMessages(conversationId);

    let fullResponse = "";
    for await (const token of this.llm.stream(history, systemPrompt)) {
      fullResponse += token;
      yield token;
    }

    yield "[DONE]";

    await db.insert(messages).values({
      id: assistantMessageId,
      conversationId,
      role: "assistant",
      content: fullResponse,
      createdAt: new Date(),
    });

    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));
  }
}
