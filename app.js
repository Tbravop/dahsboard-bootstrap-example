// ============================================================================
// Helpdesk / Customer Support Operations Dashboard — Core Application Logic
// Implements the full Data Schema (fact_tickets), KPIs, Slicers, and Charts
// ============================================================================

import { Dialog } from 'https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js';

// 1. Catálogo de Agentes y Configuración Operativa
const AGENTS = [
  { id: 'AG-01', name: 'Sofía Martínez', initials: 'SM', tier: 'Tier 1', theme: 'theme-primary', baseSpeed: 0.78, fcrProb: 0.86, csatBias: 0.94 },
  { id: 'AG-02', name: 'Mateo Rojas', initials: 'MR', tier: 'Tier 1', theme: 'theme-info', baseSpeed: 0.85, fcrProb: 0.82, csatBias: 0.91 },
  { id: 'AG-03', name: 'Valentina Silva', initials: 'VS', tier: 'Tier 1', theme: 'theme-success', baseSpeed: 0.92, fcrProb: 0.79, csatBias: 0.89 },
  { id: 'AG-04', name: 'Lucas Fernández', initials: 'LF', tier: 'Tier 2', theme: 'theme-warning', baseSpeed: 1.05, fcrProb: 0.74, csatBias: 0.90 },
  { id: 'AG-05', name: 'Camila Herrera', initials: 'CH', tier: 'Tier 2', theme: 'theme-primary', baseSpeed: 0.88, fcrProb: 0.77, csatBias: 0.93 },
  { id: 'AG-06', name: 'Diego Vargas', initials: 'DV', tier: 'Tier 3 - Ingeniería', theme: 'theme-danger', baseSpeed: 1.35, fcrProb: 0.62, csatBias: 0.84 },
  { id: 'AG-07', name: 'Elena Mendoza', initials: 'EM', tier: 'Tier 3 - Ingeniería', theme: 'theme-info', baseSpeed: 1.12, fcrProb: 0.70, csatBias: 0.92 }
];

const PRIORITIES = [
  { name: 'P1 - Crítica', weight: 0.10, slaHours: 2.0, frtTarget: 10 },
  { name: 'P2 - Alta', weight: 0.24, slaHours: 4.0, frtTarget: 15 },
  { name: 'P3 - Media', weight: 0.44, slaHours: 8.0, frtTarget: 30 },
  { name: 'P4 - Baja', weight: 0.22, slaHours: 24.0, frtTarget: 60 }
];

const CATEGORIES = [
  'Bug de Plataforma',
  'Integraciones API',
  'Acceso / Login',
  'Infraestructura',
  'Facturación'
];

const CHANNELS = [
  'Portal Web',
  'Chat en Vivo',
  'Email',
  'Slack / Teams',
  'Teléfono',
  'API'
];

const SEGMENTS = ['Enterprise', 'Mid-Market', 'SMB'];

const CLIENTS = [
  { name: ' CloudCore Corp', segment: 'Enterprise' },
  { name: 'Banco Andino Digital', segment: 'Enterprise' },
  { name: 'RetailMax Latam', segment: 'Enterprise' },
  { name: 'Logística Sur S.A.', segment: 'Mid-Market' },
  { name: 'Fintech Nova', segment: 'Mid-Market' },
  { name: 'MedHealth Systems', segment: 'Mid-Market' },
  { name: 'AgroTech Chile', segment: 'SMB' },
  { name: 'Estudio Creativo Pixel', segment: 'SMB' },
  { name: 'Inmobiliaria Horizonte', segment: 'SMB' }
];

