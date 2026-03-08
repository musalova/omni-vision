const defaultChannels = [
  { id: 'rai1', name: 'Rai 1', genre: 'Informazione', number: 1, logo: 'logos/rai1.png' },
  { id: 'rai2', name: 'Rai 2', genre: 'Intrattenimento', number: 2, logo: 'logos/rai2.png' },
  { id: 'rai3', name: 'Rai 3', genre: 'Cultura', number: 3, logo: 'logos/rai3.png' },
  { id: 'rete4', name: 'Rete 4', genre: 'Cinema', number: 4, logo: 'logos/rete4.png' },
  { id: 'canale5', name: 'Canale 5', genre: 'Intrattenimento', number: 5, logo: 'logos/canale5.png' },
  { id: 'italia1', name: 'Italia 1', genre: 'Serie TV', number: 6, logo: 'logos/italia1.png' },
  { id: 'la7', name: 'LA7', genre: 'Informazione', number: 7, logo: 'logos/la7.png' },
  { id: 'tv8', name: 'TV8', genre: 'Intrattenimento', number: 8, logo: 'logos/tv8.png' },
  { id: 'nove', name: 'NOVE', genre: 'Documentario', number: 9, logo: 'logos/nove.png' },
  { id: 'canale20', name: 'Canale 20', genre: 'Cinema', number: 20, logo: 'logos/canale20.png' },
  { id: 'rai4', name: 'Rai 4', genre: 'Serie TV', number: 21, logo: 'logos/rai4.png' },
  { id: 'iris', name: 'Iris', genre: 'Cinema', number: 22, logo: 'logos/iris.png' },
  { id: 'rai5', name: 'Rai 5', genre: 'Cultura', number: 23, logo: 'logos/rai5.png' },
  { id: 'raimovie', name: 'Rai Movie', genre: 'Cinema', number: 24, logo: 'logos/raimovie.png' },
  { id: 'raipremium', name: 'Rai Premium', genre: 'Intrattenimento', number: 25, logo: 'logos/raipremium.png' },
  { id: 'cielo', name: 'Cielo', genre: 'Intrattenimento', number: 26, logo: 'logos/cielo.png' },
  { id: 'twentyseven', name: 'Mediaset 27', genre: 'Cinema', number: 27, logo: 'logos/mediaset27.png' },
  { id: 'tv2000', name: 'TV2000', genre: 'Cultura', number: 28, logo: 'logos/tv2000.png' },
  { id: 'la7d', name: 'LA7 Cinema', genre: 'Intrattenimento', number: 29, logo: 'logos/la7d.png' },
  { id: 'la5', name: 'La5', genre: 'Lifestyle', number: 30, logo: 'logos/la5.png' },
  { id: 'realtime', name: 'Real Time', genre: 'Reality', number: 31, logo: 'logos/realtime.png' },
  { id: 'qvc', name: 'QVC', genre: 'Shopping', number: 32, logo: 'logos/qvc.png' },
  { id: 'foodnetwork', name: 'Food Network', genre: 'Cucina', number: 33, logo: 'logos/foodnetwork.png' },
  { id: 'cine34', name: 'Cine34', genre: 'Cinema', number: 34, logo: 'logos/cine34.png' },
  { id: 'focus', name: 'Focus', genre: 'Documentario', number: 35, logo: 'logos/focus.png' },
  { id: 'discovery', name: 'Discovery Channel', genre: 'Documentario', number: 37, logo: 'logos/discovery.png' },
  { id: 'giallo', name: 'Giallo', genre: 'Crime', number: 38, logo: 'logos/giallo.png' },
  { id: 'topcrime', name: 'TopCrime', genre: 'Crime', number: 39, logo: 'logos/topcrime.png' },
  { id: 'boing', name: 'Boing', genre: 'Kids', number: 40, logo: 'logos/boing.png' },
  { id: 'k2', name: 'K2', genre: 'Kids', number: 41, logo: 'logos/k2.png' },
  { id: 'raigulp', name: 'Rai Gulp', genre: 'Kids', number: 42, logo: 'logos/raigulp.png' },
  { id: 'raiyoyo', name: 'Rai YoYo', genre: 'Kids', number: 43, logo: 'logos/raiyoyo.png' },
  { id: 'frisbee', name: 'Frisbee', genre: 'Kids', number: 44, logo: 'logos/frisbee.png' },
  { id: 'boingplus', name: 'Boing Plus', genre: 'Kids', number: 45, logo: 'logos/boingplus.png' },
  { id: 'cartoonito', name: 'Cartoonito', genre: 'Kids', number: 46, logo: 'logos/cartoonito.png' },
  { id: 'super', name: 'Super!', genre: 'Kids', number: 47, logo: 'logos/super.png' },
  { id: 'rainews24', name: 'Rai News 24', genre: 'Informazione', number: 48, logo: 'logos/rainews24.png' },
  { id: 'italia2', name: 'Mediaset Italia Due', genre: 'Intrattenimento', number: 49, logo: 'logos/italia2.png' },
  { id: 'skytg24', name: 'Sky TG24', genre: 'Informazione', number: 50, logo: 'logos/skytg24.png' },
  { id: 'tgcom24', name: 'TGCom24', genre: 'Informazione', number: 51, logo: 'logos/tgcom24.png' },
  { id: 'dmax', name: 'DMAX', genre: 'Documentario', number: 52, logo: 'logos/dmax.png' },
  { id: 'raistoria', name: 'Rai Storia', genre: 'Documentario', number: 54, logo: 'logos/raistoria.png' },
  { id: 'mediasetextra', name: 'Mediaset Extra', genre: 'Intrattenimento', number: 55, logo: 'logos/mediasetextra.png' },
];

