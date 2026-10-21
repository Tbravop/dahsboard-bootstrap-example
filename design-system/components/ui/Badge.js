// ============================================================================
// Core UI Component: Badge
// Enforces AGENTS.md Rule 1 (Reutilizar antes de crear) & Rule 7 (translate="no")
// ============================================================================

const INTENT_CLASS_MAP = {
  brand: 'ds-badge-brand',
  success: 'ds-badge-success',
  warning: 'ds-badge-warning',
  error: 'ds-badge-error',
  neutral: 'ds-badge-neutral'
};

export function renderBadge({ label, value = null, intent = 'neutral' }) {
  const variantClass = INTENT_CLASS_MAP[intent] || INTENT_CLASS_MAP.neutral;
  const valueNode = value !== null
    ? `<strong translate="no">${value}</strong>`
    : '';

  return `<span class="ds-badge ${variantClass}"><span>${label}</span>${valueNode}</span>`;
}
