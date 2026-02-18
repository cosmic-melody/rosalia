import { onMount, onCleanup, For, Show, createSignal } from "solid-js";
import { useParams, useNavigate, A } from "@solidjs/router";
import { chatStore } from "../stores/chat";

export default function Chat() {
  const params = useParams();
  const navigate = useNavigate();
  const [input, setInput] = createSignal("");

  onMount(() => {
    chatStore.loadConversation(params.id);
  });

  onCleanup(() => {
    chatStore.reset();
  });

  const handleSend = () => {
    const text = input().trim();
    if (!text || chatStore.streaming) return;
    setInput("");
    chatStore.sendMessage(text);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", "flex-direction": "column", height: "100vh" }}>
      <header style={{
        padding: "1rem",
        "border-bottom": "1px solid var(--border)",
        display: "flex",
        "align-items": "center",
        gap: "1rem",
      }}>
        <A href="/" style={{ color: "var(--text-muted)" }}>← Back</A>
        <h2 style={{ margin: 0, "font-size": "1rem" }}>
          {chatStore.conversation?.title ?? "Chat"}
        </h2>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
        <Show when={chatStore.loading}>
          <p style={{ color: "var(--text-muted)", "text-align": "center" }}>Loading...</p>
        </Show>

        <For each={chatStore.messages}>
          {(msg) => (
            <div style={{
              "margin-bottom": "1rem",
              display: "flex",
              "justify-content": msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div class="card" style={{
                "max-width": "70%",
                background: msg.role === "user" ? "var(--accent)" : "var(--surface)",
              }}>
                <div style={{ "white-space": "pre-wrap" }}>{msg.content}</div>
              </div>
            </div>
          )}
        </For>
      </div>

      <div style={{ padding: "1rem", "border-top": "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <textarea
            value={input()}
            onInput={(e) => setInput(e.currentTarget.value)}
            onkeydown={handleKeydown}
            placeholder="Type a message..."
            style={{ flex: 1, resize: "none", "min-height": "40px", "max-height": "200px" }}
            disabled={chatStore.streaming}
          />
          <button onClick={handleSend} disabled={!input().trim() || chatStore.streaming}>
            {chatStore.streaming ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
