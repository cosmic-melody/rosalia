import type { Message, Conversation } from "@rosalia/shared";
import { createStore, produce } from "solid-js/store";
import { fetchJSON, postJSON } from "../lib/api";

interface ChatState {
  messages: Message[];
  conversation: Conversation | null;
  loading: boolean;
  streaming: boolean;
  error: string | null;
}

const [state, setState] = createStore<ChatState>({
  messages: [],
  conversation: null,
  loading: false,
  streaming: false,
  error: null,
});

export const chatStore = {
  get messages() { return state.messages; },
  get conversation() { return state.conversation; },
  get loading() { return state.loading; },
  get streaming() { return state.streaming; },
  get error() { return state.error; },

  async loadConversation(id: string) {
    setState("loading", true);
    try {
      const [conv, msgs] = await Promise.all([
        fetchJSON<Conversation>(`/conversations/${id}`),
        fetchJSON<Message[]>(`/conversations/${id}/messages`),
      ]);
      setState("conversation", conv);
      setState("messages", msgs);
    } catch (e) {
      setState("error", String(e));
    } finally {
      setState("loading", false);
    }
  },

  async startConversation(characterId: string) {
    const { conversationId } = await postJSON<{ conversationId: string }>("/chat/start", { characterId });
    return conversationId;
  },

  async sendMessage(content: string) {
    if (!state.conversation) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      conversationId: state.conversation.id,
      role: "user",
      content,
      createdAt: Date.now(),
    };

    setState(produce(s => { s.messages.push(userMsg); }));
    setState("streaming", true);

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      conversationId: state.conversation.id,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };
    setState(produce(s => { s.messages.push(assistantMsg); }));

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: state.conversation.id, content }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data) as { token?: string; error?: string };
              if (parsed.token) {
                setState(produce(s => {
                  const last = s.messages.at(-1);
                  if (last?.role === "assistant") last.content += parsed.token;
                }));
              }
              if (parsed.error) {
                setState("error", parsed.error);
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }
    } catch (e) {
      setState("error", String(e));
    } finally {
      setState("streaming", false);
    }
  },

  reset() {
    setState({
      messages: [],
      conversation: null,
      loading: false,
      streaming: false,
      error: null,
    });
  },
};
