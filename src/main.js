import { createStore } from './state/store.js';
import { initRemoteControls } from './components/remoteControls.js';
import { populateFilters, renderGuide } from './components/programGuidePanel.js';
import { renderSuggestions } from './components/suggestionsPanel.js';
import { irService } from './services/irService.js';
import { getEnrichedPrograms, getProgramById, getChannelByNumber } from './services/programGuide.js';
import { getSuggestions } from './services/recommendation.js';
import { overrideProgramData } from './data/programs.js';

const APP_VERSION = '1.0.0';
const CONFIG_URL = 'config/app.config.json';
const SERVICE_WORKER_URL = './service-worker.js';

const store = createStore();
const state = store.getState();
let remoteUi;
let currentDigits = '';
let touchStartPoint = null;
let touchStartTime = null;
let autoDetectionRan = false;
const inputCycleSequence = ['input1', 'input2', 'input3'];
let inputCycleIndex = 0;

const tvSelector = document.getElementById('tv-selector');
const detectBtn = document.getElementById('detect-tv');
const remoteContainer = document.getElementById('remote-container');
const guideContainer = document.getElementById('guide-container');
const channelFilter = document.getElementById('channel-filter');
const genreFilter = document.getElementById('genre-filter');
const refreshGuideBtn = document.getElementById('refresh-guide');
const channelNumberFilter = document.getElementById('channel-number-filter');
const programSearchInput = document.getElementById('program-search');
const suggestionsContainer = document.getElementById('suggestions-container');
const refreshSuggestionsBtn = document.getElementById('refresh-suggestions');
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const numericOverlay = document.getElementById('numeric-overlay');
const numericGrid = document.getElementById('numeric-grid');
const numericCloseBtn = document.getElementById('numeric-close');
const detectionFeedback = document.getElementById('detection-feedback');
const assistantToggle = document.getElementById('assistant-toggle');
const detectionPopover = document.getElementById('detection-popover');
const assistantDetectBtn = document.getElementById('assistant-detect');
const assistantTvLine = document.getElementById('assistant-tv-line');
const assistantStatusLine = document.getElementById('assistant-status-line');
const updateBanner = document.getElementById('update-banner');
const updateText = document.getElementById('update-text');
const updateReloadBtn = document.getElementById('update-reload');

let remoteConfig = null;

function init() {
  populateFilters(channelFilter, genreFilter);
  bindGuideEvents();
  bindRemote();
  bindDetection();
  bindSuggestions();
  bindNavigation();
  bindNumericOverlay();
  bindUpdateBanner();
  bindAssistantPopover();
  registerServiceWorker();
  updateTvSelector();
  renderGuide(guideContainer, getGuideFilters());
  updateSuggestions();
  autoDetectMissingProfiles();
  updateIrStatus();
  updateDetectionGuidance();
  checkRemoteConfig();
  bindTouchGestures();
}

function bindRemote() {
  remoteUi = initRemoteControls(remoteContainer, {
    onCommand: handleCommand,
  });
  remoteUi.updateScreen('Vision pronto. Inizia selezionando la tua TV o usa "Trova la mia TV".');
}

async function handleCommand(command) {
  if (command.startsWith('set_volume_')) {
    const value = Number(command.replace('set_volume_', ''));
    remoteUi.updateScreen(`Imposto volume a ${value} (simulato)`);
    return;
  }

  switch (command) {
    case 'guide':
      document.querySelector('.guide-panel').scrollIntoView({ behavior: 'smooth' });
      return;
    case 'menu':
      remoteUi.updateScreen('Apro il menu TV (mock)');
      break;
    case 'info':
      remoteUi.updateScreen('Mostro info programma (mock)');
      break;
    case 'open_numeric':
      toggleNumericOverlay(true);
      return;
    case 'input_cycle':
      await cycleInputSource();
      return;
    default:
      break;
  }

  await sendIrCommand(command);
}

