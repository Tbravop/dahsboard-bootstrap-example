// ============================================================================
// Domain State Store: helpdeskStore.js
// Enforces AGENTS.md Rule 4 & writing-ui-components/SKILL.md:
// - Explicit initial resolution state ('unknown' -> 'loading' -> 'ready' | 'error')
// - Never uses [] or false to represent unresolved network state
// - Freezes public analytics & QA strings with // pinned: comments
// ============================================================================

import { generateCanonicalFactTickets } from '../schema/factTicketsGenerated.js';

// pinned: localStorage key — renaming breaks persisted operator theme preference
const STORAGE_THEME_KEY = 'helpdesk_ds_theme_v1';

const state = {
  // Explicit initial state per writing-ui-components/SKILL.md Section "Estados de resolución visual"
  resolutionState: 'unknown', // 'unknown' | 'loading' | 'error' | 'ready'
  errorMessage: null,
  rawTickets: null, // Explicitly null until resolved
  isActionInFlight: false,
  inspectedTicketId: null,
  theme: localStorage.getItem(STORAGE_THEME_KEY) || 'light',
  filters: {
    period: '7d',
    priority: 'all',
    tier: 'all',
    channel: 'all',
    category: 'all',
    segment: 'all',
    slaFilter: 'all',
    agentSearch: '',
    selectedAgent: null
  }
};

const listeners = new Set();

export function subscribeHelpdeskStore(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const listener of listeners) {
    listener(state);
  }
}

export function getHelpdeskState() {
  return state;
}

export function loadHelpdeskTelemetry({ simulateMode = 'ready', delayMs = 220 } = {}) {
  state.resolutionState = 'loading';
  state.isActionInFlight = true;
  state.errorMessage = null;
  notify();

  window.setTimeout(() => {
    state.isActionInFlight = false;

    if (simulateMode === 'error') {
      state.resolutionState = 'error';
      state.rawTickets = null;
      state.errorMessage = 'Fallo de conexión con el cluster de eventos Helpdesk (Timeout 504 en endpoint /api/v1/fact-tickets).';
      notify();
      return;
    }

    if (simulateMode === 'empty') {
      state.resolutionState = 'ready';
      state.rawTickets = [];
      notify();
      return;
    }

    state.resolutionState = 'ready';
    state.rawTickets = generateCanonicalFactTickets();
    notify();
  }, delayMs);
}

export function updateHelpdeskFilter(key, value) {
  state.filters = {
    ...state.filters,
    [key]: value
  };
  notify();
}

export function resetHelpdeskFilters() {
  state.filters = {
    period: '7d',
    priority: 'all',
    tier: 'all',
    channel: 'all',
    category: 'all',
    segment: 'all',
    slaFilter: 'all',
    agentSearch: '',
    selectedAgent: null
  };
  if (state.resolutionState !== 'ready' || (Array.isArray(state.rawTickets) && state.rawTickets.length === 0)) {
    loadHelpdeskTelemetry({ simulateMode: 'ready', delayMs: 120 });
    return;
  }
  notify();
}

export function setInspectedTicketId(ticketId) {
  state.inspectedTicketId = ticketId;
  notify();
}

export function setHelpdeskTheme(nextTheme) {
  if (nextTheme !== 'dark' && nextTheme !== 'light') return;
  if (state.theme === nextTheme && document.documentElement.getAttribute('data-theme') === nextTheme) return;
  state.theme = nextTheme;
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem(STORAGE_THEME_KEY, state.theme);
  notify();
}

export function toggleHelpdeskTheme() {
  const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
  setHelpdeskTheme(nextTheme);
  return nextTheme;
}
