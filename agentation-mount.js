// ============================================================================
// Agentation Visual Feedback Toolbar Mount (Served from http://localhost:3000)
// ============================================================================

// Polyfill process.env.NODE_ENV required by agentation/dist/index.mjs in browser ESM
window.process = window.process || { env: { NODE_ENV: 'development' } };

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';

function mountAgentationToolbar() {
  let hostEl = document.getElementById('agentation-host');
  if (!hostEl) {
    hostEl = document.createElement('div');
    hostEl.id = 'agentation-host';
    document.body.appendChild(hostEl);
  }

  const root = createRoot(hostEl);
  root.render(
    createElement(Agentation, {
      endpoint: 'http://localhost:4747',
      appName: document.title || 'Helpdesk Dashboard',
      identifyingAttributes: ['data-attr', 'data-testid', 'data-qa', 'id']
    })
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAgentationToolbar);
} else {
  mountAgentationToolbar();
}
