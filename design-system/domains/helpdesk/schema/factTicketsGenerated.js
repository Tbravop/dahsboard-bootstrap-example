// ============================================================================
// AUTO-GENERATED SCHEMA & DATASET: factTicketsGenerated.js
// Enforces AGENTS.md Rule 3:
// "El backend (o el esquema de la API/Swagger/OpenAPI) es la única fuente de verdad.
// No edites los archivos generados manualmente."
// ============================================================================

export const HELPDESK_SCHEMA_FIELDS = Object.freeze([
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
]);

export const HELPDESK_AGENTS_CATALOG = Object.freeze([
  { id: 'AG-01', name: 'Sofía Martínez', initials: 'SM', tier: 'Tier 1', baseSpeed: 0.78, fcrProb: 0.86, csatBias: 0.94 },
  { id: 'AG-02', name: 'Mateo Rojas', initials: 'MR', tier: 'Tier 1', baseSpeed: 0.85, fcrProb: 0.82, csatBias: 0.91 },
  { id: 'AG-03', name: 'Valentina Silva', initials: 'VS', tier: 'Tier 1', baseSpeed: 0.92, fcrProb: 0.79, csatBias: 0.89 },
  { id: 'AG-04', name: 'Lucas Fernández', initials: 'LF', tier: 'Tier 2', baseSpeed: 1.05, fcrProb: 0.74, csatBias: 0.90 },
  { id: 'AG-05', name: 'Camila Herrera', initials: 'CH', tier: 'Tier 2', baseSpeed: 0.88, fcrProb: 0.77, csatBias: 0.93 },
  { id: 'AG-06', name: 'Diego Vargas', initials: 'DV', tier: 'Tier 3 - Ingeniería', baseSpeed: 1.35, fcrProb: 0.62, csatBias: 0.84 },
  { id: 'AG-07', name: 'Elena Mendoza', initials: 'EM', tier: 'Tier 3 - Ingeniería', baseSpeed: 1.12, fcrProb: 0.70, csatBias: 0.92 }
]);

const PRIORITIES = [
  { name: 'P1 - Crítica', weight: 0.10, slaHours: 2.0, frtTarget: 10 },
  { name: 'P2 - Alta', weight: 0.24, slaHours: 4.0, frtTarget: 15 },
  { name: 'P3 - Media', weight: 0.44, slaHours: 8.0, frtTarget: 30 },
  { name: 'P4 - Baja', weight: 0.22, slaHours: 24.0, frtTarget: 60 }
];

export const HELPDESK_CATEGORIES = Object.freeze([
  'Bug de Plataforma',
  'Integraciones API',
  'Acceso / Login',
  'Infraestructura',
  'Facturación'
]);

export const HELPDESK_CHANNELS = Object.freeze([
  'Portal Web',
  'Chat en Vivo',
  'Email',
  'Slack / Teams',
  'Teléfono',
  'API'
]);

const CLIENTS = [
  { name: 'CloudCore Corp', segment: 'Enterprise' },
  { name: 'Banco Andino Digital', segment: 'Enterprise' },
  { name: 'RetailMax Latam', segment: 'Enterprise' },
  { name: 'Logística Sur S.A.', segment: 'Mid-Market' },
  { name: 'Fintech Nova', segment: 'Mid-Market' },
  { name: 'MedHealth Systems', segment: 'Mid-Market' },
  { name: 'AgroTech Chile', segment: 'SMB' },
  { name: 'Estudio Creativo Pixel', segment: 'SMB' },
  { name: 'Inmobiliaria Horizonte', segment: 'SMB' }
];

function createSeededPrng(seed = 42891) {
  let s = seed;
  return function nextFloat() {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function generateCanonicalFactTickets() {
  const rand = createSeededPrng(42891);
  const rows = [];
  const anchorDate = new Date('2026-10-21T12:00:00');

  for (let i = 1; i <= 180; i++) {
    const daysAgo = Math.floor(Math.pow(rand(), 1.15) * 14);
    const hoursOffset = Math.floor(rand() * 23);
    const minsOffset = Math.floor(rand() * 59);

    const createdDate = new Date(anchorDate);
    createdDate.setDate(createdDate.getDate() - daysAgo);
    createdDate.setHours(hoursOffset, minsOffset, 0, 0);

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

    let agentPool = HELPDESK_AGENTS_CATALOG;
    if (prioObj.name === 'P1 - Crítica') {
      agentPool = HELPDESK_AGENTS_CATALOG.filter(a => a.tier !== 'Tier 1' || rand() > 0.5);
    }
    const agent = agentPool[Math.floor(rand() * agentPool.length)];
    const category = HELPDESK_CATEGORIES[Math.floor(rand() * HELPDESK_CATEGORIES.length)];
    const channel = HELPDESK_CHANNELS[Math.floor(rand() * HELPDESK_CHANNELS.length)];
    const client = CLIENTS[Math.floor(rand() * CLIENTS.length)];

    const frtMin = Math.max(
      1.5,
      Number(((prioObj.frtTarget * 0.48 * agent.baseSpeed) * (0.45 + rand() * 1.1)).toFixed(1))
    );
    const firstResponseDate = new Date(createdDate.getTime() + frtMin * 60 * 1000);

    let status = 'Cerrado';
    const openProb = daysAgo === 0 ? 0.52 : daysAgo <= 2 ? 0.24 : daysAgo <= 5 ? 0.08 : 0.0;
    if (rand() < openProb) {
      const openStates = ['Nuevo', 'En Progreso', 'Pendiente Cliente', 'Escalado N2/N3'];
      status = openStates[Math.floor(rand() * openStates.length)];
    } else {
      status = rand() > 0.35 ? 'Cerrado' : 'Resuelto';
    }

    const isResolved = status === 'Resuelto' || status === 'Cerrado';
    const mttrHours = Number(
      Math.max(0.3, (prioObj.slaHours * 0.52 * agent.baseSpeed) * (0.35 + rand() * 1.25)).toFixed(1)
    );
    const resolvedDate = isResolved
      ? new Date(createdDate.getTime() + mttrHours * 3600 * 1000)
      : null;

    const slaTarget = prioObj.slaHours;
    const slaMet = mttrHours <= slaTarget ? 1 : 0;
    const slaState = !slaMet ? 'vencido' : mttrHours >= slaTarget * 0.80 ? 'riesgo' : 'cumplido';
    const fcr = status === 'Escalado N2/N3' ? 0 : rand() < agent.fcrProb ? 1 : 0;

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

    rows.push({
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
      Nivel_Soporte: agent.tier,
      Tiempo_FRT_Min: frtMin,
      Tiempo_MTTR_Horas: mttrHours,
      Resuelto_Primer_Contacto: fcr,
      SLA_Objetivo_Horas: slaTarget,
      SLA_Cumplido: slaMet,
      SLA_Estado: slaState,
      CSAT: csat,
      Cliente: client.name,
      Segmento_Cliente: client.segment
    });
  }

  return rows.sort((a, b) => new Date(b.Fecha_Creacion) - new Date(a.Fecha_Creacion));
}
