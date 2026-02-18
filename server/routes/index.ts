import { Elysia } from "elysia";
import { db } from "../db";
import { characters, conversations, messages } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Character, Conversation, Message } from "@rosalia/shared";

function generateId(): string {
  return crypto.randomUUID();
}

export const charactersRoutes = new Elysia({ prefix: "/characters" })
  .get("/", async (): Promise<Character[]> => {
    const result = await db.select().from(characters);
    return result;
  })
  .get("/:id", async ({ params }): Promise<Character | null> => {
    const result = await db
      .select()
      .from(characters)
      .where(eq(characters.id, params.id))
      .get();
    return result ?? null;
  })
  .post("/", async ({ body }): Promise<Character> => {
    const { name, avatar, systemPrompt } = body as Omit<
      Character,
      "id" | "createdAt"
    >;
    const id = generateId();
    const createdAt = Date.now();
    await db.insert(characters).values({
      id,
      name,
      avatar: avatar ?? null,
      systemPrompt,
      createdAt: new Date(createdAt),
    });
    return { id, name, avatar: avatar ?? null, systemPrompt, createdAt };
  })
  .put("/:id", async ({ params, body }): Promise<Character> => {
    const { name, avatar, systemPrompt } = body as Partial<
      Omit<Character, "id" | "createdAt">
    >;
    await db
      .update(characters)
      .set({
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
        ...(systemPrompt !== undefined && { systemPrompt }),
      })
      .where(eq(characters.id, params.id));
    const result = await db
      .select()
      .from(characters)
      .where(eq(characters.id, params.id))
      .get();
    if (!result) throw new Error("Character not found");
    return {
      ...result,
      createdAt: result.createdAt.getTime(),
    };
  })
  .delete("/:id", async ({ params }): Promise<{ success: boolean }> => {
    await db.delete(characters).where(eq(characters.id, params.id));
    return { success: true };
  });

export const conversationsRoutes = new Elysia({ prefix: "/conversations" })
  .get("/", async (): Promise<Conversation[]> => {
    const result = await db.select().from(conversations);
    return result.map((r) => ({
      ...r,
      createdAt: r.createdAt.getTime(),
      updatedAt: r.updatedAt.getTime(),
    }));
  })
  .get("/:id", async ({ params }): Promise<Conversation | null> => {
    const result = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, params.id))
      .get();
    if (!result) return null;
    return {
      ...result,
      createdAt: result.createdAt.getTime(),
      updatedAt: result.updatedAt.getTime(),
    };
  })
  .get("/:id/messages", async ({ params }): Promise<Message[]> => {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, params.id))
      .orderBy(messages.createdAt);
    return result.map((r) => ({
      ...r,
      createdAt: r.createdAt.getTime(),
    }));
  });
