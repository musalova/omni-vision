import { enrichProgram, getPrograms, getProgramById } from './programGuide.js';

const TIME_SLOTS = {
  notte: [0, 6],
  mattina: [6, 12],
  pomeriggio: [12, 18],
  sera: [18, 24],
};

function getTimeSlotId(date) {
  const target = new Date(date);
  const hour = target.getHours();
  const slotEntry = Object.entries(TIME_SLOTS).find(([, [start, end]]) => hour >= start && hour < end);
  return slotEntry ? slotEntry[0] : 'sera';
}

function normalize(value, min = 0, max = 5) {
  const clamped = Math.max(min, Math.min(max, value));
  return (clamped - min) / (max - min);
}

export function scoreProgram(program, preferences) {
  const { genreScores = {}, channelScores = {}, actorScores = {}, timeSlotScores = {}, likedPrograms = [], dislikedPrograms = [] } =
    preferences || {};

  if (dislikedPrograms.includes(program.id)) {
    return { score: -Infinity, reasons: ['Hai indicato che non ti interessa.'] };
  }

  const reasons = [];
  let score = 0;

  const genreScore = genreScores[program.genre] || 0;
  if (genreScore) {
    score += genreScore * 1.5;
    reasons.push(`Ti piacciono i programmi ${program.genre}`);
  }

  const channelScore = channelScores[program.channelId] || 0;
  if (channelScore) {
    score += channelScore * 1.2;
    reasons.push(`Segui spesso ${program.channelName}`);
  }

  const castMatch = program.cast?.reduce((total, actor) => total + (actorScores[actor] || 0), 0) || 0;
  if (castMatch) {
    score += castMatch * 1.1;
    reasons.push('Ritornano attori che guardi spesso');
  }

  const slotId = getTimeSlotId(program.start);
  const slotScore = timeSlotScores[slotId] || 0;
  if (slotScore) {
    score += slotScore;
    reasons.push('Orario coerente con le tue abitudini');
  }

  const ratingBoost = normalize(program.rating || 3.5, 3, 5) * 3;
  score += ratingBoost;
  if (ratingBoost > 1.5) reasons.push('Ottime recensioni');

  const popularityBoost = normalize((program.popularity || 50) / 20, 0, 5) * 1.5;
  score += popularityBoost;

  const isLive = program.start <= new Date() && program.end >= new Date();
  if (isLive) {
    score += 2;
    reasons.push('In onda adesso');
  }

  if (likedPrograms.includes(program.id)) {
    score += 3;
    reasons.push('Già tra i tuoi preferiti');
  }

  return { score, reasons };
}

export function getSuggestions(preferences, options = {}) {
  const programs = getPrograms(options).map(enrichProgram);
  return programs
    .map((program) => {
      const { score, reasons } = scoreProgram(program, preferences);
      return { ...program, score, reasons };
    })
    .filter((program) => Number.isFinite(program.score) && program.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export function getProgramSummary(programId) {
  const program = getProgramById(programId);
  return program ? enrichProgram(program) : null;
}
