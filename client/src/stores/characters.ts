import type { Character } from "@rosalia/shared";
import { createStore, produce } from "solid-js/store";
import { fetchJSON, postJSON } from "../lib/api";

interface CharactersState {
  characters: Character[];
  loading: boolean;
  error: string | null;
}

const [state, setState] = createStore<CharactersState>({
  characters: [],
  loading: false,
  error: null,
});

export const charactersStore = {
  get characters() { return state.characters; },
  get loading() { return state.loading; },
  get error() { return state.error; },

  async fetchAll() {
    setState("loading", true);
    try {
      const chars = await fetchJSON<Character[]>("/characters");
      setState("characters", chars);
    } catch (e) {
      setState("error", String(e));
    } finally {
      setState("loading", false);
    }
  },

  async create(data: Omit<Character, "id" | "createdAt">) {
    const char = await postJSON<Character>("/characters", data);
    setState(produce(s => { s.characters.push(char); }));
    return char;
  },
};
