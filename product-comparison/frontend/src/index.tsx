import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { App } from './App';

// Target the container ID in react_demo.liquid
let container = document.getElementById("container")!;
let root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
