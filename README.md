# 📊 Framework de Dashboard: Tablero de Soporte Técnico (Helpdesk / Customer Support)

Este repositorio contiene dos implementaciones comparativas de un **Dashboard de Operaciones de Soporte Técnico (Helpdesk / Customer Support)** junto con un **Comparador Lado a Lado**:

1. **Versión Bootstrap 6 (`twbs/bootstrap` skills):**
   * [`index.html`](./index.html), [`styles.css`](./styles.css) y [`app.js`](./app.js).
   * Basada en Bootstrap `6.0.0-alpha.1` (prefijos responsivos `.sm:col-6`, `.xl:col-2`, tokens semánticos `.theme-*` y componentes nativos `<dialog class="dialog">` / `<dialog class="drawer">`).
2. **Versión Sistema de Diseño Propio (`DESIGN.md` + `AGENTS.md` + `writing-ui-components`):**
   * [`design-system/dashboard.html`](./design-system/dashboard.html) y [`design-system/tokens.css`](./design-system/tokens.css).
   * Arquitectura modular por dominio (`design-system/domains/helpdesk/` y `design-system/components/ui/`), tokens de color en espacio perceptual **OKLCH**, tipografía y espaciado fluidos con `clamp()`, **Container Queries (`@container`)**, hitboxes accesibles `≥ 44×44px`, carrusel de KPIs con auto-snap y manejo explícito de los 3 estados de resolución (`Cargando → Error → Vacío → Datos`).
3. **Comparador en Vivo (Split-Screen):**
   * [`comparador.html`](./comparador.html).

## 🖥️ Cómo ejecutar localmente

```bash
npm install
npx serve -l 3000 .
```

Rutas locales:
* **Dashboard DESIGN.md + AGENTS.md:** `http://localhost:3000/design-system/dashboard`
* **Dashboard Bootstrap 6:** `http://localhost:3000/`
* **Comparador Lado a Lado:** `http://localhost:3000/comparador`
