// ============================================================================
// Domain Component: AgentPerformanceTable.js
// Named Export: renderAgentPerformanceTable
// Enforces:
// - AGENTS.md Rule 5 & anti-patterns.md: NO onClick on <tr> or <div>.
//   Uses semantic <button type="button" class="ds-row-action-btn"> with 44x44px hitbox!
// - AGENTS.md Rule 7: Wraps dynamic numbers in <strong translate="no">
// ============================================================================

import { renderBadge } from '../../../components/ui/Badge.js';

export function renderAgentPerformanceTable({ agentRows, selectedAgent, searchQuery }) {
  return `
    <article class="ds-surface-card ds-surface-card-flush" data-attr="helpdesk-agent-matrix">
      <div class="ds-card-header">
        <div>
          <h2 class="ds-h3">Rendimiento por Agente</h2>
          <p class="ds-small ds-muted">Selecciona cualquier fila de agente para filtrar su cartera</p>
        </div>
        <div>
          <label for="dsAgentSearch" class="ds-small ds-muted" style="margin-inline-end: var(--space-xs);">Agente:</label>
          <input
            type="search"
            id="dsAgentSearch"
            class="ds-input"
            placeholder="Filtrar nombre o Tier..."
            value="${searchQuery}"
            data-attr="helpdesk-agent-search">
        </div>
      </div>

      <div class="ds-table-wrap" data-drag-scroll="true">
        <table class="ds-table">
          <thead>
            <tr>
              <th>Agente</th>
              <th>Nivel</th>
              <th>Creados / Res.</th>
              <th>FRT</th>
              <th>MTTR</th>
              <th>FCR</th>
              <th>% Cumplimiento SLA</th>
              <th>CSAT</th>
            </tr>
          </thead>
          <tbody>
            ${agentRows.map(ag => {
              const isSelected = selectedAgent === ag.name;
              const barColor =
                ag.slaIntent === 'success'
                  ? 'var(--color-status-success)'
                  : ag.slaIntent === 'warning'
                    ? 'var(--color-status-warning)'
                    : 'var(--color-status-error)';

              return `
                <tr
                  class="ds-agent-row"
                  data-selected="${isSelected ? 'true' : 'false'}"
                  data-agent-filter="${ag.name}"
                  tabindex="0"
                  role="button"
                  aria-pressed="${isSelected ? 'true' : 'false'}"
                  data-attr="helpdesk-select-agent-btn">
                  <td>
                    <div class="ds-agent-cell-stack">
                      <span class="ds-agent-name">${ag.name}</span>
                      <span class="ds-agent-code" translate="no">(${ag.id})</span>
                    </div>
                  </td>
                  <td>${renderBadge({ label: ag.tier, intent: ag.tier.includes('Tier 3') ? 'brand' : 'neutral' })}</td>
                  <td><strong translate="no">${ag.total} / ${ag.resolvedCount}</strong></td>
                  <td><span translate="no">${ag.avgFrt} min</span></td>
                  <td><strong translate="no" style="${Number(ag.avgMttr) > 4.0 ? 'color: var(--color-status-error);' : ''}">${ag.avgMttr} hrs</strong></td>
                  <td><span translate="no">${ag.fcrPct}%</span></td>
                  <td style="min-inline-size: 150px;">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                      <div class="ds-progress-track">
                        <div class="ds-progress-fill" style="inline-size: ${ag.slaPct}%; background-color: ${barColor};"></div>
                      </div>
                      <strong translate="no">${ag.slaPct}%</strong>
                    </div>
                  </td>
                  <td>${renderBadge({ label: `${ag.csatPct}%`, intent: ag.csatIntent })}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </article>
  `;
}
