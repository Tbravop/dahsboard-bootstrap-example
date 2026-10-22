// ============================================================================
// Domain Component: KpiSummaryGrid.js
// Named Export: renderKpiSummaryGrid
// Enforces:
// - AGENTS.md Rule 1 (Reuses renderBadge & renderIconSvg)
// - AGENTS.md Rule 7 (Separates label spans from <strong translate="no"> numbers)
// - DESIGN.md 12-column fluid grid & semantic OKLCH tokens
// ============================================================================

import { renderBadge } from '../../../components/ui/Badge.js';
import { renderIconSvg } from '../../../components/ui/IconSvg.js';

export function renderKpiSummaryGrid(kpis) {
  const cards = [
    {
      id: 'kpi-volume',
      title: 'Volumen (Creados vs. Res.)',
      icon: 'inbox',
      metricValue: `${kpis.totalCreated} / ${kpis.totalResolved}`,
      badge: renderBadge({ label: 'Ratio', value: `${kpis.resolutionRatio}%`, intent: 'brand' }),
      targetLabel: 'Cola activa:',
      targetValue: `${kpis.activeBacklog}`
    },
    {
      id: 'kpi-frt',
      title: 'Tiempo Medio Respuesta (FRT)',
      icon: 'bolt',
      metricValue: `${kpis.avgFrt} min`,
      badge: renderBadge({
        label: kpis.frtIntent === 'success' ? 'En Meta' : 'Atención',
        intent: kpis.frtIntent
      }),
      targetLabel: 'Meta SLA:',
      targetValue: '< 15.0 min'
    },
    {
      id: 'kpi-mttr',
      title: 'Tiempo Resolución (MTTR)',
      icon: 'clock',
      metricValue: `${kpis.avgMttr} hrs`,
      badge: renderBadge({
        label: kpis.mttrIntent === 'success' ? 'En Meta' : 'Sobre Meta',
        intent: kpis.mttrIntent
      }),
      targetLabel: 'Meta SLA:',
      targetValue: '< 4.0 hrs'
    },
    {
      id: 'kpi-fcr',
      title: 'Resolución 1er Contacto (FCR)',
      icon: 'checkCircle',
      metricValue: `${kpis.fcrRate}%`,
      badge: renderBadge({
        label: kpis.fcrIntent === 'success' ? 'Óptimo' : 'Bajo Meta',
        intent: kpis.fcrIntent
      }),
      targetLabel: 'Meta:',
      targetValue: '≥ 75.0%'
    },
    {
      id: 'kpi-csat',
      title: 'Satisfacción Cliente (CSAT)',
      icon: 'star',
      metricValue: `${kpis.csatRate}%`,
      badge: renderBadge({
        label: 'Promedio',
        value: `★ ${kpis.csatStars}`,
        intent: kpis.csatIntent
      }),
      targetLabel: 'Meta:',
      targetValue: '≥ 90.0%'
    },
    {
      id: 'kpi-sla',
      title: '% Cumplimiento de SLA',
      icon: 'shieldAlert',
      metricValue: `${kpis.slaRate}%`,
      badge: renderBadge({
        label: 'Vencidos:',
        value: `${kpis.slaBreachedCount}`,
        intent: kpis.slaIntent
      }),
      targetLabel: 'Meta:',
      targetValue: '≥ 95.0%'
    }
  ];

  return `
    <section aria-label="Resumen de KPIs Principales" class="ds-kpi-strip" data-drag-scroll="true">
      ${cards.map(c => `
        <article class="ds-kpi-item ds-surface-card" data-attr="${c.id}">
          <div class="ds-kpi-header">
            <span class="ds-small ds-muted ds-kpi-title" title="${c.title}">${c.title}</span>
            <span class="ds-kpi-icon">${renderIconSvg(c.icon)}</span>
          </div>
          <div class="ds-h2 ds-kpi-metric" translate="no">${c.metricValue}</div>
          <div class="ds-kpi-footer">
            ${c.badge}
            <span class="ds-small ds-muted ds-kpi-target">
              <span>${c.targetLabel} </span>
              <strong translate="no">${c.targetValue}</strong>
            </span>
          </div>
        </article>
      `).join('')}
    </section>
  `;
}
