// ============================================================================
// Domain Component: SlaStatusFunnel.js
// Named Export: renderSlaStatusFunnel
// Renders the operational funnel segmented by SLA state using OKLCH tokens
// ============================================================================

import { renderBadge } from '../../../components/ui/Badge.js';

export function renderSlaStatusFunnel(funnelRows) {
  const maxStageCount = Math.max(1, ...funnelRows.map(r => r.count));

  return `
    <article class="ds-surface-card" data-attr="helpdesk-status-funnel">
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-xs);">
        <div>
          <h2 class="ds-h3">Estado Actual de Tickets</h2>
          <p class="ds-small ds-muted">Embudo operativo y salud de SLA por etapa</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-sm); margin-block-start: var(--space-xs);">
        ${funnelRows.map(row => {
          const totalWidthPct = Math.max(4, (row.count / maxStageCount) * 100);
          const okRatio = row.count > 0 ? (row.ok / row.count) * 100 : 100;
          const riskRatio = row.count > 0 ? (row.risk / row.count) * 100 : 0;
          const breachRatio = row.count > 0 ? (row.breach / row.count) * 100 : 0;

          return `
            <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-xs);" class="ds-small">
                <span style="font-weight: 600;">${row.stage}</span>
                <span>
                  <strong translate="no">${row.count}</strong>
                  <span class="ds-muted"> (</span><span class="ds-muted" translate="no">${row.pctOfTotal}%</span><span class="ds-muted">)</span>
                </span>
              </div>
              <div class="ds-progress-track" style="display: flex; inline-size: ${totalWidthPct}%;">
                <div style="inline-size: ${okRatio}%; background-color: var(--color-status-success);" title="En tiempo: ${row.ok}"></div>
                <div style="inline-size: ${riskRatio}%; background-color: var(--color-status-warning);" title="En riesgo: ${row.risk}"></div>
                <div style="inline-size: ${breachRatio}%; background-color: var(--color-status-error);" title="SLA Vencido: ${row.breach}"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-block-start: auto; padding-block-start: var(--space-sm); border-block-start: 1px solid var(--color-border-subtle);">
        ${renderBadge({ label: 'En Tiempo', intent: 'success' })}
        ${renderBadge({ label: 'En Riesgo (<2h)', intent: 'warning' })}
        ${renderBadge({ label: 'SLA Vencido', intent: 'error' })}
      </div>
    </article>
  `;
}
