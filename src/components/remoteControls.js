export function initRemoteControls(container, handlers = {}) {
  container.innerHTML = `
    <div class="screen-display" id="remote-screen">
      <p class="screen-primary">Pronto all'invio comandi.</p>
      <p class="screen-secondary" id="remote-status-line">IR: inattivo</p>
    </div>
    <div class="remote-top-row">
      <button data-command="power">Power</button>
      <button data-command="input_cycle">Ingresso</button>
      <button data-command="mute">Mute</button>
    </div>
    <div class="remote-mid-row">
      <button data-command="volume_up">Vol +</button>
      <button data-command="volume_down">Vol -</button>
      <button data-command="channel_up">CH +</button>
      <button data-command="channel_down">CH -</button>
    </div>
    <div class="dpad">
      <span></span>
      <button data-command="up">▲</button>
      <span></span>
      <button data-command="left">◀</button>
      <button data-command="ok">OK</button>
      <button data-command="right">▶</button>
      <span></span>
      <button data-command="down">▼</button>
      <span></span>
    </div>
    <div class="remote-actions">
      <button data-command="open_numeric">Numeri</button>
      <button data-command="info">Info</button>
      <button data-command="guide">Programmi</button>
    </div>
  `;

  container.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    const digit = target.dataset.digit;
    const command = target.dataset.command;

    if (command && handlers.onCommand) {
      handlers.onCommand(command);
    }
  });

  return {
    updateScreen(message) {
      const primary = container.querySelector('.screen-primary');
      if (primary) primary.textContent = message;
    },
    updateStatus(message) {
      const statusLine = container.querySelector('#remote-status-line');
      if (statusLine) statusLine.textContent = message;
    },
  };
}
