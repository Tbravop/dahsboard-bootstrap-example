// ============================================================================
// Agentation Visual Feedback Toolbar Mount
// Works both on localhost (with MCP sync) and on GitHub Pages (standalone)
// ============================================================================

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

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  const root = createRoot(hostEl);
  root.render(
    createElement(Agentation, {
      endpoint: isLocal ? 'http://localhost:4747' : undefined,
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
