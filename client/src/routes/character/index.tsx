import { createSignal } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { charactersStore } from "../../stores/characters";

export default function CharacterNew() {
  const navigate = useNavigate();
  const [name, setName] = createSignal("");
  const [systemPrompt, setSystemPrompt] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!name().trim() || !systemPrompt().trim()) return;

    setLoading(true);
    try {
      const char = await charactersStore.create({
        name: name().trim(),
        systemPrompt: systemPrompt().trim(),
        avatar: null,
      });
      navigate(`/chat/${await createConversationAndNavigate(char.id)}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createConversationAndNavigate = async (characterId: string) => {
    const res = await fetch("/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId }),
    });
    const { conversationId } = await res.json() as { conversationId: string };
    return conversationId;
  };

  return (
    <div style={{ padding: "2rem", "max-width": "600px", margin: "0 auto" }}>
      <header style={{ "margin-bottom": "2rem" }}>
        <A href="/" style={{ color: "var(--text-muted)" }}>← Back</A>
        <h1 style={{ margin: "0.5rem 0 0" }}>Create Character</h1>
      </header>

      <form onSubmit={handleSubmit}>
        <div style={{ "margin-bottom": "1rem" }}>
          <label style={{ display: "block", "margin-bottom": "0.5rem", color: "var(--text-muted)" }}>Name</label>
          <input
            type="text"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Character name"
            style={{ width: "100%" }}
            required
          />
        </div>

        <div style={{ "margin-bottom": "1.5rem" }}>
          <label style={{ display: "block", "margin-bottom": "0.5rem", color: "var(--text-muted)" }}>System Prompt</label>
          <textarea
            value={systemPrompt()}
            onInput={(e) => setSystemPrompt(e.currentTarget.value)}
            placeholder="You are a helpful assistant..."
            style={{ width: "100%", "min-height": "150px", resize: "vertical" }}
            required
          />
        </div>

        <button type="submit" disabled={loading() || !name().trim() || !systemPrompt().trim()} style={{ width: "100%" }}>
          {loading() ? "Creating..." : "Create & Start Chat"}
        </button>
      </form>
    </div>
  );
}
