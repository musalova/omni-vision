import { irProfiles } from '../data/irProfiles.js';

class IrService {
  constructor() {
    this.mode = 'mock';
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
    await new Promise((resolve) => setTimeout(resolve, 500));
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
    const code = profile?.commands[command];

    console.log('[IR] Sending command', command, 'with code', code);
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { success: Boolean(code), code };
  }
}

export const irService = new IrService();
