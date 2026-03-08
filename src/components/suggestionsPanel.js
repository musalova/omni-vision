export function renderSuggestions(container, suggestions) {
  if (!suggestions.length) {
    container.innerHTML = '<p class="text-muted">Nessun suggerimento disponibile al momento.</p>';
    return;
  }

  container.innerHTML = `
    <div class="suggestions-list">
      ${suggestions
        .map(
          (suggestion) => `
          <article class="suggestion-card" data-program="${suggestion.id}">
            <header>
              <strong>${suggestion.title}</strong>
              <span>${suggestion.channelName} · ${suggestion.formattedStart}</span>
            </header>
            <p class="text-muted">${suggestion.description}</p>
            <ul class="suggestion-reasons">
              ${(suggestion.reasons || []).map((reason) => `<li>${reason}</li>`).join('')}
            </ul>
            <footer>
              <button class="ghost-btn" data-like="like">Mi piace</button>
              <button class="ghost-btn" data-like="dislike">Non mi interessa</button>
            </footer>
          </article>`
        )
        .join('')}
    </div>
  `;
}