const now = new Date();

function createProgram(
  channelId,
  title,
  genre,
  offsetMinutes,
  durationMinutes,
  description,
  cast = [],
  rating = 3.8,
  popularity = 50
) {
  const start = new Date(now.getTime() + offsetMinutes * 60000);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return {
    id: `${channelId}-${start.getTime()}`,
    channelId,
    title,
    genre,
    description,
    cast,
    rating,
    popularity,
    start,
    end,
  };
}

const manualPrograms = [
  createProgram(
    'rai1',
    'Linea Verde',
    'Documentario',
    -15,
    60,
    'Alla scoperta delle eccellenze agroalimentari italiane.',
    ['Beppe Convertini', 'Peppone Calabrese'],
    4.1,
    62
  ),
  createProgram(
    'rai2',
    'N.C.I.S.',
    'Serie TV',
    0,
    50,
    'La squadra indaga su un omicidio collegato a un agente sotto copertura.',
    ['Mark Harmon', 'Sean Murray'],
    4.4,
    78
  ),
  createProgram(
    'rai3',
    'Geo',
    'Documentario',
    -30,
    90,
    'Viaggio nelle tradizioni artigianali del Mediterraneo.',
    ['Sveva Sagramola'],
    3.9,
    55
  ),
  createProgram(
    'canale5',
    'Uomini e Donne',
    'Intrattenimento',
    10,
    120,
    'Nuove storie d’amore nello studio di Maria De Filippi.',
    ['Maria De Filippi'],
    3.5,
    70
  ),
  createProgram(
    'italia1',
    'The Big Bang Theory',
    'Comedy',
    -5,
    25,
    'Sheldon e Leonard affrontano un nuovo esperimento fallimentare.',
    ['Jim Parsons', 'Johnny Galecki'],
    4.6,
    82
  ),
  createProgram(
    'rete4',
    'Quarto Grado',
    'Inchiesta',
    30,
    150,
    'Approfondimenti sui casi di cronaca più discussi.',
    ['Gianluigi Nuzzi'],
    4.0,
    60
  ),
  createProgram(
    'la7',
    'Otto e Mezzo',
    'Informazione',
    -10,
    60,
    'Intervista e dibattito sull’attualità politica.',
    ['Lilli Gruber'],
    4.3,
    68
  ),
  createProgram(
    'tv8',
    'MasterChef Italia - Replay',
    'Cucina',
    20,
    90,
    'Le migliori prove a eliminazione riproposte con commenti inediti.',
    ['Bruno Barbieri', 'Antonino Cannavacciuolo'],
    4.2,
    65
  ),
  createProgram(
    'nove',
    'Little Big Italy',
    'Reality',
    -45,
    60,
    'Francesco Panella alla ricerca del miglior ristorante italiano all’estero.',
    ['Francesco Panella'],
    4.0,
    58
  ),
  createProgram(
    'canale20',
    'Batman Begins',
    'Cinema',
    -60,
    140,
    'Le origini del Cavaliere Oscuro nel film di Christopher Nolan.',
    ['Christian Bale', 'Michael Caine'],
    4.5,
    80
  ),
  createProgram(
    'paramount',
    'Star Trek: Discovery',
    'Sci-Fi',
    15,
    50,
    'Nuova missione per l’equipaggio della USS Discovery.',
    ['Sonequa Martin-Green'],
    4.4,
    72
  ),
  createProgram(
    'rai4',
    'Doctor Who',
    'Sci-Fi',
    -20,
    50,
    'Il Dottore e la sua nuova companion affrontano un paradosso temporale.',
    ['Ncuti Gatwa'],
    4.2,
    63
  ),
  createProgram(
    'rai5',
    'Art Night',
    'Documentario',
    25,
    90,
    'Viaggio tra le mostre d’arte contemporanea europee.',
    ['Neri Marcorè'],
    3.8,
    40
  ),
  createProgram(
    'raimovie',
    'Il Grande Gatsby',
    'Cinema',
    -120,
    140,
    'L’adattamento con Leonardo DiCaprio del romanzo di Fitzgerald.',
    ['Leonardo DiCaprio', 'Carey Mulligan'],
    4.1,
    67
  ),
  createProgram(
    'raipremium',
    'Don Matteo (replica)',
    'Serie TV',
    5,
    55,
    'Il maresciallo Cecchini e Don Matteo risolvono un nuovo caso.',
    ['Terence Hill', 'Nino Frassica'],
    4.0,
    70
  ),
  createProgram(
    'raigulp',
    'Miraculous: Le storie di Ladybug e Chat Noir',
    'Kids',
    30,
    25,
    'Marinette affronta un nuovo villain a Parigi.',
    ['Cristina Valenziano'],
    3.7,
    50
  ),
  createProgram(
    'raiyoyo',
    'Peppa Pig',
    'Kids',
    -15,
    10,
    'Peppa e George costruiscono un enorme castello di sabbia.',
    ['Peppa Pig'],
    3.5,
    58
  ),
  createProgram(
    'tv2000',
    'TG2000',
    'Informazione',
    45,
    30,
    'Notiziario con focus su attualità e Vaticano.',
    ['Gennaro Ferrara'],
    3.6,
    35
  ),
];

