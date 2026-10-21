// ============================================================================
// Pure Business Logic Module: helpdeskMetrics.js
// Enforces AGENTS.md Rule 4 & writing-ui-components/SKILL.md:
// "Las funciones puras de lógica o cálculo deben salir de los componentes
// hacia módulos hermanos para ser probadas de forma aislada."
// ============================================================================

import {
  HELPDESK_AGENTS_CATALOG,
  HELPDESK_CATEGORIES,
  HELPDESK_CHANNELS
} from '../schema/factTicketsGenerated.js';

export function filterFactTickets(tickets, filters) {
  if (!Array.isArray(tickets)) return [];

  return tickets.filter(t => {
    if (filters.period === 'today' && t.Dias_Antiguedad > 1) return false;
    if (filters.period === '3d' && t.Dias_Antiguedad > 3) return false;
    if (filters.period === '7d' && t.Dias_Antiguedad > 7) return false;

    if (filters.priority !== 'all' && t.Prioridad !== filters.priority) return false;
    if (filters.tier !== 'all' && t.Nivel_Soporte !== filters.tier) return false;
    if (filters.channel !== 'all' && t.Canal_Entrada !== filters.channel) return false;
    if (filters.category !== 'all' && t.Categoria !== filters.category) return false;
    if (filters.segment !== 'all' && t.Segmento_Cliente !== filters.segment) return false;

    if (filters.slaFilter === 'risk' && t.SLA_Estado !== 'riesgo') return false;
    if (filters.slaFilter === 'breached' && t.SLA_Estado !== 'vencido') return false;

    if (filters.selectedAgent && t.Agente !== filters.selectedAgent) return false;
    return true;
  });
}

export function computeSummaryKpis(tickets) {
  const totalCreated = tickets.length;
  const resolvedList = tickets.filter(t => t.Es_Resuelto);
  const totalResolved = resolvedList.length;
  const activeBacklog = totalCreated - totalResolved;
  const resolutionRatio = totalCreated > 0 ? ((totalResolved / totalCreated) * 100).toFixed(1) : '0.0';

  const avgFrt = totalCreated > 0
    ? Number((tickets.reduce((acc, t) => acc + t.Tiempo_FRT_Min, 0) / totalCreated).toFixed(1))
    : 0;

  const avgMttr = totalResolved > 0
    ? Number((resolvedList.reduce((acc, t) => acc + t.Tiempo_MTTR_Horas, 0) / totalResolved).toFixed(1))
    : 0;

  const fcrCount = tickets.filter(t => t.Resuelto_Primer_Contacto === 1).length;
  const fcrRate = totalCreated > 0 ? Number(((fcrCount / totalCreated) * 100).toFixed(1)) : 0;

  const csatRated = tickets.filter(t => t.CSAT !== null);
  const csatPositive = csatRated.filter(t => t.CSAT >= 4).length;
  const csatRate = csatRated.length > 0 ? Number(((csatPositive / csatRated.length) * 100).toFixed(1)) : 0;
  const csatStars = csatRated.length > 0
    ? (csatRated.reduce((acc, t) => acc + t.CSAT, 0) / csatRated.length).toFixed(2)
    : '0.00';

  const slaMetCount = tickets.filter(t => t.SLA_Cumplido === 1).length;
  const slaBreachedCount = totalCreated - slaMetCount;
  const slaRate = totalCreated > 0 ? Number(((slaMetCount / totalCreated) * 100).toFixed(1)) : 0;

  return {
    totalCreated,
    totalResolved,
    activeBacklog,
    resolutionRatio,
    avgFrt,
    frtIntent: avgFrt <= 15 ? 'success' : 'warning',
    avgMttr,
    mttrIntent: avgMttr <= 4.0 ? 'success' : 'error',
    fcrRate,
    fcrIntent: fcrRate >= 75 ? 'success' : 'warning',
    csatRate,
    csatStars,
    csatIntent: csatRate >= 90 ? 'success' : 'warning',
    slaRate,
    slaBreachedCount,
    slaIntent: slaRate >= 95 ? 'success' : slaRate >= 90 ? 'warning' : 'error'
  };
}

