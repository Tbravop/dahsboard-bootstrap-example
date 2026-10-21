// ============================================================================
// Domain Component: CategoryChannelBreakdown.js
// Named Export: renderCategoryChannelBreakdown
// Uses @container card-panel (.ds-split-panel) so it adapts to container width
// ============================================================================

import { renderBadge } from '../../../components/ui/Badge.js';

export function renderCategoryChannelBreakdown({ categories, channels }) {
  const maxCatCount = Math.max(1, ...categories.map(c => c.count));

  return `
    <article class="ds-surface-card" data-attr="helpdesk-category-channel-card">
      <div>
        <h2 class="ds-h3">Distribución por Categoría y Canal</h2>
        <p class="ds-small ds-muted">Pareto de incidencias técnicas y mix de canales de entrada (adaptable por @container)</p>
      </div>

      <div class="ds-split-panel" style="margin-block-start: var(--space-xs);">
        <!-- Sub-panel A: Pareto de Categorías -->
        <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
          <h3 class="ds-small ds-muted" style="font-weight: 600; text-transform: uppercase;">Pareto por Categoría</h3>
          ${categories.map(cat => `
            <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
              <div style="display: flex; justify-content: space-between; gap: var(--space-xs);" class="ds-small">
                <span>${cat.name}</span>
                <strong translate="no">${cat.count} (${cat.sharePct}%)</strong>
              </div>
              <div class="ds-progress-track">
                <div class="ds-progress-fill" style="inline-size: ${(cat.count / maxCatCount) * 100}%; background-color: var(--color-brand-primary);"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Sub-panel B: Canales de Entrada -->
        <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
          <h3 class="ds-small ds-muted" style="font-weight: 600; text-transform: uppercase;">Canales de Entrada</h3>
          <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
            ${channels.map(ch => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
                <span class="ds-small" style="font-weight: 500;">${ch.name}</span>
                ${renderBadge({ label: `${ch.sharePct}%`, value: `(${ch.count})`, intent: 'neutral' })}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </article>
  `;
}