// Generador determinista pseudo-aleatorio para consistencia reproducible
function createSeededRandom(seed = 20261021) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// 2. Generación de la tabla de hechos `fact_tickets` (180 tickets en 14 días)
function generateFactTickets() {
  const rand = createSeededRandom(42891);
  const tickets = [];
  const baseDate = new Date('2026-10-21T12:00:00');

  for (let i = 1; i <= 180; i++) {
    const daysAgo = Math.floor(Math.pow(rand(), 1.15) * 14); // Más volumen en días recientes
    const hoursOffset = Math.floor(rand() * 23);
    const minsOffset = Math.floor(rand() * 59);

    const createdDate = new Date(baseDate);
    createdDate.setDate(createdDate.getDate() - daysAgo);
    createdDate.setHours(hoursOffset, minsOffset, 0, 0);

    // Selección de Prioridad ponderada
    const rPrio = rand();
    let acc = 0;
    let prioObj = PRIORITIES[2];
    for (const p of PRIORITIES) {
      acc += p.weight;
      if (rPrio <= acc) {
        prioObj = p;
        break;
      }
    }

    // Selección de Agente según prioridad
    let agentPool = AGENTS;
    if (prioObj.name === 'P1 - Crítica') {
      agentPool = AGENTS.filter(a => a.tier !== 'Tier 1' || rand() > 0.5);
    }
    const agent = agentPool[Math.floor(rand() * agentPool.length)];

    const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)];
    const channel = CHANNELS[Math.floor(rand() * CHANNELS.length)];
    const client = CLIENTS[Math.floor(rand() * CLIENTS.length)];

    // Tiempo de primera respuesta (FRT en minutos)
    const frtMin = Math.max(
      1.5,
      Number(((prioObj.frtTarget * 0.48 * agent.baseSpeed) * (0.45 + rand() * 1.1)).toFixed(1))
    );

    const firstResponseDate = new Date(createdDate.getTime() + frtMin * 60 * 1000);

    // Estado del ticket (los más recientes tienen mayor probabilidad de seguir abiertos)
    let status = 'Cerrado';
    const openProb = daysAgo === 0 ? 0.52 : daysAgo <= 2 ? 0.24 : daysAgo <= 5 ? 0.08 : 0.0;
    const rStatus = rand();
    if (rStatus < openProb) {
      const openStates = ['Nuevo', 'En Progreso', 'Pendiente Cliente', 'Escalado N2/N3'];
      status = openStates[Math.floor(rand() * openStates.length)];
    } else {
      status = rand() > 0.35 ? 'Cerrado' : 'Resuelto';
    }

    const isResolved = status === 'Resuelto' || status === 'Cerrado';

    // Tiempo de resolución o tiempo transcurrido (MTTR en horas)
    const mttrHours = Number(
      Math.max(
        0.3,
        (prioObj.slaHours * 0.52 * agent.baseSpeed) * (0.35 + rand() * 1.25)
      ).toFixed(1)
    );

    const resolvedDate = isResolved
      ? new Date(createdDate.getTime() + mttrHours * 3600 * 1000)
      : null;

    // Cumplimiento de SLA y estado de riesgo
    const slaTarget = prioObj.slaHours;
    const slaMet = mttrHours <= slaTarget ? 1 : 0;
    let slaState = 'cumplido'; // 'cumplido' | 'riesgo' | 'vencido'
    if (!slaMet) {
      slaState = 'vencido';
    } else if (mttrHours >= slaTarget * 0.80) {
      slaState = 'riesgo';
    }

    // Resolución en primer contacto (FCR)
    const fcr = status === 'Escalado N2/N3' ? 0 : rand() < agent.fcrProb ? 1 : 0;

    // CSAT (1 a 5 estrellas, disponible para ~85% de los tickets resueltos)
    let csat = null;
    if (isResolved && rand() < 0.88) {
      const rCsat = rand();
      if (slaMet && rCsat < agent.csatBias) {
        csat = rand() > 0.32 ? 5 : 4;
      } else if (!slaMet && rCsat < 0.55) {
        csat = rand() > 0.4 ? 3 : 2;
      } else {
        csat = rand() > 0.25 ? 4 : 3;
      }
    }

    tickets.push({
      ID_Ticket: `INC-2026-${String(8400 + i).padStart(4, '0')}`,
      Fecha_Creacion: createdDate.toISOString(),
      Fecha_Creacion_Dia: createdDate.toISOString().slice(0, 10),
      Dias_Antiguedad: daysAgo,
      Fecha_Primera_Respuesta: firstResponseDate.toISOString(),
      Fecha_Resolucion: resolvedDate ? resolvedDate.toISOString() : null,
      Estado: status,
      Es_Resuelto: isResolved,
      Prioridad: prioObj.name,
      Categoria: category,
      Canal_Entrada: channel,
      ID_Agente: agent.id,
      Agente: agent.name,
      Agente_Iniciales: agent.initials,
      Agente_Theme: agent.theme,
      Nivel_Soporte: agent.tier,
      Tiempo_FRT_Min: frtMin,
      Tiempo_MTTR_Horas: mttrHours,
      Resuelto_Primer_Contacto: fcr,
      SLA_Objetivo_Horas: slaTarget,
      SLA_Cumplido: slaMet,
      SLA_Estado: slaState,
      CSAT: csat,
      Cliente: client.name.trim(),
      Segmento_Cliente: client.segment
    });
  }

  // Ordenar del más reciente al más antiguo
  return tickets.sort((a, b) => new Date(b.Fecha_Creacion) - new Date(a.Fecha_Creacion));
}

const FACT_TICKETS = generateFactTickets();

// 3. Estado Global de Filtros (Slicers)
const filterState = {
  period: '7d',
  priority: 'all',
  tier: 'all',
  channel: 'all',
  category: 'all',
  segment: 'all',
  slaFilter: 'all',
  agentSearch: '',
  selectedAgent: null,
  onlyFcr: false,
  onlyEnterprise: false
};

// Instancias de Chart.js
let trendChartInstance = null;
let statusFunnelChartInstance = null;
let categoryChartInstance = null;
let channelChartInstance = null;

// 4. Función de Filtrado Transaccional
function getFilteredTickets() {
  return FACT_TICKETS.filter(t => {
    // Rango de fechas
    if (filterState.period === 'today' && t.Dias_Antiguedad > 1) return false;
    if (filterState.period === '3d' && t.Dias_Antiguedad > 3) return false;
    if (filterState.period === '7d' && t.Dias_Antiguedad > 7) return false;

    // Prioridad
    if (filterState.priority !== 'all' && t.Prioridad !== filterState.priority) return false;

    // Nivel de Soporte
    if (filterState.tier !== 'all' && t.Nivel_Soporte !== filterState.tier) return false;

    // Canal
    if (filterState.channel !== 'all' && t.Canal_Entrada !== filterState.channel) return false;

    // Categoría
    if (filterState.category !== 'all' && t.Categoria !== filterState.category) return false;

    // Segmento
    if (filterState.segment !== 'all' && t.Segmento_Cliente !== filterState.segment) return false;

    // Estado SLA
    if (filterState.slaFilter === 'risk' && t.SLA_Estado !== 'riesgo') return false;
    if (filterState.slaFilter === 'breached' && t.SLA_Estado !== 'vencido') return false;

    // Agente seleccionado en la matriz
    if (filterState.selectedAgent && t.Agente !== filterState.selectedAgent) return false;

    // Switches del Drawer
    if (filterState.onlyFcr && t.Resuelto_Primer_Contacto !== 1) return false;
    if (filterState.onlyEnterprise && t.Segmento_Cliente !== 'Enterprise') return false;

    return true;
  });
}

