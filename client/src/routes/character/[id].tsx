import { createSignal, onMount, Show } from "solid-js";
import { useParams, useNavigate, A } from "@solidjs/router";
import type { Character } from "@rosalia/shared";

export default function CharacterEdit() {
  const params = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = createSignal<Character | null>(null);
  const [name, setName] = createSignal("");
  const [systemPrompt, setSystemPrompt] = createSignal("");
  const [loading, setLoading] = useState(false);

  onMount(async () => {
    try {
      const res = await fetch(`/api/characters/${params.id}`);
      const char = await res.json() as Character;
      setCharacter(char);
      setName(char.name);
      setSystemPrompt(char.systemPrompt);
    } catch (err) {
      console.error(err);
    }
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch(`/api/characters/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name().trim(),
          systemPrompt: systemPrompt().trim(),
        }),
      });
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this character?")) return;
    await fetch(`/api/characters/${params.id}`, { method: "DELETE" });
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem", "max-width": "600px", margin: "0 auto" }}>
      <header style={{ "margin-bottom": "2rem" }}>
        <A href="/" style={{ color: "var(--text-muted)" }}>← Back</A>
        <h1 style={{ margin: "0.5rem 0 0" }}>Edit Character</h1>
      </header>

      <Show when={!character()}>
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </Show>

      <Show when={character()}>
        <div style={{ "margin-bottom": "1rem" }}>
          <label style={{ display: "block", "margin-bottom": "0.5rem", color: "var(--text-muted)" }}>Name</label>
          <input
            type="text"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ "margin-bottom": "1.5rem" }}>
          <label style={{ display: "block", "margin-bottom": "0.5rem", color: "var(--text-muted)" }}>System Prompt</label>
          <textarea
            value={systemPrompt()}
            onInput={(e) => setSystemPrompt(e.currentTarget.value)}
            style={{ width: "100%", "min-height": "150px", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleSave} disabled={loading()}>Save</button>
          <button onClick={handleDelete} style={{ background: "#dc2626" }}>Delete</button>
        </div>
      </Show>
    </div>
  );
}

function useState<T>(initial: T): [() => T, (v: T) => void] {
  return createSignal(initial);
}
