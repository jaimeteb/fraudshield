import { createRoot } from "react-dom/client";
import App from "@src/pages/content/components/Demo/app";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

refreshOnUpdate("pages/content");

const hostRoot = document.createElement("div");
const reactRoot = document.createElement("div");
const emotionRoot = document.createElement("style");

hostRoot.setAttribute("id", "ch-shadow-root");
reactRoot.setAttribute("id", "ch-react-root");

document.body.append(hostRoot);

hostRoot.attachShadow({ mode: "open" });
hostRoot.shadowRoot.appendChild(emotionRoot);
hostRoot.shadowRoot.appendChild(reactRoot);

const cache = createCache({
  key: "ch-css",
  prepend: true,
  container: emotionRoot,
});

createRoot(reactRoot).render(
  <CacheProvider value={cache}>
    <App />
  </CacheProvider>
);
