// ============================================================================
// Agentation Visual Feedback Toolbar Mount
// Disabled on GitHub Pages / production; only loads on localhost
// ============================================================================

const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

if (isLocal) {
  window.process = window.process || { env: { NODE_ENV: 'development' } };

  Promise.all([
    import('react'),
    import('react-dom/client'),
    import('agentation')
  ]).then(([{ createElement }, { createRoot }, { Agentation }]) => {
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
  }).catch(() => {
    // Ignore if agentation is not needed
  });
}
