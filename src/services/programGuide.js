import { channels, programSchedule } from '../data/programs.js';

function formatTime(date) {
  return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

export function getChannels() {
  return channels;
}

export function getChannelOptions() {
  return [{ id: 'all', name: 'Tutti' }, ...channels];
}

export function getGenreOptions() {
  const genres = Array.from(new Set(programSchedule.map((program) => program.genre)));
  return ['Tutti', ...genres];
}

export function getPrograms({ channelId = 'all', genre = 'Tutti', channelNumber = '', searchTerm = '' } = {}) {
  const normalizedNumber = channelNumber.trim();
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return programSchedule.filter((program) => {
    const channel = channels.find((c) => c.id === program.channelId);
    const matchesChannel = channelId === 'all' || program.channelId === channelId;
    const matchesGenre = genre === 'Tutti' || program.genre === genre;
    const matchesNumber = !normalizedNumber || String(channel?.number || '').startsWith(normalizedNumber);
    const matchesSearch =
      !normalizedSearch ||
      [program.title, program.genre, channel?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));

    return matchesChannel && matchesGenre && matchesNumber && matchesSearch;
  });
}

export function getProgramById(programId) {
  const program = programSchedule.find((entry) => entry.id === programId);
  return program ? enrichProgram(program) : null;
}

export function getChannelByNumber(number) {
  return channels.find((channel) => String(channel.number) === String(number));
}

export function enrichProgram(program) {
  const channel = channels.find((c) => c.id === program.channelId);
  return {
    ...program,
    channelName: channel?.name || 'Sconosciuto',
    channelNumber: channel?.number || '?',
    channelLogo: channel?.logo || '',
    formattedStart: formatTime(program.start),
    formattedEnd: formatTime(program.end),
    durationMinutes: Math.round((program.end - program.start) / 60000),
  };
}

export function getEnrichedPrograms(filters) {
  return getPrograms(filters).map(enrichProgram);
}
