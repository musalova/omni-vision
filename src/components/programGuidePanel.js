import { getChannelOptions, getEnrichedPrograms, getGenreOptions } from '../services/programGuide.js';

export function initGuidePanel(container, filters) {
  renderGuide(container, filters);
}

export function renderGuide(container, filters) {
  const programs = getEnrichedPrograms(filters);
  container.innerHTML = programs
    .map(
      (program) => `
      <article class="program-card">
        <header>
          <div class="channel-badge">
            ${renderChannelLogo(program)}
            <div>
              <p class="program-channel">${program.channelName}</p>
              <span class="channel-number">Canale ${program.channelNumber}</span>
            </div>
          </div>
          <h3 class="program-title">${program.title}</h3>
          <span class="program-time">${program.formattedStart} - ${program.formattedEnd}</span>
        </header>
        <p class="program-meta">${program.durationMinutes} min · ${program.genre} · ${renderCast(program.cast)}</p>
        <p class="program-description">${program.description}</p>
      </article>`
    )
    .join('');
}

function renderChannelLogo(program) {
  if (program.channelLogo) {
    return `<img src="${program.channelLogo}" alt="${program.channelName}" class="channel-logo" loading="lazy" onerror="this.remove();" />`;
  }
  return `<div class="channel-logo placeholder">${program.channelNumber || '?'} </div>`;
}

function renderCast(cast = []) {
  if (cast.length === 0) return 'Cast non disponibile';
  return cast.join(', ');
}

export function populateFilters(channelSelect, genreSelect) {
  const channelOptions = getChannelOptions();
  channelSelect.innerHTML = channelOptions
    .map((channel) => `<option value="${channel.id}">${channel.name}</option>`)
    .join('');

  const genreOptions = getGenreOptions();
  genreSelect.innerHTML = genreOptions
    .map((genre) => `<option value="${genre}">${genre}</option>`)
    .join('');
}