async function tuneToChannelNumber(numberString) {
  const targetChannel = getChannelByNumber(numberString);
  const displayName = targetChannel ? `${targetChannel.name} (${numberString})` : `Canale ${numberString}`;
  remoteUi.updateScreen(`Sintonizzo ${displayName}`);
  for (const digit of numberString.split('')) {
    await sendIrCommand(`digit_${digit}`);
  }
  await sendIrCommand('enter');
}

function mapCommandToIr(command) {
  const mapping = {
    power: 'power',
    mute: 'mute',
    volume_up: 'volumeUp',
    volume_down: 'volumeDown',
    channel_up: 'channelUp',
    channel_down: 'channelDown',
    input_cycle: 'input1',
    input1: 'input1',
    input2: 'input2',
    input3: 'input3',
    up: 'navUp',
    down: 'navDown',
    left: 'navLeft',
    right: 'navRight',
    ok: 'ok',
    digit_0: 'digit0',
    digit_1: 'digit1',
    digit_2: 'digit2',
    digit_3: 'digit3',
    digit_4: 'digit4',
    digit_5: 'digit5',
    digit_6: 'digit6',
    digit_7: 'digit7',
    digit_8: 'digit8',
    digit_9: 'digit9',
    enter: 'enter',
  };
  return mapping[command];
}

async function sendIrCommand(command) {
  const irCommand = mapCommandToIr(command);
  if (!irCommand) {
    remoteUi.updateScreen(`Comando ${command} non supportato (mock).`);
    return;
  }
  const tvId = store.getState().activeTvId;
  remoteUi.updateScreen(`Invio comando ${command}...`);
  const result = await irService.sendCommand(tvId, irCommand);
  if (result.success) {
    store.setState({ lastCommand: command });
    remoteUi.updateScreen(`Comando ${command} inviato.`);
  } else {
    remoteUi.updateScreen('Errore: profilo TV non configurato.');
  }
}

function bindDetection() {
  detectBtn.addEventListener('click', () => runDetection());
  assistantDetectBtn?.addEventListener('click', () => runDetection());

  tvSelector.addEventListener('change', () => {
    store.setState({ activeTvId: tvSelector.value });
    updateIrStatus();
    updateDetectionGuidance();
  });
}

async function runDetection() {
  const activeTv = getActiveTv();
  if (!activeTv) {
    updateDetectionGuidance('Seleziona una TV prima di avviare la ricerca.', 'warning');
    return;
  }

  setDetectionButtonsLoading(true);
  remoteUi?.updateScreen(`Test profili per ${activeTv.name}...`);
  updateDetectionGuidance(`Sto cercando il profilo per ${activeTv.name}...`, 'info');
  try {
    const profileId = await irService.detectProfile(activeTv.id, activeTv.brand, {
      onProfileAttempt: (profile) => {
        remoteUi?.updateScreen(`Test del profilo ${profile.id}...`);
        updateDetectionGuidance(`Provo il profilo ${profile.id}...`, 'info');
      },
    });
    store.updateTvProfile(activeTv.id, () => ({ detectedProfileId: profileId }));
    remoteUi?.updateScreen(`Profilo ${profileId} configurato!`);
    updateIrStatus();
    updateDetectionGuidance(`Trovato il profilo ${profileId} per ${activeTv.name}.`, 'success');
  } catch (error) {
    console.error(error);
    remoteUi?.updateScreen('Non sono riuscito a trovare un profilo adatto.');
    updateDetectionGuidance('Nessun profilo trovato. Ripeti la ricerca o seleziona un altro brand.', 'error');
  } finally {
    setDetectionButtonsLoading(false);
  }
}

function setDetectionButtonsLoading(isLoading) {
  if (detectBtn) {
    detectBtn.disabled = isLoading;
    detectBtn.textContent = isLoading ? 'Ricerca profilo...' : 'Trova la mia TV';
  }
  if (assistantDetectBtn) {
    assistantDetectBtn.disabled = isLoading;
    assistantDetectBtn.textContent = isLoading ? 'Ricerca in corso...' : 'Avvia ricerca automatica';
  }
}

