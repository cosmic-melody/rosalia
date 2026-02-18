import { Elysia } from "elysia";
import { db } from "../db";
import { characters, conversations } from "../db/schema";
import { eq } from "drizzle-orm";
import { ChatService } from "../services/chat";
import type { ChatRequest, Character } from "@rosalia/shared";

const chatService = new ChatService();

export const chatRoutes = new Elysia({ prefix: "/chat" })
  .post("/start", async ({ body }): Promise<{ conversationId: string }> => {
    const { characterId } = body as { characterId: string };
    const conversationId = await chatService.getOrCreateConversation(characterId);
    return { conversationId };
  })
  .post("/stream", async ({ body, set }) => {
    const { conversationId, content } = body as ChatRequest;

    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .get();

    if (!conversation) {
      set.status = 404;
      return { error: "Conversation not found" };
    }

    const character = await db
      .select()
      .from(characters)
      .where(eq(characters.id, conversation.characterId))
      .get();

    if (!character) {
      set.status = 404;
      return { error: "Character not found" };
    }

    set.headers["Content-Type"] = "text/event-stream";
    set.headers["Cache-Control"] = "no-cache";
    set.headers["Connection"] = "keep-alive";

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const token of chatService.sendMessage(
            conversationId,
            content,
            character.systemPrompt
          )) {
            if (token === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            } else {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
              );
            }
          }
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: String(error) })}\n\n`
            )
          );
        }
        controller.close();
      },
    });

    return new Response(stream);
  });