const manualProgramIds = new Set(manualPrograms.map((program) => program.channelId));

const fallbackPrograms = defaultChannels
  .filter((channel) => !manualProgramIds.has(channel.id))
  .map((channel, index) =>
    createProgram(
      channel.id,
      `Programmazione ${channel.name}`,
      channel.genre,
      (index % 4) * 15,
      60,
      `Slot generico per ${channel.name}.`,
      [],
      3.5,
      25
    )
  );

const defaultProgramSchedule = [...manualPrograms, ...fallbackPrograms];

export let channels = defaultChannels;
export let programSchedule = defaultProgramSchedule;

export function overrideProgramData({ channels: newChannels, programSchedule: newSchedule } = {}) {
  if (Array.isArray(newChannels) && newChannels.length) {
    channels = newChannels;
  }
  if (Array.isArray(newSchedule) && newSchedule.length) {
    programSchedule = newSchedule.map((program) => {
      if (program.start && program.end) {
        return {
          ...program,
          start: new Date(program.start),
          end: new Date(program.end),
        };
      }

      if (typeof program.offsetMinutes === 'number' && typeof program.durationMinutes === 'number') {
        return createProgram(
          program.channelId,
          program.title,
          program.genre,
          program.offsetMinutes,
          program.durationMinutes,
          program.description,
          program.cast,
          program.rating,
          program.popularity
        );
      }

      return {
        ...program,
        start: program.start ? new Date(program.start) : new Date(now.getTime()),
        end: program.end ? new Date(program.end) : new Date(now.getTime() + 45 * 60000),
      };
    });
    ensureChannelCoverage();
  }
}

function ensureChannelCoverage() {
  const coveredChannels = new Set(programSchedule.map((program) => program.channelId));
  const missingChannels = channels.filter((channel) => !coveredChannels.has(channel.id));

  if (!missingChannels.length) return;

  const fillerPrograms = missingChannels.map((channel, index) =>
    createProgram(
      channel.id,
      `Programmazione ${channel.name}`,
      channel.genre,
      (index % 4) * 20,
      60,
      `Slot automatico per ${channel.name}.`
    )
  );

  programSchedule = [...programSchedule, ...fillerPrograms];
}
