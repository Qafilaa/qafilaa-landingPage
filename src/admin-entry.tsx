/**
 * Client entry for the ops console.
 *
 * `createRoot`, never `hydrateRoot`: unlike every other page here, this one is not prerendered — see
 * the comment in `admin/index.html` for why. There is no server-rendered markup to hydrate onto, and
 * asking React to hydrate an empty container is a warning at best and a mismatch at worst.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AdminApp } from './admin/AdminApp';

const container = document.getElementById('admin-root');
if (!container) throw new Error('admin-entry: #admin-root is missing from admin/index.html');

createRoot(container).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
