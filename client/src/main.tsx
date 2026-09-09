import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { captureFirstTouch } from "./lib/firstTouch";

// Primeiro toque de origem (utm/gclid/fbclid/referrer) — capturado antes de qualquer clique, nunca sobrescrito.
captureFirstTouch();

createRoot(document.getElementById("root")!).render(<App />);