// 5. Cálculo y Renderizado de los 6 KPIs Principales
function updateKPIs(tickets) {
  const totalCreated = tickets.length;
  const resolvedTickets = tickets.filter(t => t.Es_Resuelto);
  const totalResolved = resolvedTickets.length;
  const netBacklog = totalCreated - totalResolved;
  const resolutionRatio = totalCreated > 0 ? ((totalResolved / totalCreated) * 100).toFixed(1) : '0.0';

  // KPI 1: Volumen
  document.getElementById('kpiVolumeValue').textContent = `${totalCreated} / ${totalResolved}`;
  document.getElementById('kpiVolumeRatio').textContent = `${resolutionRatio}% Resuelto`;
  document.getElementById('kpiBacklogDelta').textContent = `Cola activa: ${netBacklog}`;

  // KPI 2: FRT Promedio
  const avgFrt = totalCreated > 0
    ? (tickets.reduce((sum, t) => sum + t.Tiempo_FRT_Min, 0) / totalCreated).toFixed(1)
    : '0.0';
  document.getElementById('kpiFrtValue').textContent = `${avgFrt} min`;
  const frtStatusEl = document.getElementById('kpiFrtStatus');
  if (Number(avgFrt) <= 15) {
    frtStatusEl.className = 'badge badge-subtle theme-success';
    frtStatusEl.textContent = '✓ En Meta';
  } else {
    frtStatusEl.className = 'badge badge-subtle theme-warning';
    frtStatusEl.textContent = '⚠ Atención';
  }

  // KPI 3: MTTR Promedio
  const avgMttr = totalResolved > 0
    ? (resolvedTickets.reduce((sum, t) => sum + t.Tiempo_MTTR_Horas, 0) / totalResolved).toFixed(1)
    : '0.0';
  document.getElementById('kpiMttrValue').textContent = `${avgMttr} hrs`;
  const mttrStatusEl = document.getElementById('kpiMttrStatus');
  if (Number(avgMttr) <= 4.0) {
    mttrStatusEl.className = 'badge badge-subtle theme-success';
    mttrStatusEl.textContent = '✓ En Meta';
  } else {
    mttrStatusEl.className = 'badge badge-subtle theme-danger';
    mttrStatusEl.textContent = '▲ Sobre Meta';
  }

  // KPI 4: FCR %
  const fcrCount = tickets.filter(t => t.Resuelto_Primer_Contacto === 1).length;
  const fcrPct = totalCreated > 0 ? ((fcrCount / totalCreated) * 100).toFixed(1) : '0.0';
  document.getElementById('kpiFcrValue').textContent = `${fcrPct}%`;
  const fcrStatusEl = document.getElementById('kpiFcrStatus');
  if (Number(fcrPct) >= 75) {
    fcrStatusEl.className = 'badge badge-subtle theme-success';
    fcrStatusEl.textContent = '✓ Óptimo';
  } else {
    fcrStatusEl.className = 'badge badge-subtle theme-warning';
    fcrStatusEl.textContent = 'Bajo Meta';
  }

  // KPI 5: CSAT %
  const csatTickets = tickets.filter(t => t.CSAT !== null);
  const csatPositive = csatTickets.filter(t => t.CSAT >= 4).length;
  const csatPct = csatTickets.length > 0 ? ((csatPositive / csatTickets.length) * 100).toFixed(1) : '0.0';
  const csatAvgStars = csatTickets.length > 0
    ? (csatTickets.reduce((s, t) => s + t.CSAT, 0) / csatTickets.length).toFixed(2)
    : '0.0';
  document.getElementById('kpiCsatValue').textContent = `${csatPct}%`;
  document.getElementById('kpiCsatStars').textContent = `★ ${csatAvgStars} / 5.0`;

  // KPI 6: % Cumplimiento SLA
  const slaMetCount = tickets.filter(t => t.SLA_Cumplido === 1).length;
  const slaBreachedCount = totalCreated - slaMetCount;
  const slaPct = totalCreated > 0 ? ((slaMetCount / totalCreated) * 100).toFixed(1) : '0.0';

  document.getElementById('kpiSlaValue').textContent = `${slaPct}%`;
  document.getElementById('headerBreachCount').textContent = `${slaBreachedCount} SLA Vencidos`;

  const slaCard = document.getElementById('kpiSlaCard');
  const slaIcon = document.getElementById('kpiSlaIcon');
  const slaBadge = document.getElementById('kpiSlaBadge');

  const slaTheme = Number(slaPct) >= 95 ? 'theme-success' : Number(slaPct) >= 90 ? 'theme-warning' : 'theme-danger';
  slaCard.className = `kpi-widget ${slaTheme}`;
  slaIcon.className = `kpi-icon-box ${slaTheme}`;
  slaBadge.className = `badge badge-subtle ${slaTheme}`;
  slaBadge.textContent = `${slaBreachedCount} incumplidos`;
}

