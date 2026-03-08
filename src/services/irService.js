import { irProfiles } from '../data/irProfiles.js';

class IrService {
  constructor() {
    this.mode = 'native'; // Proviamo ad usare il bridge nativo se disponibile
    this.detectedProfiles = new Map();
  }

  setProfileForTv(tvId, profileId) {
    if (!tvId || !profileId) return;
    this.detectedProfiles.set(tvId, profileId);
  }

  getStatus(tvId) {
    if (!tvId) return 'inattivo';
    const profileId = this.detectedProfiles.get(tvId);
    if (profileId) return `profilo ${profileId}`;
    return 'profilo non impostato';
  }

  async detectProfile(tvId, brand, { onProfileAttempt } = {}) {
    const specific = irProfiles.filter((profile) => profile.brand === brand);
    const candidates = [...specific, ...irProfiles].filter(
      (profile, index, arr) => arr.findIndex((p) => p.id === profile.id) === index
    );

    for (const profile of candidates) {
      onProfileAttempt?.(profile);
      const testResult = await this.testProfile(profile);
      if (testResult.success) {
        this.setProfileForTv(tvId, profile.id);
        return profile.id;
      }
    }

    throw new Error('profile_not_found');
  }

  getProfile(profileId) {
    return irProfiles.find((profile) => profile.id === profileId) || null;
  }

  async testProfile(profile) {
    // Se siamo su Android, inviamo un comando reale di test (es. Mute o Info)
    if (window.AndroidIR && window.AndroidIR.hasIrEmitter()) {
      const testCmd = profile.commands['mute'] || Object.values(profile.commands)[0];
      if (testCmd) {
        window.AndroidIR.transmit(testCmd.frequency, testCmd.pattern.join(','));
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    const score = profile.brand === 'Zephir' || profile.brand === 'Generic' ? 0.8 : 0.4;
    const success = Math.random() < score;
    return { success };
  }

  async sendCommand(tvId, command) {
    const profileId = this.detectedProfiles.get(tvId);
    if (!profileId) {
      console.warn('[IR] Nessun profilo configurato per', tvId);
      return { success: false, reason: 'missing_profile' };
    }
    const profile = this.getProfile(profileId);
    const cmdData = profile?.commands[command];

    if (!cmdData) {
      console.warn('[IR] Comando non trovato nel profilo', command);
      return { success: false, reason: 'command_not_found' };
    }

    console.log('[IR] Sending command', command, 'with frequency', cmdData.frequency);

    // BRIDGE NATIVO ANDROID
    if (window.AndroidIR && window.AndroidIR.hasIrEmitter()) {
      try {
        window.AndroidIR.transmit(cmdData.frequency, cmdData.pattern.join(','));
        return { success: true, native: true };
      } catch (e) {
        console.error('[IR] Errore bridge nativo', e);
      }
    }

    // Fallback Mock per testing browser
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { success: true, code: cmdData.pattern };
  }
}

export const irService = new IrService();
