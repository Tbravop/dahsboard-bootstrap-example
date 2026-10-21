// ============================================================================
// Core UI Component: FormatDate
// Enforces AGENTS.md Rule 1 (Global Date Formatter) & Rule 7 (Translation Safety)
// ============================================================================

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('es-CL', {
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

export function renderFormatDate(isoDateString) {
  if (!isoDateString) {
    return '<span class="ds-small ds-muted">Pendiente</span>';
  }
  const dateObj = new Date(isoDateString);
  const formatted = DATE_TIME_FORMATTER.format(dateObj);
  return `<time class="ds-small ds-muted" datetime="${isoDateString}" translate="no">${formatted}</time>`;
}