// 6. Renderizado de los 4 Gráficos Recomendados (Chart.js)
function updateCharts(tickets) {
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.12)';

  // --------------------------------------------------------------------------
  // 4.1 Histórico y Tendencia de Tickets (Creados vs. Resueltos + SLA Vencidos)
  // --------------------------------------------------------------------------
  const byDayMap = new Map();
  const sortedAsc = [...tickets].sort((a, b) => a.Fecha_Creacion_Dia.localeCompare(b.Fecha_Creacion_Dia));

  for (const t of sortedAsc) {
    const day = t.Fecha_Creacion_Dia.slice(5); // MM-DD
    if (!byDayMap.has(day)) {
      byDayMap.set(day, { created: 0, resolved: 0, breached: 0 });
    }
    const entry = byDayMap.get(day);
    entry.created += 1;
    if (t.Es_Resuelto) entry.resolved += 1;
    if (t.SLA_Cumplido === 0) entry.breached += 1;
  }

  const dayLabels = Array.from(byDayMap.keys());
  const createdSeries = dayLabels.map(d => byDayMap.get(d).created);
  const resolvedSeries = dayLabels.map(d => byDayMap.get(d).resolved);
  const breachedSeries = dayLabels.map(d => byDayMap.get(d).breached);

  if (trendChartInstance) trendChartInstance.destroy();
  const trendCtx = document.getElementById('trendChart');
  trendChartInstance = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: dayLabels,
      datasets: [
        {
          label: 'Tickets Creados',
          data: createdSeries,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 3
        },
        {
          label: 'Tickets Resueltos',
          data: resolvedSeries,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 3
        },
        {
          type: 'bar',
          label: 'SLA Vencidos',
          data: breachedSeries,
          backgroundColor: 'rgba(239, 68, 68, 0.75)',
          borderRadius: 4,
          barPercentage: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } }
      }
    }
  });

  // --------------------------------------------------------------------------
  // 4.2 Estado Actual de los Tickets (Embudo de Etapas + Salud SLA)
  // --------------------------------------------------------------------------
  const statusOrder = ['Nuevo', 'En Progreso', 'Pendiente Cliente', 'Escalado N2/N3', 'Resuelto', 'Cerrado'];
  const statusSlaCounts = statusOrder.map(st => {
    const subset = tickets.filter(t => t.Estado === st);
    return {
      ok: subset.filter(t => t.SLA_Estado === 'cumplido').length,
      risk: subset.filter(t => t.SLA_Estado === 'riesgo').length,
      breach: subset.filter(t => t.SLA_Estado === 'vencido').length
    };
  });

  const activeQueue = tickets.filter(t => !t.Es_Resuelto).length;
  document.getElementById('activeQueueCount').textContent = `${activeQueue} activos en cola`;

  if (statusFunnelChartInstance) statusFunnelChartInstance.destroy();
  const statusCtx = document.getElementById('statusFunnelChart');
  statusFunnelChartInstance = new Chart(statusCtx, {
    type: 'bar',
    data: {
      labels: statusOrder,
      datasets: [
        {
          label: 'En Tiempo',
          data: statusSlaCounts.map(s => s.ok),
          backgroundColor: '#10b981',
          borderRadius: 4
        },
        {
          label: 'En Riesgo (<2h)',
          data: statusSlaCounts.map(s => s.risk),
          backgroundColor: '#f59e0b',
          borderRadius: 4
        },
        {
          label: 'SLA Vencido',
          data: statusSlaCounts.map(s => s.breach),
          backgroundColor: '#ef4444',
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, boxWidth: 10, padding: 12, font: { size: 11 } }
        }
      },
      scales: {
        x: { stacked: true, ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } },
        y: { stacked: true, ticks: { color: textColor }, grid: { display: false } }
      }
    }
  });

  // --------------------------------------------------------------------------
  // 4.3A Distribución por Categoría (Pareto Horizontal)
  // --------------------------------------------------------------------------
  const catCounts = CATEGORIES.map(cat => ({
    cat,
    count: tickets.filter(t => t.Categoria === cat).length
  })).sort((a, b) => b.count - a.count);

  if (categoryChartInstance) categoryChartInstance.destroy();
  const catCtx = document.getElementById('categoryChart');
  categoryChartInstance = new Chart(catCtx, {
    type: 'bar',
    data: {
      labels: catCounts.map(c => c.cat),
      datasets: [
        {
          label: 'Tickets',
          data: catCounts.map(c => c.count),
          backgroundColor: ['#2563eb', '#3b82f6', '#06b6d4', '#6366f1', '#64748b'],
          borderRadius: 5,
          barThickness: 18
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } },
        y: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } }
      }
    }
  });

  // --------------------------------------------------------------------------
  // 4.3B Distribución por Canal de Entrada (Doughnut)
  // --------------------------------------------------------------------------
  const channelCounts = CHANNELS.map(ch => ({
    ch,
    count: tickets.filter(t => t.Canal_Entrada === ch).length
  })).filter(c => c.count > 0);

  if (channelChartInstance) channelChartInstance.destroy();
  const channelCtx = document.getElementById('channelChart');
  channelChartInstance = new Chart(channelCtx, {
    type: 'doughnut',
    data: {
      labels: channelCounts.map(c => c.ch),
      datasets: [
        {
          data: channelCounts.map(c => c.count),
          backgroundColor: ['#2563eb', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#64748b'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '64%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, boxWidth: 10, padding: 8, font: { size: 10 } }
        }
      }
    }
  });
}

