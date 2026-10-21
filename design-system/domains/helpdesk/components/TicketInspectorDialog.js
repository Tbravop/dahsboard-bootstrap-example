// ============================================================================
// Domain Component: TicketInspectorDialog.js
// Named Export: renderTicketInspectorDialog
// Native <dialog> inspector compliant with DESIGN.md tokens & 44x44px hitboxes
// ============================================================================

import { renderBadge } from '../../../components/ui/Badge.js';
import { renderFormatDate } from '../../../components/ui/FormatDate.js';
import { renderIconSvg } from '../../../components/ui/IconSvg.js';

export function renderTicketInspectorDialog(ticket) {
  if (!ticket) return '';

  const slaIntent = ticket.SLA_Cumplido === 1 ? 'success' : 'error';

  return `
    <div class="ds-card-header">
      <div style="display: flex; align-items: center; gap: var(--space-sm);">
        ${renderBadge({ label: ticket.ID_Ticket, intent: 'brand' })}
        <h3 class="ds-h3">${ticket.Categoria} — ${ticket.Cliente}</h3>
      </div>
      <button type="button" class="ds-btn" id="btnCloseInspectorDialog" aria-label="Cerrar inspector" data-attr="helpdesk-dialog-close">
        ${renderIconSvg('close', 'Cerrar')}
      </button>
    </div>

    <div style="padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-md);">
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); background-color: var(--color-bg-surface-subtle); border: 1px solid var(--color-border-subtle);">
        <div>
          <span class="ds-small ds-muted">Veredicto de SLA: </span>
          ${renderBadge({
            label: ticket.SLA_Cumplido === 1 ? 'SLA CUMPLIDO' : 'SLA VENCIDO',
            value: `${ticket.Tiempo_MTTR_Horas}h / ${ticket.SLA_Objetivo_Horas}h`,
            intent: slaIntent
          })}
        </div>
        <div>
          ${renderBadge({ label: ticket.Estado, intent: 'neutral' })}
        </div>
      </div>

      <div class="ds-split-panel">
        <div style="display: flex; flex-direction: column; gap: var(--space-xs); padding: var(--space-sm); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md);">
          <h4 class="ds-small ds-muted" style="text-transform: uppercase; font-weight: 600;">Tiempos y Trazabilidad</h4>
          <div style="display: flex; justify-content: space-between;" class="ds-small">
            <span>Fecha_Creacion:</span>
            ${renderFormatDate(ticket.Fecha_Creacion)}
          </div>
          <div style="display: flex; justify-content: space-between;" class="ds-small">
            <span>Fecha_Primera_Respuesta:</span>
            ${renderFormatDate(ticket.Fecha_Primera_Respuesta)}
          </div>
          <div style="display: flex; justify-content: space-between;" class="ds-small">
            <span>Fecha_Resolucion:</span>
            ${renderFormatDate(ticket.Fecha_Resolucion)}
          </div>
          <div style="display: flex; justify-content: space-between;" class="ds-small">
            <span>Canal_Entrada:</span>
            <strong>${ticket.Canal_Entrada}</strong>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--space-xs); padding: var(--space-sm); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md);">
          <h4 class="ds-small ds-muted" style="text-transform: uppercase; font-weight: 600;">Responsable y Calidad</h4>
          <div style="display: flex; justify-content: space-between;" class="ds-small">
            <span>Agente:</span>
            <strong>${ticket.Agente}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;" class="ds-small">
            <span>Nivel_Soporte:</span>
            <strong>${ticket.Nivel_Soporte}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;" class="ds-small">
            <span>Resuelto_Primer_Contacto:</span>
            <strong translate="no">${ticket.Resuelto_Primer_Contacto === 1 ? 'Sí (1)' : 'No (0)'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;" class="ds-small">
            <span>CSAT:</span>
            <strong translate="no">${ticket.CSAT !== null ? `${ticket.CSAT} / 5 ★` : 'Pendiente'}</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}
