// ============================================================================
// Main View Orchestrator: HelpdeskDashboardApp.js
// Named Export: mountHelpdeskDashboardApp
// Connects helpdeskStore, pure helpdeskMetrics, StateResolutionPanel,
// and the modular visual components.
// ============================================================================

import { renderStateResolutionPanel } from '../../components/ui/StateResolutionPanel.js';
import { renderIconSvg } from '../../components/ui/IconSvg.js';
import {
  getHelpdeskState,
  loadHelpdeskTelemetry,
  resetHelpdeskFilters,
  setHelpdeskTheme,
  setInspectedTicketId,
  subscribeHelpdeskStore,
  toggleHelpdeskTheme,
  updateHelpdeskFilter
} from './state/helpdeskStore.js';
import {
  computeAgentPerformanceRows,
  computeCategoryAndChannelBreakdown,
  computeDailyTicketSeries,
  computeStatusFunnelBreakdown,
  computeSummaryKpis,
  filterFactTickets
} from './logic/helpdeskMetrics.js';
import { renderKpiSummaryGrid } from './components/KpiSummaryGrid.js';
import { renderTicketTrendVisual } from './components/TicketTrendVisual.js';
import { renderSlaStatusFunnel } from './components/SlaStatusFunnel.js';
import { renderCategoryChannelBreakdown } from './components/CategoryChannelBreakdown.js';
import { renderAgentPerformanceTable } from './components/AgentPerformanceTable.js';
import { renderTicketQueueTable } from './components/TicketQueueTable.js';
import { renderTicketInspectorDialog } from './components/TicketInspectorDialog.js';