// 7. Renderizado de la Matriz de Rendimiento por Agente
function updateAgentTable(tickets) {
  const tbody = document.getElementById('agentTableBody');
  const searchQuery = filterState.agentSearch.trim().toLowerCase();

  const agentStats = AGENTS
    .filter(ag => !searchQuery || ag.name.toLowerCase().includes(searchQuery) || ag.tier.toLowerCase().includes(searchQuery))
    .map(ag => {
      const agTickets = tickets.filter(t => t.ID_Agente === ag.id);
      const total = agTickets.length;
      const resolved = agTickets.filter(t => t.Es_Resuelto);
      const avgFrt = total > 0 ? (agTickets.reduce((s, t) => s + t.Tiempo_FRT_Min, 0) / total).toFixed(1) : '0.0';
      const avgMttr = resolved.length > 0
        ? (resolved.reduce((s, t) => s + t.Tiempo_MTTR_Horas, 0) / resolved.length).toFixed(1)
        : '0.0';
      const fcrPct = total > 0
        ? ((agTickets.filter(t => t.Resuelto_Primer_Contacto === 1).length / total) * 100).toFixed(0)
        : '0';
      const slaPct = total > 0
        ? Number(((agTickets.filter(t => t.SLA_Cumplido === 1).length / total) * 100).toFixed(1))
        : 100;
      const csatList = agTickets.filter(t => t.CSAT !== null);
      const csatPct = csatList.length > 0
        ? Number(((csatList.filter(t => t.CSAT >= 4).length / csatList.length) * 100).toFixed(0))
        : 0;

      return { ...ag, total, resolvedCount: resolved.length, avgFrt, avgMttr, fcrPct, slaPct, csatPct };
    })
    .sort((a, b) => b.slaPct - a.slaPct);

  tbody.innerHTML = agentStats.map(ag => {
    const isSelected = filterState.selectedAgent === ag.name;
    const slaTheme = ag.slaPct >= 95 ? 'theme-success' : ag.slaPct >= 88 ? 'theme-warning' : 'theme-danger';
    const slaBarColor = ag.slaPct >= 95 ? '#10b981' : ag.slaPct >= 88 ? '#f59e0b' : '#ef4444';
    const csatTheme = ag.csatPct >= 90 ? 'theme-success' : ag.csatPct >= 80 ? 'theme-warning' : 'theme-danger';
    const tierTheme = ag.tier.includes('Tier 3') ? 'theme-primary' : ag.tier.includes('Tier 2') ? 'theme-info' : 'theme-secondary';

    return `
      <tr class="ticket-row-clickable ${isSelected ? 'bg-subtle-primary' : ''}" data-agent-name="${ag.name}">
        <td class="ps-4">
          <div class="d-flex align-items-center gap-2">
            <span class="agent-avatar ${ag.theme}">${ag.initials}</span>
            <div>
              <div class="fw-semibold">${ag.name}</div>
              <div class="fs-xs fg-secondary">${ag.id}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-subtle ${tierTheme}">${ag.tier}</span></td>
        <td class="text-center fw-medium">${ag.total} <span class="fg-secondary fw-normal">/ ${ag.resolvedCount}</span></td>
        <td class="text-center">${ag.avgFrt} m</td>
        <td class="text-center ${Number(ag.avgMttr) > 4.0 ? 'fg-danger fw-bold' : ''}">${ag.avgMttr} h</td>
        <td class="text-center">${ag.fcrPct}%</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="progress flex-grow-1" style="block-size: 6px;">
              <div class="progress-bar" role="progressbar" style="inline-size: ${ag.slaPct}%; background-color: ${slaBarColor};" aria-valuenow="${ag.slaPct}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <span class="fs-xs fw-bold ${ag.slaPct < 88 ? 'fg-danger' : ''}">${ag.slaPct.toFixed(1)}%</span>
          </div>
        </td>
        <td class="text-end pe-4">
          <span class="badge badge-subtle ${csatTheme}">${ag.csatPct}%</span>
        </td>
      </tr>
    `;
  }).join('');

  // Eventos de clic para filtrar por agente
  tbody.querySelectorAll('tr[data-agent-name]').forEach(row => {
    row.addEventListener('click', () => {
      const clickedName = row.getAttribute('data-agent-name');
      filterState.selectedAgent = filterState.selectedAgent === clickedName ? null : clickedName;
      renderDashboard();
    });
  });
}