export function computeDailyTicketSeries(tickets) {
  const byDay = new Map();
  const sortedAsc = [...tickets].sort((a, b) => a.Fecha_Creacion_Dia.localeCompare(b.Fecha_Creacion_Dia));

  for (const t of sortedAsc) {
    const label = t.Fecha_Creacion_Dia.slice(5);
    if (!byDay.has(label)) {
      byDay.set(label, { day: label, created: 0, resolved: 0, breached: 0 });
    }
    const row = byDay.get(label);
    row.created += 1;
    if (t.Es_Resuelto) row.resolved += 1;
    if (t.SLA_Cumplido === 0) row.breached += 1;
  }

  return Array.from(byDay.values());
}

export function computeStatusFunnelBreakdown(tickets) {
  const stages = ['Nuevo', 'En Progreso', 'Pendiente Cliente', 'Escalado N2/N3', 'Resuelto', 'Cerrado'];
  const total = Math.max(1, tickets.length);

  return stages.map(stage => {
    const group = tickets.filter(t => t.Estado === stage);
    const ok = group.filter(t => t.SLA_Estado === 'cumplido').length;
    const risk = group.filter(t => t.SLA_Estado === 'riesgo').length;
    const breach = group.filter(t => t.SLA_Estado === 'vencido').length;
    return {
      stage,
      count: group.length,
      pctOfTotal: Number(((group.length / total) * 100).toFixed(1)),
      ok,
      risk,
      breach
    };
  });
}

export function computeCategoryAndChannelBreakdown(tickets) {
  const total = Math.max(1, tickets.length);

  const categories = HELPDESK_CATEGORIES.map(name => {
    const count = tickets.filter(t => t.Categoria === name).length;
    return {
      name,
      count,
      sharePct: Number(((count / total) * 100).toFixed(1))
    };
  }).sort((a, b) => b.count - a.count);

  const channels = HELPDESK_CHANNELS.map(name => {
    const count = tickets.filter(t => t.Canal_Entrada === name).length;
    return {
      name,
      count,
      sharePct: Number(((count / total) * 100).toFixed(1))
    };
  }).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  return { categories, channels };
}

export function computeAgentPerformanceRows(tickets, searchQuery = '') {
  const q = searchQuery.trim().toLowerCase();

  return HELPDESK_AGENTS_CATALOG
    .filter(ag => !q || ag.name.toLowerCase().includes(q) || ag.tier.toLowerCase().includes(q))
    .map(ag => {
      const assigned = tickets.filter(t => t.ID_Agente === ag.id);
      const total = assigned.length;
      const resolved = assigned.filter(t => t.Es_Resuelto);
      const avgFrt = total > 0
        ? (assigned.reduce((s, t) => s + t.Tiempo_FRT_Min, 0) / total).toFixed(1)
        : '0.0';
      const avgMttr = resolved.length > 0
        ? (resolved.reduce((s, t) => s + t.Tiempo_MTTR_Horas, 0) / resolved.length).toFixed(1)
        : '0.0';
      const fcrPct = total > 0
        ? Math.round((assigned.filter(t => t.Resuelto_Primer_Contacto === 1).length / total) * 100)
        : 0;
      const slaPct = total > 0
        ? Number(((assigned.filter(t => t.SLA_Cumplido === 1).length / total) * 100).toFixed(1))
        : 100;
      const csatItems = assigned.filter(t => t.CSAT !== null);
      const csatPct = csatItems.length > 0
        ? Math.round((csatItems.filter(t => t.CSAT >= 4).length / csatItems.length) * 100)
        : 0;

      return {
        ...ag,
        total,
        resolvedCount: resolved.length,
        avgFrt,
        avgMttr,
        fcrPct,
        slaPct,
        slaIntent: slaPct >= 95 ? 'success' : slaPct >= 88 ? 'warning' : 'error',
        csatPct,
        csatIntent: csatPct >= 90 ? 'success' : csatPct >= 80 ? 'warning' : 'error'
      };
    })
    .sort((a, b) => b.slaPct - a.slaPct);
}
