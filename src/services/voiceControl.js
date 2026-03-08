const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const COMMAND_PATTERNS = {
  volume: /(volume|alza|abbassa)\s*(a|su|giù)?\s*(\d+)?/i,
  channelNumber: /(metti|vai a|canale)\s*(\d{1,3})/i,
  channelName: /(metti|vai su)\s*(italia uno|rai uno|rai due|canale cinque)/i,
  power: /(accendi|spegni)/i,
};

const CHANNEL_NAME_MAP = {
  'italia uno': '6',
  'rai uno': '1',
  'rai due': '2',
  'canale cinque': '5',
};

export class VoiceController {
  constructor({ onCommand, onDigit }) {
    this.onCommand = onCommand;
    this.onDigit = onDigit;
    this.recognition = null;
    this.listening = false;
  }

  isSupported() {
    return Boolean(SpeechRecognition);
  }

  toggle() {
    if (!this.isSupported()) {
      alert('Il browser non supporta i comandi vocali.');
      return false;
    }

    if (this.listening) {
      this.recognition?.stop();
      this.listening = false;
      return false;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'it-IT';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      this.processTranscript(transcript);
    };

    this.recognition.onend = () => {
      this.listening = false;
    };

    this.recognition.start();
    this.listening = true;
    return true;
  }

  processTranscript(text) {
    if (COMMAND_PATTERNS.power.test(text)) {
      this.onCommand?.('power');
      return;
    }

    const channelMatch = text.match(COMMAND_PATTERNS.channelNumber);
    if (channelMatch) {
      const digits = channelMatch[2].split('');
      digits.forEach((digit) => this.onDigit?.(digit));
      this.onCommand?.('enter');
      return;
    }

    const channelNameMatch = text.match(COMMAND_PATTERNS.channelName);
    if (channelNameMatch) {
      const mapped = CHANNEL_NAME_MAP[channelNameMatch[2]];
      if (mapped) {
        mapped.split('').forEach((digit) => this.onDigit?.(digit));
        this.onCommand?.('enter');
      }
      return;
    }

    const volumeMatch = text.match(COMMAND_PATTERNS.volume);
    if (volumeMatch) {
      const value = Number(volumeMatch[3]);
      if (!Number.isNaN(value)) {
        const target = Math.max(0, Math.min(32, value));
        this.onCommand?.(`set_volume_${target}`);
      } else if (/alza/.test(text)) {
        this.onCommand?.('volume_up');
      } else if (/abbassa/.test(text)) {
        this.onCommand?.('volume_down');
      }
    }
  }
}
