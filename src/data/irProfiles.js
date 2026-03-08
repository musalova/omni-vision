const BASE_COMMANDS = [
  'power',
  'mute',
  'volumeUp',
  'volumeDown',
  'channelUp',
  'channelDown',
  'input1',
  'input2',
  'input3',
  'navUp',
  'navDown',
  'navLeft',
  'navRight',
  'ok',
  'enter',
];

const DIGIT_COMMANDS = Array.from({ length: 10 }, (_, index) => `digit${index}`);

function buildCommands(frequency) {
  const commands = {};
  BASE_COMMANDS.forEach((command, index) => {
    commands[command] = {
      frequency,
      pattern: [9000, 4500 - index * 200, 560, 560 + index * 20],
    };
  });

  DIGIT_COMMANDS.forEach((command, index) => {
    commands[command] = {
      frequency,
      pattern: [9000, 2500 - index * 120, 560, 560],
    };
  });

  return commands;
}

export const irProfiles = [
  {
    id: 'zephir-basic',
    brand: 'Zephir',
    compatibility: ['auto'],
    commands: buildCommands(38000),
  },
  {
    id: 'zephir-legacy',
    brand: 'Zephir',
    compatibility: ['auto'],
    commands: buildCommands(36000),
  },
  {
    id: 'ok-classic',
    brand: 'OK',
    compatibility: ['ok-tv', 'generic', 'auto'],
    commands: buildCommands(39500),
  },
  {
    id: 'generic-legacy',
    brand: 'Generic',
    compatibility: ['auto'],
    commands: buildCommands(40000),
  },
  {
    id: 'omni-universal',
    brand: 'Universal',
    compatibility: ['zephir', 'ok-tv', 'generic', 'auto'],
    commands: buildCommands(38500),
  },
];
