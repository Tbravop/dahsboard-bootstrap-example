// ============================================================================
// Domain Component: TicketTrendVisual.js
// Named Export: renderTicketTrendVisual
// Renders an accessible, token-driven SVG combo chart using DESIGN.md OKLCH
// variables (--color-brand-primary, --color-status-success, --color-status-error)
// ============================================================================

import { renderBadge } from '../../../components/ui/Badge.js';

export function renderTicketTrendVisual(dailySeries) {
  const width = 760;
  const height = 240;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxVal = Math.max(10, ...dailySeries.map(d => Math.max(d.created, d.resolved)));
  const count = Math.max(1, dailySeries.length);

  const getX = idx => padLeft + (count === 1 ? plotW / 2 : (idx / (count - 1)) * plotW);
  const getY = val => padTop + plotH - (val / maxVal) * plotH;

  const createdPoints = dailySeries.map((d, i) => `${getX(i).toFixed(1)},${getY(d.created).toFixed(1)}`).join(' ');
  const resolvedPoints = dailySeries.map((d, i) => `${getX(i).toFixed(1)},${getY(d.resolved).toFixed(1)}`).join(' ');

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(step => {
    const y = (padTop + plotH * (1 - step)).toFixed(1);
    const val = Math.round(maxVal * step);
    return `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--color-border-subtle)" stroke-width="1" />
      <text x="${padLeft - 8}" y="${Number(y) + 4}" text-anchor="end" fill="var(--color-text-muted)" font-size="12" translate="no">${val}</text>
    `;
  }).join('');

  const breachBars = dailySeries.map((d, i) => {
    const x = getX(i) - 6;
    const barH = (d.breached / maxVal) * plotH;
    const y = padTop + plotH - barH;
    return `
      <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="12" height="${Math.max(0, barH).toFixed(1)}" rx="2" fill="var(--color-status-error)" opacity="0.75">
        <title>${d.day}: ${d.breached} SLA vencidos</title>
      </rect>
      <text x="${getX(i).toFixed(1)}" y="${height - 8}" text-anchor="middle" fill="var(--color-text-muted)" font-size="12" translate="no">${d.day}</text>
    `;
  }).join('');

  const createdCircles = dailySeries.map((d, i) => `
    <circle cx="${getX(i).toFixed(1)}" cy="${getY(d.created).toFixed(1)}" r="4" fill="var(--color-brand-primary)">
      <title>${d.day} — Creados: ${d.created}</title>
    </circle>
  `).join('');

  const resolvedCircles = dailySeries.map((d, i) => `
    <circle cx="${getX(i).toFixed(1)}" cy="${getY(d.resolved).toFixed(1)}" r="4" fill="var(--color-status-success)">
      <title>${d.day} — Resueltos: ${d.resolved}</title>
    </circle>
  `).join('');

  return `
    <article class="ds-surface-card" data-attr="helpdesk-trend-card">
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-sm);">
        <div>
          <h2 class="ds-h3">Histórico y Tendencia de Tickets</h2>
          <p class="ds-small ds-muted">Comparativa diaria entre demanda entrante, capacidad de cierre e incumplimientos SLA</p>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-xs);">
          ${renderBadge({ label: '● Creados', intent: 'brand' })}
          ${renderBadge({ label: '● Resueltos', intent: 'success' })}
          ${renderBadge({ label: '■ SLA Vencidos', intent: 'error' })}
        </div>
      </div>

      <div style="inline-size: 100%; overflow-x: auto; margin-block-start: var(--space-sm);">
        <svg viewBox="0 0 ${width} ${height}" style="inline-size: 100%; block-size: auto; min-inline-size: 480px;" role="img" aria-label="Gráfico de tendencia diaria de tickets creados, resueltos y SLAs vencidos">
          ${gridLines}
          ${breachBars}
          <polyline fill="none" stroke="var(--color-brand-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${createdPoints}" />
          <polyline fill="none" stroke="var(--color-status-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${resolvedPoints}" />
          ${createdCircles}
          ${resolvedCircles}
        </svg>
      </div>
    </article>
  `;
}
