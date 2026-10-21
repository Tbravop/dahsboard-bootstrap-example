// ============================================================================
// Domain Component: TicketQueueTable.js
// Named Export: renderTicketQueueTable
// Enforces:
// - AGENTS.md Rule 1: Uses renderBadge & renderFormatDate (no raw date strings)
// - AGENTS.md Rule 5: Uses semantic <button> for ticket inspection (no tr onClick)
// - DESIGN.md: 44x44px hitboxes and OKLCH semantic colors
// ============================================================================

import { renderBadge } from '../../../components/ui/Badge.js';
import { renderFormatDate } from '../../../components/ui/FormatDate.js';

export function renderTicketQueueTable({ tickets, filters }) {
  const visibleRows = tickets.slice(0, 35);

  return `
    <section aria-label="Cola Operativa de Tickets" class="ds-surface-card ds-surface-card-flush" data-attr="helpdesk-ticket-table">
      <div class="ds-card-header">
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-sm);">
          <h2 class="ds-h3">Esquema Transaccional Activo (` + '`fact_tickets`' + `)</h2>
          ${renderBadge({ label: 'Registros:', value: `${visibleRows.length} de ${tickets.length}`, intent: 'neutral' })}
        </div>

        <div class="ds-slicer-group">
          <label for="dsFilterCategory" class="ds-small ds-muted">Categoría:</label>
          <select id="dsFilterCategory" class="ds-select" data-attr="helpdesk-filter-category">
            <option value="all" ${filters.category === 'all' ? 'selected' : ''}>Todas las categorías</option>
            <option value="Bug de Plataforma" ${filters.category === 'Bug de Plataforma' ? 'selected' : ''}>Bug de Plataforma</option>
            <option value="Integraciones API" ${filters.category === 'Integraciones API' ? 'selected' : ''}>Integraciones API</option>
            <option value="Acceso / Login" ${filters.category === 'Acceso / Login' ? 'selected' : ''}>Acceso / Login</option>
            <option value="Infraestructura" ${filters.category === 'Infraestructura' ? 'selected' : ''}>Infraestructura</option>
            <option value="Facturación" ${filters.category === 'Facturación' ? 'selected' : ''}>Facturación</option>
          </select>

          <label for="dsFilterSegment" class="ds-small ds-muted">Segmento:</label>
          <select id="dsFilterSegment" class="ds-select" data-attr="helpdesk-filter-segment">
            <option value="all" ${filters.segment === 'all' ? 'selected' : ''}>Todos los segmentos</option>
            <option value="Enterprise" ${filters.segment === 'Enterprise' ? 'selected' : ''}>Enterprise</option>
            <option value="Mid-Market" ${filters.segment === 'Mid-Market' ? 'selected' : ''}>Mid-Market</option>
            <option value="SMB" ${filters.segment === 'SMB' ? 'selected' : ''}>SMB</option>
          </select>
        </div>
      </div>

      <div class="ds-table-wrap" data-drag-scroll="true">
        <table class="ds-table">
          <thead>
            <tr>
              <th>ID_Ticket</th>
              <th>Fecha_Creación</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Categoría / Canal</th>
              <th>Cliente</th>
              <th>Agente</th>
              <th>FRT</th>
              <th>MTTR / SLA</th>
              <th>Estado SLA</th>
              <th>CSAT</th>
            </tr>
          </thead>
          <tbody>
            ${visibleRows.map(t => {
              const prioIntent =
                t.Prioridad.startsWith('P1') ? 'error' :
                t.Prioridad.startsWith('P2') ? 'warning' :
                t.Prioridad.startsWith('P3') ? 'brand' : 'neutral';

              const slaBadge =
                t.SLA_Estado === 'vencido'
                  ? renderBadge({ label: 'SLA Vencido', intent: 'error' })
                  : t.SLA_Estado === 'riesgo'
                    ? renderBadge({ label: 'En Riesgo (<2h)', intent: 'warning' })
                    : renderBadge({ label: 'Cumplido', intent: 'success' });

              const csatNode = t.CSAT !== null
                ? renderBadge({
                    label: '★'.repeat(t.CSAT),
                    intent: t.CSAT >= 4 ? 'success' : t.CSAT === 3 ? 'warning' : 'error'
                  })
                : '<span class="ds-small ds-muted">Sin encuesta</span>';

              return `
                <tr
                  class="ds-ticket-row"
                  data-breached="${t.SLA_Estado === 'vencido' ? 'true' : 'false'}"
                  data-inspect-ticket="${t.ID_Ticket}"
                  tabindex="0"
                  role="button"
                  aria-label="Inspeccionar ticket ${t.ID_Ticket}"
                  data-attr="helpdesk-ticket-row">
                  <td style="white-space: nowrap;">
                    <strong translate="no" style="color: var(--color-brand-primary);">${t.ID_Ticket}</strong>
                  </td>
                  <td>${renderFormatDate(t.Fecha_Creacion)}</td>
                  <td>${renderBadge({ label: t.Prioridad, intent: prioIntent })}</td>
                  <td><span>${t.Estado}</span></td>
                  <td>
                    <div style="font-weight: 600;">${t.Categoria}</div>
                    <div class="ds-small ds-muted">${t.Canal_Entrada}</div>
                  </td>
                  <td>
                    <div style="font-weight: 500;">${t.Cliente}</div>
                    <div class="ds-small ds-muted">${t.Segmento_Cliente}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600;">${t.Agente}</div>
                    <div class="ds-small ds-muted">${t.Nivel_Soporte}</div>
                  </td>
                  <td><span translate="no">${t.Tiempo_FRT_Min} min</span></td>
                  <td>
                    <strong translate="no" style="${t.SLA_Cumplido === 0 ? 'color: var(--color-status-error);' : ''}">${t.Tiempo_MTTR_Horas}h</strong>
                    <span class="ds-muted" translate="no"> / ${t.SLA_Objetivo_Horas}h</span>
                  </td>
                  <td>${slaBadge}</td>
                  <td>${csatNode}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