async function autoDetectMissingProfiles() {
  if (autoDetectionRan) return;
  autoDetectionRan = true;
  const { tvProfiles } = store.getState();
  for (const tv of tvProfiles) {
    if (tv.detectedProfileId) {
      irService.setProfileForTv(tv.id, tv.detectedProfileId);
      continue;
    }
    try {
      const profileId = await irService.detectProfile(tv.id, tv.brand);
      store.updateTvProfile(tv.id, () => ({ detectedProfileId: profileId }));
      updateDetectionGuidance();
    } catch (error) {
      console.warn('Auto detection failed for', tv.id, error.message);
    }
  }
}

function bindGuideEvents() {
  refreshGuideBtn.addEventListener('click', () => {
    renderGuide(guideContainer, getGuideFilters());
  });

  channelFilter.addEventListener('change', () => renderGuide(guideContainer, getGuideFilters()));
  genreFilter.addEventListener('change', () => renderGuide(guideContainer, getGuideFilters()));
  channelNumberFilter?.addEventListener('input', () => renderGuide(guideContainer, getGuideFilters()));
  programSearchInput?.addEventListener('input', handleProgramSearchInput);

  guideContainer.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const programId = target.dataset.program;
    const program = getProgramById(programId);
    if (!program) return;

    if (target.dataset.action === 'watch') {
      store.recordWatchEvent(program);
      remoteUi.updateScreen(`Imposto canale ${program.channelName}`);
    } else {
      remoteUi.updateScreen(`${program.title}: ${program.description}`);
    }
  });
}

function bindSuggestions() {
  refreshSuggestionsBtn.addEventListener('click', updateSuggestions);
}

function updateSuggestions() {
  const suggestions = getSuggestions(store.getState().preferences);
  renderSuggestions(suggestionsContainer, suggestions);
}

function bindNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.viewTarget;
      switchView(target);
    });
  });
}

function bindAssistantPopover() {
  if (!assistantToggle || !detectionPopover) return;

  const closePopover = () => {
    detectionPopover.hidden = true;
    assistantToggle.setAttribute('aria-expanded', 'false');
  };

  const openPopover = () => {
    detectionPopover.hidden = false;
    assistantToggle.setAttribute('aria-expanded', 'true');
  };

  assistantToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const expanded = assistantToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closePopover();
    } else {
      openPopover();
    }
  });

  document.addEventListener('click', (event) => {
    if (detectionPopover.hidden) return;
    if (detectionPopover.contains(event.target) || assistantToggle.contains(event.target)) return;
    closePopover();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !detectionPopover.hidden) {
      closePopover();
    }
  });
}

function bindUpdateBanner() {
  updateReloadBtn?.addEventListener('click', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration()?.then((registration) => registration?.update());
    }
    window.location.reload();
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker
    .register(SERVICE_WORKER_URL)
    .then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner('Nuovo aggiornamento disponibile.');
          }
        });
      });
    })
    .catch((error) => console.error('[SW] Registrazione fallita', error));

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