// 8. Renderizado de la Tabla de Tickets (`fact_tickets`) y Modal de Inspección
function updateTicketTable(tickets) {
  const tbody = document.getElementById('ticketTableBody');
  const visibleTickets = tickets.slice(0, 35); // Mostrar los 35 más recientes para fluidez visual
  document.getElementById('ticketTableCount').textContent = `Mostrando ${visibleTickets.length} de ${tickets.length} tickets`;

  tbody.innerHTML = visibleTickets.map(t => {
    const prioTheme =
      t.Prioridad.startsWith('P1') ? 'theme-danger' :
      t.Prioridad.startsWith('P2') ? 'theme-warning' :
      t.Prioridad.startsWith('P3') ? 'theme-primary' : 'theme-secondary';

    const slaBadge =
      t.SLA_Estado === 'vencido'
        ? '<span class="badge badge-subtle theme-danger"><i class="bi bi-exclamation-octagon-fill me-1"></i>SLA Vencido</span>'
        : t.SLA_Estado === 'riesgo'
          ? '<span class="badge badge-subtle theme-warning"><i class="bi bi-exclamation-triangle-fill me-1"></i>En Riesgo</span>'
          : '<span class="badge badge-subtle theme-success"><i class="bi bi-check-circle-fill me-1"></i>En Tiempo</span>';

    const csatDisplay = t.CSAT !== null
      ? `<span class="badge badge-subtle ${t.CSAT >= 4 ? 'theme-success' : t.CSAT === 3 ? 'theme-warning' : 'theme-danger'}">${'★'.repeat(t.CSAT)}</span>`
      : '<span class="fs-xs fg-secondary">Pendiente</span>';

    const formattedDate = new Date(t.Fecha_Creacion).toLocaleString('es-CL', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <tr class="ticket-row-clickable ${t.SLA_Estado === 'vencido' ? 'bg-subtle-danger' : ''}" data-ticket-id="${t.ID_Ticket}">
        <td class="ps-4 fw-semibold">
          <code>${t.ID_Ticket}</code>
          ${t.Resuelto_Primer_Contacto ? '<span class="badge badge-subtle theme-info ms-1" title="Resuelto en Primer Contacto">FCR</span>' : ''}
        </td>
        <td class="fs-xs fg-secondary">${formattedDate}</td>
        <td><span class="badge badge-subtle ${prioTheme}">${t.Prioridad}</span></td>
        <td><span class="fw-medium">${t.Estado}</span></td>
        <td>
          <div class="fw-medium">${t.Categoria}</div>
          <div class="fs-xs fg-secondary"><i class="bi bi-broadcast me-1"></i>${t.Canal_Entrada}</div>
        </td>
        <td>
          <div>${t.Cliente}</div>
          <div class="fs-xs fg-secondary">${t.Segmento_Cliente}</div>
        </td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <span class="agent-avatar ${t.Agente_Theme}">${t.Agente_Iniciales}</span>
            <div>
              <div class="fw-medium">${t.Agente}</div>
              <div class="fs-xs fg-secondary">${t.Nivel_Soporte}</div>
            </div>
          </div>
        </td>
        <td class="text-center">${t.Tiempo_FRT_Min} m</td>
        <td class="text-center">
          <span class="fw-semibold ${t.SLA_Cumplido === 0 ? 'fg-danger' : ''}">${t.Tiempo_MTTR_Horas}h</span>
          <span class="fs-xs fg-secondary"> / ${t.SLA_Objetivo_Horas}h</span>
        </td>
        <td>${slaBadge}</td>
        <td class="text-end pe-4">${csatDisplay}</td>
      </tr>
    `;
  }).join('');

  // Abrir `<dialog class="dialog">` de Bootstrap 6 al hacer clic en una fila
  tbody.querySelectorAll('tr[data-ticket-id]').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-ticket-id');
      const ticket = FACT_TICKETS.find(item => item.ID_Ticket === id);
      if (ticket) openTicketDialog(ticket);
    });
  });
}

// 9. Inspector Modal usando el componente `Dialog` de Bootstrap 6
function openTicketDialog(t) {
  document.getElementById('dialogTicketId').textContent = t.ID_Ticket;
  document.getElementById('dialogTicketTitle').textContent = `${t.Categoria} — ${t.Cliente}`;

  const body = document.getElementById('dialogTicketBody');
  const slaAlertClass = t.SLA_Cumplido === 1 ? 'theme-success' : 'theme-danger';

  body.innerHTML = `
    <div class="alert ${slaAlertClass} d-flex align-items-center justify-content-between mb-3">
      <div>
        <strong>Estado de SLA: ${t.SLA_Cumplido === 1 ? 'CUMPLIDO EN TIEMPO' : 'SLA VENCIDO (INCUMPLIMIENTO)'}</strong>
        <div class="fs-xs">Tiempo empleado (MTTR): ${t.Tiempo_MTTR_Horas} hrs frente a un umbral objetivo de ${t.SLA_Objetivo_Horas} hrs (${t.Prioridad}).</div>
      </div>
      <span class="badge badge-subtle ${slaAlertClass}">${t.Estado}</span>
    </div>

    <div class="row g-3 fs-sm">
      <div class="col-12 md:col-6">
        <div class="p-3 rounded-4 border">
          <div class="fs-xs fw-bold text-uppercase fg-secondary mb-2">Metadatos del Ticket</div>
          <div class="d-flex justify-content-between py-1 border-bottom"><span>ID_Ticket:</span><code>${t.ID_Ticket}</code></div>
          <div class="d-flex justify-content-between py-1 border-bottom"><span>Fecha_Creación:</span><span>${new Date(t.Fecha_Creacion).toLocaleString('es-CL')}</span></div>
          <div class="d-flex justify-content-between py-1 border-bottom"><span>Fecha_1ª_Respuesta:</span><span>${new Date(t.Fecha_Primera_Respuesta).toLocaleString('es-CL')}</span></div>
          <div class="d-flex justify-content-between py-1"><span>Canal_Entrada:</span><strong>${t.Canal_Entrada}</strong></div>
        </div>
      </div>
      <div class="col-12 md:col-6">
        <div class="p-3 rounded-4 border">
          <div class="fs-xs fw-bold text-uppercase fg-secondary mb-2">Asignación y Métricas</div>
          <div class="d-flex justify-content-between py-1 border-bottom"><span>Agente Asignado:</span><strong>${t.Agente} (${t.Nivel_Soporte})</strong></div>
          <div class="d-flex justify-content-between py-1 border-bottom"><span>Tiempo FRT:</span><span>${t.Tiempo_FRT_Min} min</span></div>
          <div class="d-flex justify-content-between py-1 border-bottom"><span>Resolución 1er Contacto:</span><span>${t.Resuelto_Primer_Contacto ? 'Sí (FCR = 1)' : 'No (FCR = 0)'}</span></div>
          <div class="d-flex justify-content-between py-1"><span>Calificación CSAT:</span><span>${t.CSAT ? `${t.CSAT} / 5 ★` : 'Encuesta pendiente'}</span></div>
        </div>
      </div>
    </div>
  `;

  const dialogEl = document.getElementById('ticketDetailDialog');
  const instance = Dialog.getOrCreateInstance(dialogEl);
  instance.show();
}

// 10. Chips de Filtros Activos
function updateActiveFilterChips() {
  const container = document.getElementById('chipContainer');
  const wrapper = document.getElementById('activeFilterChips');
  const chips = [];

  if (filterState.priority !== 'all') chips.push({ label: `Prioridad: ${filterState.priority}`, key: 'priority', reset: 'all' });
  if (filterState.tier !== 'all') chips.push({ label: `Nivel: ${filterState.tier}`, key: 'tier', reset: 'all' });
  if (filterState.channel !== 'all') chips.push({ label: `Canal: ${filterState.channel}`, key: 'channel', reset: 'all' });
  if (filterState.category !== 'all') chips.push({ label: `Categoría: ${filterState.category}`, key: 'category', reset: 'all' });
  if (filterState.segment !== 'all') chips.push({ label: `Segmento: ${filterState.segment}`, key: 'segment', reset: 'all' });
  if (filterState.slaFilter !== 'all') chips.push({ label: `SLA: ${filterState.slaFilter}`, key: 'slaFilter', reset: 'all' });
  if (filterState.selectedAgent) chips.push({ label: `Agente: ${filterState.selectedAgent}`, key: 'selectedAgent', reset: null });
  if (filterState.onlyFcr) chips.push({ label: 'Solo FCR = 1', key: 'onlyFcr', reset: false });
  if (filterState.onlyEnterprise) chips.push({ label: 'Solo Enterprise', key: 'onlyEnterprise', reset: false });

  if (chips.length === 0) {
    wrapper.classList.add('d-none');
    container.innerHTML = '';
    return;
  }

  wrapper.classList.remove('d-none');
  container.innerHTML = chips.map((c, idx) => `
    <span class="badge badge-subtle theme-primary d-inline-flex align-items-center gap-1">
      ${c.label}
      <button type="button" class="btn-close" style="font-size: 0.55rem;" data-chip-idx="${idx}" aria-label="Quitar filtro"></button>
    </span>
  `).join('');

  container.querySelectorAll('button[data-chip-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const chip = chips[Number(btn.getAttribute('data-chip-idx'))];
      filterState[chip.key] = chip.reset;
      syncFormControlsWithState();
      renderDashboard();
    });
  });
}

function syncFormControlsWithState() {
  document.getElementById('filterPeriod').value = filterState.period;
  document.getElementById('filterPriority').value = filterState.priority;
  document.getElementById('filterTier').value = filterState.tier;
  document.getElementById('filterChannel').value = filterState.channel;
  document.getElementById('filterCategory').value = filterState.category;
  document.getElementById('filterSegment').value = filterState.segment;
  document.getElementById('switchOnlyFcr').checked = filterState.onlyFcr;
  document.getElementById('switchOnlyEnterprise').checked = filterState.onlyEnterprise;
  document.querySelectorAll('input[name="slaFilter"]').forEach(r => {
    r.checked = r.value === filterState.slaFilter;
  });
}

// 11. Exportar CSV del Esquema `fact_tickets`
function exportFilteredCsv() {
  const rows = getFilteredTickets();
  const headers = [
    'ID_Ticket',
    'Fecha_Creacion',
    'Fecha_Primera_Respuesta',
    'Fecha_Resolucion',
    'Prioridad',
    'Estado',
    'Categoria',
    'Canal_Entrada',
    'Agente',
    'Nivel_Soporte',
    'Tiempo_FRT_Min',
    'Tiempo_MTTR_Horas',
    'Resuelto_Primer_Contacto',
    'SLA_Objetivo_Horas',
    'SLA_Cumplido',
    'CSAT',
    'Segmento_Cliente'
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fact_tickets_helpdesk_${filterState.period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// 12. Ciclo Principal de Renderizado e Inicialización de Eventos
function renderDashboard() {
  const filtered = getFilteredTickets();
  updateKPIs(filtered);
  updateCharts(filtered);
  updateAgentTable(filtered);
  updateTicketTable(filtered);
  updateActiveFilterChips();
}

function initDashboard() {
  document.getElementById('filterPeriod').addEventListener('change', e => {
    filterState.period = e.target.value;
    renderDashboard();
  });
  document.getElementById('filterPriority').addEventListener('change', e => {
    filterState.priority = e.target.value;
    renderDashboard();
  });
  document.getElementById('filterTier').addEventListener('change', e => {
    filterState.tier = e.target.value;
    renderDashboard();
  });
  document.getElementById('filterChannel').addEventListener('change', e => {
    filterState.channel = e.target.value;
    renderDashboard();
  });
  document.getElementById('filterCategory').addEventListener('change', e => {
    filterState.category = e.target.value;
    renderDashboard();
  });
  document.getElementById('filterSegment').addEventListener('change', e => {
    filterState.segment = e.target.value;
    renderDashboard();
  });
  document.querySelectorAll('input[name="slaFilter"]').forEach(radio => {
    radio.addEventListener('change', e => {
      filterState.slaFilter = e.target.value;
      renderDashboard();
    });
  });
  document.getElementById('agentSearchInput').addEventListener('input', e => {
    filterState.agentSearch = e.target.value;
    updateAgentTable(getFilteredTickets());
  });
  document.getElementById('switchOnlyFcr').addEventListener('change', e => {
    filterState.onlyFcr = e.target.checked;
    renderDashboard();
  });
  document.getElementById('switchOnlyEnterprise').addEventListener('change', e => {
    filterState.onlyEnterprise = e.target.checked;
    renderDashboard();
  });
  document.getElementById('btnResetFilters').addEventListener('click', () => {
    Object.assign(filterState, {
      period: '7d',
      priority: 'all',
      tier: 'all',
      channel: 'all',
      category: 'all',
      segment: 'all',
      slaFilter: 'all',
      selectedAgent: null,
      onlyFcr: false,
      onlyEnterprise: false
    });
    syncFormControlsWithState();
    renderDashboard();
  });

  document.getElementById('btnExportCsv').addEventListener('click', exportFilteredCsv);

  // Conmutador de Tema Light/Dark de Bootstrap 6 (`data-bs-theme`) sincronizado con DESIGN.md / Comparador
  const applyBsTheme = nextTheme => {
    if (nextTheme !== 'dark' && nextTheme !== 'light') return;
    const html = document.documentElement;
    html.setAttribute('data-bs-theme', nextTheme);
    localStorage.setItem('helpdesk_ds_theme_v1', nextTheme);
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = nextTheme === 'dark' ? 'bi bi-sun-fill me-1' : 'bi bi-moon-stars me-1';
    }
    renderDashboard();
  };

  const savedTheme = localStorage.getItem('helpdesk_ds_theme_v1') || 'light';
  document.documentElement.setAttribute('data-bs-theme', savedTheme);
  const initialIcon = document.getElementById('themeIcon');
  if (initialIcon) {
    initialIcon.className = savedTheme === 'dark' ? 'bi bi-sun-fill me-1' : 'bi bi-moon-stars me-1';
  }

  document.getElementById('btnThemeToggle').addEventListener('click', () => {
    const html = document.documentElement;
    const nextTheme = html.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    applyBsTheme(nextTheme);
    if (window.self !== window.top) {
      window.parent.postMessage({ type: 'HELPDESK_SYNC_THEME', theme: nextTheme }, '*');
    }
  });

  if (window.self !== window.top) {
    document.getElementById('bsNavOpenComparator')?.setAttribute('hidden', '');
    document.getElementById('bsNavSwitchBootstrap')?.removeAttribute('hidden');
    const dsSwitchEl = document.getElementById('bsNavSwitchDesignSystem');
    if (dsSwitchEl) {
      dsSwitchEl.className = 'btn-solid btn-sm theme-primary text-decoration-none text-center';
    }
  }

  window.addEventListener('message', e => {
    if (e.data && e.data.type === 'HELPDESK_APPLY_THEME') {
      applyBsTheme(e.data.theme);
    }
  });

  // Burbuja flotante de opciones (3 puntos verticales en esquina inferior izquierda)
  const bubbleToggleBtn = document.getElementById('btnBsFloatingBubbleToggle');
  const bubblePanelEl = document.getElementById('bsBubblePanel');
  const bubbleIconEl = document.getElementById('bsBubbleIcon');
  if (bubbleToggleBtn && bubblePanelEl) {
    bubbleToggleBtn.addEventListener('click', () => {
      const isExpanded = bubbleToggleBtn.getAttribute('aria-expanded') === 'true';
      const nextExpanded = !isExpanded;
      bubbleToggleBtn.setAttribute('aria-expanded', String(nextExpanded));
      if (nextExpanded) {
        bubblePanelEl.removeAttribute('hidden');
        if (bubbleIconEl) bubbleIconEl.className = 'bi bi-x-lg fs-md';
      } else {
        bubblePanelEl.setAttribute('hidden', '');
        if (bubbleIconEl) bubbleIconEl.className = 'bi bi-three-dots-vertical fs-md';
      }
    });
  }

  renderDashboard();
}

document.addEventListener('DOMContentLoaded', initDashboard);