export function mountHelpdeskDashboardApp(rootElement) {
  const initial = getHelpdeskState();
  document.documentElement.setAttribute('data-theme', initial.theme);

  function renderApp(currentState) {
    const filteredTickets =
      currentState.resolutionState === 'ready' && Array.isArray(currentState.rawTickets)
        ? filterFactTickets(currentState.rawTickets, currentState.filters)
        : [];

    const isEmpty =
      currentState.resolutionState === 'ready' && filteredTickets.length === 0;

    const mainBodyHtml = renderStateResolutionPanel({
      resolutionState: currentState.resolutionState,
      errorMessage: currentState.errorMessage,
      isEmpty,
      renderContent: () => {
        const kpis = computeSummaryKpis(filteredTickets);
        const dailySeries = computeDailyTicketSeries(filteredTickets);
        const funnelRows = computeStatusFunnelBreakdown(filteredTickets);
        const catAndChannels = computeCategoryAndChannelBreakdown(filteredTickets);
        const agentRows = computeAgentPerformanceRows(filteredTickets, currentState.filters.agentSearch);

        return `
          ${renderKpiSummaryGrid(kpis)}

          <div class="ds-grid-12">
            <div class="ds-col-12 ds-cq-lg-8">
              ${renderTicketTrendVisual(dailySeries)}
            </div>
            <div class="ds-col-12 ds-cq-lg-4">
              ${renderSlaStatusFunnel(funnelRows)}
            </div>
          </div>

          <div class="ds-grid-12">
            <div class="ds-col-12 ds-cq-lg-5">
              ${renderCategoryChannelBreakdown(catAndChannels)}
            </div>
            <div class="ds-col-12 ds-cq-lg-7">
              ${renderAgentPerformanceTable({
                agentRows,
                selectedAgent: currentState.filters.selectedAgent,
                searchQuery: currentState.filters.agentSearch
              })}
            </div>
          </div>

          ${renderTicketQueueTable({
            tickets: filteredTickets,
            filters: currentState.filters
          })}
        `;
      }
    });

    const contentMount = rootElement.querySelector('#dsMainMount');
    if (contentMount) {
      contentMount.innerHTML = mainBodyHtml;
    }

    // Lock interactive action buttons while network simulation is in flight (writing-ui-components rule)
    rootElement.querySelectorAll('[data-lock-on-flight="true"]').forEach(btn => {
      if (currentState.isActionInFlight) {
        btn.setAttribute('disabled', 'disabled');
      } else {
        btn.removeAttribute('disabled');
      }
    });

    // Update Theme Button Icon
    const themeBtnIcon = rootElement.querySelector('#dsThemeIconSlot');
    if (themeBtnIcon) {
      themeBtnIcon.innerHTML = renderIconSvg(currentState.theme === 'dark' ? 'sun' : 'moon');
    }

    // Bind dynamic inner events ( semantic buttons only — never divs/trs )
    bindDynamicContentEvents(rootElement, currentState);
  }

  function bindDynamicContentEvents(root, currentState) {
    const retryBtn = root.querySelector('#btnRetryResolution');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => loadHelpdeskTelemetry({ simulateMode: 'ready' }));
    }

    const emptyResetBtn = root.querySelector('#btnEmptyResetFilters');
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', () => resetHelpdeskFilters());
    }

    const agentSearch = root.querySelector('#dsAgentSearch');
    if (agentSearch) {
      agentSearch.addEventListener('input', e => {
        updateHelpdeskFilter('agentSearch', e.target.value);
      });
    }

    const categorySelect = root.querySelector('#dsFilterCategory');
    if (categorySelect) {
      categorySelect.addEventListener('change', e => {
        updateHelpdeskFilter('category', e.target.value);
      });
    }

    const segmentSelect = root.querySelector('#dsFilterSegment');
    if (segmentSelect) {
      segmentSelect.addEventListener('change', e => {
        updateHelpdeskFilter('segment', e.target.value);
      });
    }

    // Full-row Agent filter (click or Enter/Space on row)
    const toggleAgentSelection = agentName => {
      const nextVal = currentState.filters.selectedAgent === agentName ? null : agentName;
      updateHelpdeskFilter('selectedAgent', nextVal);
    };

    root.querySelectorAll('[data-agent-filter]').forEach(rowEl => {
      rowEl.addEventListener('click', () => {
        toggleAgentSelection(rowEl.getAttribute('data-agent-filter'));
      });
      rowEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAgentSelection(rowEl.getAttribute('data-agent-filter'));
        }
      });
    });

    // Full-row Ticket inspection (click or Enter/Space on row, plus outside backdrop click to close)
    const openTicketModal = ticketId => {
      setInspectedTicketId(ticketId);
      const ticketObj = (currentState.rawTickets || []).find(t => t.ID_Ticket === ticketId);
      const dialogEl = document.getElementById('dsInspectorDialog');
      if (dialogEl && ticketObj) {
        dialogEl.innerHTML = renderTicketInspectorDialog(ticketObj);
        if (!dialogEl.open) dialogEl.showModal();
        const closeBtn = dialogEl.querySelector('#btnCloseInspectorDialog');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => dialogEl.close());
        }
      }
    };

    root.querySelectorAll('[data-inspect-ticket]').forEach(rowEl => {
      rowEl.addEventListener('click', () => {
        openTicketModal(rowEl.getAttribute('data-inspect-ticket'));
      });
      rowEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTicketModal(rowEl.getAttribute('data-inspect-ticket'));
        }
      });
    });

    // Enable click-and-drag horizontal scrolling ONLY when container actually overflows horizontally
    const syncOverflowState = scrollEl => {
      const canScrollHorizontally = scrollEl.scrollWidth > scrollEl.clientWidth + 2;
      if (canScrollHorizontally) {
        scrollEl.classList.add('has-overflow');
      } else {
        scrollEl.classList.remove('has-overflow', 'is-dragging');
      }
      return canScrollHorizontally;
    };

    root.querySelectorAll('[data-drag-scroll="true"]').forEach(scrollEl => {
      const isKpiStrip = scrollEl.classList.contains('ds-kpi-strip');
      let isPointerDown = false;
      let didDragMove = false;
      let startX = 0;
      let startScrollLeft = 0;
      let lastScrollDelta = 0;
      let wheelSnapTimer = null;

      syncOverflowState(scrollEl);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => syncOverflowState(scrollEl));
        ro.observe(scrollEl);
      }

      // Snap KPI strip so 3 full cards are always 100% visible and only the 4th is cut at .22
      const snapKpiStrip = () => {
        if (!isKpiStrip || !syncOverflowState(scrollEl)) return;
        const items = scrollEl.querySelectorAll('.ds-kpi-item');
        if (items.length < 4) return;
        const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
        if (maxScroll <= 2) return;

        const step = items[1].offsetLeft - items[0].offsetLeft;
        if (step <= 0) return;

        const visibleFullCards = Math.max(1, Math.min(5, Math.floor((scrollEl.clientWidth - 24) / step)));
        const maxGroupIndex = Math.max(1, items.length - visibleFullCards);

        const rawIndex = (scrollEl.scrollLeft / maxScroll) * maxGroupIndex;
        let groupIndex;
        if (lastScrollDelta > 12) {
          groupIndex = Math.min(maxGroupIndex, Math.ceil(rawIndex - 0.25));
        } else if (lastScrollDelta < -12) {
          groupIndex = Math.max(0, Math.floor(rawIndex + 0.25));
        } else {
          groupIndex = Math.round(rawIndex);
        }
        groupIndex = Math.max(0, Math.min(maxGroupIndex, groupIndex));

        let targetScroll;
        if (groupIndex === 0) {
          targetScroll = 0;
        } else if (groupIndex === maxGroupIndex) {
          targetScroll = maxScroll;
        } else if (lastScrollDelta < 0) {
          targetScroll = maxScroll - (maxGroupIndex - groupIndex) * step;
        } else {
          targetScroll = items[groupIndex].offsetLeft - items[0].offsetLeft;
        }

        targetScroll = Math.max(0, Math.min(maxScroll, targetScroll));
        scrollEl.scrollTo({ left: targetScroll, behavior: 'smooth' });
      };

      scrollEl.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        // Do NOT activate drag if all content fits without horizontal overflow
        if (!syncOverflowState(scrollEl)) return;
        isPointerDown = true;
        didDragMove = false;
        startX = e.pageX - scrollEl.offsetLeft;
        startScrollLeft = scrollEl.scrollLeft;
        lastScrollDelta = 0;
      });

      scrollEl.addEventListener('mousemove', e => {
        if (!isPointerDown) return;
        const x = e.pageX - scrollEl.offsetLeft;
        const walk = x - startX;
        if (Math.abs(walk) > 5) {
          didDragMove = true;
          scrollEl.classList.add('is-dragging');
          e.preventDefault();
          const nextScroll = startScrollLeft - walk;
          lastScrollDelta = nextScroll - startScrollLeft;
          scrollEl.scrollLeft = nextScroll;
        }
      });

      const stopDrag = () => {
        if (!isPointerDown) return;
        isPointerDown = false;
        scrollEl.classList.remove('is-dragging');
        if (didDragMove && isKpiStrip) {
          snapKpiStrip();
        }
      };

      scrollEl.addEventListener('mouseup', stopDrag);
      scrollEl.addEventListener('mouseleave', stopDrag);

      if (isKpiStrip) {
        scrollEl.addEventListener('wheel', e => {
          if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
            lastScrollDelta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
            window.clearTimeout(wheelSnapTimer);
            wheelSnapTimer = window.setTimeout(() => {
              if (!isPointerDown) snapKpiStrip();
            }, 140);
          }
        }, { passive: true });
      }

      // Prevent accidental row click if user was dragging horizontally
      scrollEl.addEventListener(
        'click',
        e => {
          if (didDragMove) {
            e.stopPropagation();
            e.preventDefault();
            didDragMove = false;
          }
        },
        true
      );
    });
  }

  // Close <dialog> when clicking outside its bounding box (on ::backdrop)
  const inspectorDialogEl = document.getElementById('dsInspectorDialog');
  if (inspectorDialogEl) {
    inspectorDialogEl.addEventListener('click', e => {
      const rect = inspectorDialogEl.getBoundingClientRect();
      const clickedInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!clickedInside) {
        inspectorDialogEl.close();
      }
    });
  }

  // Bind Top Toolbar Slicers & State Simulators
  rootElement.querySelector('#dsFilterPeriod')?.addEventListener('change', e => {
    updateHelpdeskFilter('period', e.target.value);
  });
  rootElement.querySelector('#dsFilterPriority')?.addEventListener('change', e => {
    updateHelpdeskFilter('priority', e.target.value);
  });
  rootElement.querySelector('#dsFilterTier')?.addEventListener('change', e => {
    updateHelpdeskFilter('tier', e.target.value);
  });
  rootElement.querySelector('#dsFilterChannel')?.addEventListener('change', e => {
    updateHelpdeskFilter('channel', e.target.value);
  });

  rootElement.querySelectorAll('button[data-sla-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-sla-mode');
      rootElement.querySelectorAll('button[data-sla-mode]').forEach(b => {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      updateHelpdeskFilter('slaFilter', mode);
    });
  });

  // Simulation buttons to verify the 3 mandatory resolution states (Loading, Empty, Error)
  rootElement.querySelector('#btnSimLoading')?.addEventListener('click', () => {
    loadHelpdeskTelemetry({ simulateMode: 'ready', delayMs: 1100 });
  });
  rootElement.querySelector('#btnSimEmpty')?.addEventListener('click', () => {
    loadHelpdeskTelemetry({ simulateMode: 'empty', delayMs: 250 });
  });
  rootElement.querySelector('#btnSimError')?.addEventListener('click', () => {
    loadHelpdeskTelemetry({ simulateMode: 'error', delayMs: 250 });
  });
  rootElement.querySelector('#btnSimReady')?.addEventListener('click', () => {
    resetHelpdeskFilters();
    loadHelpdeskTelemetry({ simulateMode: 'ready', delayMs: 180 });
  });

  rootElement.querySelector('#btnToggleDsTheme')?.addEventListener('click', () => {
    const nextTheme = toggleHelpdeskTheme();
    if (window.self !== window.top) {
      window.parent.postMessage({ type: 'HELPDESK_SYNC_THEME', theme: nextTheme }, '*');
    }
  });

  // Synchronize theme & navigation buttons when embedded inside comparador.html
  if (window.self !== window.top) {
    rootElement.querySelector('#navOpenComparator')?.setAttribute('hidden', '');
    rootElement.querySelector('#navSwitchDesignSystem')?.removeAttribute('hidden');
  }

  window.addEventListener('message', e => {
    if (e.data && e.data.type === 'HELPDESK_APPLY_THEME') {
      setHelpdeskTheme(e.data.theme);
    }
  });

  // Switch sticky filter bar dropdowns & buttons to compact "small" version on scroll down
  const stickyFiltersEl = rootElement.querySelector('.ds-sticky-filters');
  if (stickyFiltersEl) {
    const syncStickyCompactState = () => {
      if (window.scrollY > 32) {
        stickyFiltersEl.classList.add('is-scrolled');
      } else {
        stickyFiltersEl.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', syncStickyCompactState, { passive: true });
    syncStickyCompactState();
  }

  // Floating 3-dots Bubble Toggle (Feedback #1)
  const bubbleTrigger = rootElement.querySelector('#btnFloatingBubbleToggle');
  const bubblePanel = rootElement.querySelector('#dsBubblePanel');
  const bubbleIconSlot = rootElement.querySelector('#dsBubbleIconSlot');

  if (bubbleIconSlot) {
    bubbleIconSlot.innerHTML = renderIconSvg('moreVertical', 'Opciones');
  }

  if (bubbleTrigger && bubblePanel) {
    bubbleTrigger.addEventListener('click', () => {
      const isExpanded = bubbleTrigger.getAttribute('aria-expanded') === 'true';
      const nextExpanded = !isExpanded;
      bubbleTrigger.setAttribute('aria-expanded', String(nextExpanded));
      if (nextExpanded) {
        bubblePanel.removeAttribute('hidden');
        if (bubbleIconSlot) bubbleIconSlot.innerHTML = renderIconSvg('close', 'Cerrar opciones');
      } else {
        bubblePanel.setAttribute('hidden', '');
        if (bubbleIconSlot) bubbleIconSlot.innerHTML = renderIconSvg('moreVertical', 'Opciones');
      }
    });
  }

  subscribeHelpdeskStore(renderApp);
  loadHelpdeskTelemetry({ simulateMode: 'ready', delayMs: 180 });
}