async function checkRemoteConfig() {
  try {
    const response = await fetch(`${CONFIG_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('config_fetch_failed');
    const config = await response.json();
    remoteConfig = config;
    handleRemoteConfig(config);
  } catch (error) {
    console.warn('[Config] Impossibile recuperare il remote config', error);
  }
}

async function handleRemoteConfig(config) {
  if (!config) return;
  if (config.version && config.version !== APP_VERSION) {
    showUpdateBanner(config.updateMessage || 'Nuova versione disponibile.');
  }

  if (config.programDataUrl) {
    try {
      const response = await fetch(config.programDataUrl, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        overrideProgramData(data);
        renderGuide(guideContainer, getGuideFilters());
        updateSuggestions();
      }
    } catch (error) {
      console.warn('[Config] impossibile caricare dataset remoto', error);
    }
  }
}

function showUpdateBanner(message) {
  if (!updateBanner || !updateText) return;
  updateText.textContent = message;
  updateBanner.hidden = false;
}

function bindNumericOverlay() {
  if (!numericOverlay) return;
  numericOverlay.addEventListener('click', (event) => {
    if (event.target === numericOverlay) {
      toggleNumericOverlay(false);
    }
  });
  numericCloseBtn?.addEventListener('click', () => toggleNumericOverlay(false));
  numericGrid?.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    const digit = target.dataset.digit;
    if (digit) {
      queueDigit(digit);
    }
  });
}

function toggleNumericOverlay(visible) {
  if (!numericOverlay) return;
  numericOverlay.classList.toggle('visible', visible);
  numericOverlay.setAttribute('aria-hidden', String(!visible));
}

let digitCommitTimeout;

function queueDigit(digit) {
  currentDigits = `${currentDigits}${digit}`.slice(-3);
  remoteUi.updateScreen(`Canale in inserimento: ${currentDigits}`);
  if (digitCommitTimeout) clearTimeout(digitCommitTimeout);
  digitCommitTimeout = setTimeout(async () => {
    if (currentDigits) {
      await tuneToChannelNumber(currentDigits);
      currentDigits = '';
      toggleNumericOverlay(false);
    }
  }, 1200);
}

function queueDigitFromVoice(digit) {
  queueDigit(digit);
}

async function cycleInputSource() {
  const nextCommand = inputCycleSequence[inputCycleIndex];
  inputCycleIndex = (inputCycleIndex + 1) % inputCycleSequence.length;
  await sendIrCommand(nextCommand);
  remoteUi.updateScreen(`Cambio ingresso (${nextCommand.toUpperCase()})`);
}

function switchView(targetView) {
  views.forEach((view) => {
    const isActive = view.dataset.view === targetView;
    view.classList.toggle('active', isActive);
  });
  navButtons.forEach((button) => {
    const isActive = button.dataset.viewTarget === targetView;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
}

function updateTvSelector() {
  const currentState = store.getState();
  tvSelector.innerHTML = currentState.tvProfiles
    .map((tv) => `<option value="${tv.id}" ${tv.id === currentState.activeTvId ? 'selected' : ''}>${tv.name}</option>`)
    .join('');
}

function getGuideFilters() {
  return {
    channelId: channelFilter.value || 'all',
    genre: genreFilter.value || 'Tutti',
    channelNumber: channelNumberFilter?.value || '',
    searchTerm: programSearchInput?.value || '',
  };
}

let searchDebounce;
function handleProgramSearchInput() {
  if (searchDebounce) {
    cancelAnimationFrame(searchDebounce);
  }
  searchDebounce = requestAnimationFrame(() => {
    renderGuide(guideContainer, getGuideFilters());
  });
}

function updateIrStatus() {
  const activeTv = getActiveTv();
  if (activeTv?.detectedProfileId) {
    irService.setProfileForTv(activeTv.id, activeTv.detectedProfileId);
    remoteUi?.updateStatus(`Profilo ${activeTv.detectedProfileId} pronto`);
  } else if (activeTv) {
    remoteUi?.updateStatus('Profilo non configurato');
  } else {
    remoteUi?.updateStatus('Nessuna TV selezionata');
  }
}

function bindTouchGestures() {
  const panel = document.querySelector('.remote-panel');
  if (!panel) return;

  panel.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.touches[0];
      touchStartPoint = { x: touch.clientX, y: touch.clientY };
      touchStartTime = Date.now();
    },
    { passive: true }
  );

  panel.addEventListener(
    'touchend',
    (event) => {
      if (!touchStartPoint) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartPoint.x;
      const dy = touch.clientY - touchStartPoint.y;
      const duration = Date.now() - touchStartTime;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const threshold = 40;

      if (absDx < 10 && absDy < 10 && duration < 250) {
        handleCommand('info');
      } else if (absDy > absDx && absDy > threshold) {
        handleCommand(dy < 0 ? 'volume_up' : 'volume_down');
      } else if (absDx >= absDy && absDx > threshold) {
        handleCommand(dx < 0 ? 'channel_down' : 'channel_up');
      }

      touchStartPoint = null;
      touchStartTime = null;
    },
    { passive: true }
  );
}

window.addEventListener('DOMContentLoaded', init);
