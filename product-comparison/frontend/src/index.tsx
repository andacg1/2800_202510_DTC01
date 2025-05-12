import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "./App";
import {
  defaultRecommendationContext,
  RecommendationContext,
} from "./RecommendationQuery/RecommendationContext.ts";

const container =
  document.getElementById("container") || document.getElementById("app");

if (!container) {
  console.error("Container element not found! Creating one...");
  const newContainer = document.createElement("div");
  newContainer.id = "container";
  document.body.appendChild(newContainer);

  const root = createRoot(newContainer);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
