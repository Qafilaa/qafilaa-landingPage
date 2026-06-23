import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { pathToRoute } from './routes';
import './index.css';

const root = document.getElementById('root') as HTMLElement;

// Match whatever route the prerendered HTML was built for (derived from the URL
// the browser loaded) so hydration lines up with the server markup.
const route = pathToRoute(window.location.pathname);

const app = (
  <React.StrictMode>
    <App route={route} />
  </React.StrictMode>
);

// In production the markup is prerendered into #root (see prerender.mjs), so we
// hydrate it. In dev (`vite`) #root is empty, so we mount a fresh tree.
if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
