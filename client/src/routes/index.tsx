import { createSignal, onMount, For, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { charactersStore } from "../stores/characters";
import { chatStore } from "../stores/chat";
import type { Character } from "@rosalia/shared";

export default function Home() {
  const navigate = useNavigate();

  onMount(() => {
    charactersStore.fetchAll();
  });

  const handleStartChat = async (characterId: string) => {
    const conversationId = await chatStore.startConversation(characterId);
    navigate(`/chat/${conversationId}`);
  };

  return (
    <div style={{ padding: "2rem", "max-width": "1200px", margin: "0 auto" }}>
      <header style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "2rem" }}>
        <h1>Rosalia</h1>
        <A href="/character">
          <button>+ New Character</button>
        </A>
      </header>

      <Show when={charactersStore.loading}>
        <p style={{ color: "var(--text-muted)" }}>Loading characters...</p>
      </Show>

      <Show when={charactersStore.error}>
        <p style={{ color: "red" }}>{charactersStore.error}</p>
      </Show>

      <Show when={!charactersStore.loading && charactersStore.characters.length === 0}>
        <div class="card" style={{ "text-align": "center" }}>
          <p style={{ color: "var(--text-muted)", "margin-bottom": "1rem" }}>No characters yet. Create your first one!</p>
          <A href="/character"><button>Create Character</button></A>
        </div>
      </Show>

      <div class="grid">
        <For each={charactersStore.characters}>
          {(char: Character) => (
            <div class="card" style={{ cursor: "pointer" }} onClick={() => handleStartChat(char.id)}>
              <div style={{ display: "flex", "align-items": "center", gap: "0.75rem", "margin-bottom": "0.5rem" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  "border-radius": "50%",
                  background: "var(--accent)",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "center",
                  "font-size": "1.25rem",
                }}>
                  {char.name[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{char.name}</h3>
                </div>
              </div>
              <p style={{ color: "var(--text-muted)", "font-size": "0.875rem", overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                {char.systemPrompt.slice(0, 60)}...
              </p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
