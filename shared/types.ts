export interface Character {
  id: string;
  name: string;
  avatar: string | null;
  systemPrompt: string;
  createdAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  characterId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatRequest {
  conversationId: string;
  content: string;
}

export interface SSEEvent {
  type: "token" | "done" | "error";
  data: string;
}
