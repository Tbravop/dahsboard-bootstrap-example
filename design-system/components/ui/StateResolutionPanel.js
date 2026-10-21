// ============================================================================
// Core UI Component: StateResolutionPanel
// Enforces writing-ui-components/SKILL.md & AGENTS.md Rule 5:
// Strict resolution branching order: Loading -> Error -> Empty -> Data
// ============================================================================

import { renderIconSvg } from './IconSvg.js';

export function renderStateResolutionPanel({
  resolutionState,
  errorMessage,
  isEmpty,
  emptyTitle = 'Sin registros para los filtros seleccionados',
  emptyDescription = 'Ajusta los segmentadores de prioridad, canal o estado de SLA para explorar otros tickets.',
  renderContent
}) {
  // 1. LOADING STATE (Before data resolves — never show Empty while loading!)
  if (resolutionState === 'unknown' || resolutionState === 'loading') {
    return `
      <section class="ds-surface-card ds-state-box" aria-live="polite" aria-busy="true" data-attr="helpdesk-state-loading">
        ${renderIconSvg('clock', 'Cargando métricas operativas')}
        <h2 class="ds-h3">Sincronizando telemetría de Helpdesk...</h2>
        <p class="ds-small ds-muted">Resolviendo tickets transaccionales y acuerdos de nivel de servicio (SLA).</p>
        <div class="ds-skeleton-bar"></div>
      </section>
    `;
  }

  // 2. ERROR STATE
  if (resolutionState === 'error') {
    return `
      <section class="ds-surface-card ds-state-box" role="alert" data-attr="helpdesk-state-error">
        <div style="color: var(--color-status-error);">
          ${renderIconSvg('shieldAlert', 'Error de sincronización')}
        </div>
        <h2 class="ds-h3">No se pudo cargar el flujo de tickets</h2>
        <p class="ds-small ds-muted">${errorMessage || 'El servicio de telemetría de soporte no respondió a tiempo.'}</p>
        <button type="button" class="ds-btn ds-btn-primary" id="btnRetryResolution" data-attr="helpdesk-retry-load">
          ${renderIconSvg('refresh')}
          <span>Reintentar conexión</span>
        </button>
      </section>
    `;
  }

  // 3. EMPTY STATE (Only evaluated AFTER resolutionState === 'ready')
  if (isEmpty) {
    return `
      <section class="ds-surface-card ds-state-box" data-attr="helpdesk-state-empty">
        ${renderIconSvg('inbox', 'Sin resultados')}
        <h2 class="ds-h3">${emptyTitle}</h2>
        <p class="ds-small ds-muted">${emptyDescription}</p>
        <button type="button" class="ds-btn" id="btnEmptyResetFilters" data-attr="helpdesk-empty-reset">
          <span>Restablecer todos los filtros</span>
        </button>
      </section>
    `;
  }

  // 4. RESOLVED DATA CONTENT
  return renderContent();
}
