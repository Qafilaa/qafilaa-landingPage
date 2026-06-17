import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = document.getElementById('root') as HTMLElement;

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// In production the markup is prerendered into #root (see prerender.mjs), so we
// hydrate it. In dev (`vite`) #root is empty, so we mount a fresh tree.
if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
