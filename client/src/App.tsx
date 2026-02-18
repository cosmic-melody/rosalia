import { Router, Route } from "@solidjs/router";
import Home from "./routes/index";
import Chat from "./routes/chat";
import CharacterNew from "./routes/character/index";
import CharacterEdit from "./routes/character/[id]";

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/chat/:id" component={Chat} />
      <Route path="/character" component={CharacterNew} />
      <Route path="/character/:id" component={CharacterEdit} />
    </Router>
  );
}
