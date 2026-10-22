import type { Locale } from "@/types";

/**
 * Every string in the ONHOUSE design, in both languages.
 * Event and artist copy lives in the data layer instead, since it belongs to
 * those records rather than to the interface.
 */
export type Pillar = {
  num: string;
  title: string;
  body: string;
};

export type Dictionary = {
  navEvents: string;
  navArtists: string;
  navExperience: string;
  navAbout: string;
  navContact: string;
  menu: string;
  close: string;
  tickets: string;
  heroKicker: string;
  heroLine1: string;
  heroLine2: string;
  ctaNext: string;
  ctaDiscover: string;
  scroll: string;
  nextEvent: string;
  upcoming: string;
  date: string;
  venue: string;
  time: string;
  lineup: string;
  allEvents: string;
  upcomingTitle: string;
  aboutKicker: string;
  aboutTitle: string;
  aboutBody1: string;
  aboutBody2: string;
  aboutQuote: string;
  aboutMark: string;
  soundKicker: string;
  soundBody: string;
  cultureQuote: string;
  tagCommunity: string;
  tagRespect: string;
  tagFreedom: string;
  tagRhythm: string;
  tagConnection: string;
  expKicker: string;
  pillars: Pillar[];
  expIntro1: string;
  expIntro2: string;
  expIntro3: string;
  artistsKicker: string;
  viewAll: string;
  vctrKicker: string;
  vctrGenre: string;
  vctrResident: string;
  vctrBody: string;
  vctrCta: string;
  ibizaBody: string;
  contactKicker: string;
  contactTitle: string;
  contactBody: string;
  bookings: string;
  general: string;
  phone: string;
  founder: string;
  promoter: string;
  promoterBody: string;
  eventsIntro: string;
  archive: string;
  archiveTitle: string;
  archiveBody: string;
  artistsIntro: string;
  bookingCta: string;
  footerStatement: string;
  navigate: string;
  reach: string;
  legal: string;
  legalNotice: string;
  privacy: string;
  cookies: string;
  rights: string;
  lastUpdated: string;
  /** States that the design implies but does not spell out. */
  noEvents: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  notFoundTitle: string;
  notFoundBody: string;
  backHome: string;
  loading: string;
  prevPage: string;
  nextPage: string;
  pagination: string;
};

export const copy: Record<Locale, Dictionary> = {
  en: {
    navEvents: "EVENTS",
    navArtists: "ARTISTS",
    navExperience: "EXPERIENCE",
    navAbout: "ABOUT",
    navContact: "CONTACT",
    menu: "MENU",
    close: "CLOSE",
    tickets: "GET TICKETS",
    heroKicker: "AFTER DARK",
    heroLine1: "THE MUSIC COMMANDS",
    heroLine2: "THE NIGHT.",
    ctaNext: "NEXT EVENT",
    ctaDiscover: "DISCOVER THE EXPERIENCE",
    scroll: "SCROLL",
    nextEvent: "NEXT EVENT",
    upcoming: "UPCOMING",
    date: "DATE",
    venue: "VENUE",
    time: "DOORS",
    lineup: "LINE-UP",
    allEvents: "ALL EVENTS",
    upcomingTitle: "UPCOMING EVENTS",
    aboutKicker: "WHO WE ARE",
    aboutTitle: "A COMMUNITY BUILT AROUND HOUSE MUSIC",
    aboutBody1:
      "ONHOUSE was born from a deep passion for house music and the belief that music has the power to connect people. Every night is built so that music, space and audience are in sync.",
    aboutBody2:
      "We do not simply organise parties. We build a community around a specific musical vision: long sets, deep sounds, intimate atmospheres and elegance without artifice.",
    aboutQuote: "CREATE FOLLOWERS, NOT ATTENDEES.",
    aboutMark: "Who we are",
    soundKicker: "THE SOUND",
    soundBody:
      "Sound does not accompany the night. It commands it. House, deep house and tech house, played long enough to take the room somewhere. Music first, party second.",
    cultureQuote: "THERE ARE NO SPECTATORS. EVERYONE IS PART OF THE RITUAL.",
    tagCommunity: "COMMUNITY",
    tagRespect: "RESPECT",
    tagFreedom: "FREEDOM",
    tagRhythm: "RHYTHM",
    tagConnection: "CONNECTION",
    expKicker: "THE EXPERIENCE",
    pillars: [
      {
        num: "1",
        title: "MUSIC",
        body: "Musical consistency: elegant, deep house, away from commercial sound.",
      },
      {
        num: "2",
        title: "FLOW",
        body: "Organic control of energy, so the DJ and the dancefloor stay connected.",
      },
      {
        num: "3",
        title: "SPACE",
        body: "Light and atmosphere built to strengthen club culture, not to decorate it.",
      },
    ],
    expIntro1:
      "It is not just a party. It is a space where rhythm commands and everything else disappears.",
    expIntro2:
      "We come from the underground, where identity is built without filters or poses. Low lights, deep bass, a room where everyone vibrates at the same frequency and the music connects for real.",
    expIntro3:
      "There are no spectators here; everyone is part of the ritual. We commit to raw house and hypnotic grooves that turn the night into a journey, where time dissolves and the experience feels authentic.",
    artistsKicker: "ARTISTS",
    viewAll: "VIEW ALL",
    vctrKicker: "IN FOCUS",
    vctrGenre: "HOUSE / DEEP HOUSE",
    vctrResident: "RESIDENT",
    vctrBody:
      "Long sets built slowly. VCTR holds the room from the first record to the last, moving from deep house into harder, hypnotic grooves without ever breaking the thread.",
    vctrCta: "DISCOVER VCTR",
    ibizaBody:
      "Ibiza read through its music culture rather than its postcards. Clubs, dancefloors, booths, sound systems and the hours between midnight and dawn. Ibiza after dark, not Ibiza on holiday.",
    contactKicker: "CONTACT",
    contactTitle: "BOOKINGS, COLLABORATIONS, NIGHTS.",
    contactBody:
      "For bookings, collaborations, press or anything else, write to us directly. Ticketing links will be added once 001 is confirmed.",
    bookings: "BOOKINGS",
    general: "GENERAL",
    phone: "PHONE",
    founder: "FOUNDER / PROMOTER",
    promoter: "PROMOTER",
    promoterBody: "AURO — festival and theatre management",
    eventsIntro:
      "An editorial record of ONHOUSE nights. Upcoming dates first, then the archive.",
    archive: "ARCHIVE",
    archiveTitle: "THE ARCHIVE BEGINS WITH 001.",
    archiveBody:
      "Nothing here yet. Every night from 001 onwards will be documented in black and white: photography, video, line-up and the room as it was.",
    artistsIntro:
      "Residents and guests. Each name is confirmed only when the set is confirmed. Line-ups are announced here before anywhere else.",
    bookingCta: "PLAYING HOUSE AND WANT TO PLAY ONHOUSE?",
    footerStatement: "THE MUSIC COMMANDS THE NIGHT.",
    navigate: "NAVIGATE",
    reach: "REACH US",
    legal: "LEGAL",
    legalNotice: "Legal Notice",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    rights: "ALL RIGHTS RESERVED",
    lastUpdated: "LAST UPDATED",
    noEvents: "NO DATES ANNOUNCED YET.",
    errorTitle: "SOMETHING BROKE.",
    errorBody: "The night goes on. Try again, or head back to the start.",
    retry: "TRY AGAIN",
    notFoundTitle: "NOTHING HERE.",
    notFoundBody: "This page does not exist. The music is happening elsewhere.",
    backHome: "BACK HOME",
    loading: "LOADING",
    prevPage: "PREV",
    nextPage: "NEXT",
    pagination: "Events pages",
  },
  es: {
    navEvents: "EVENTOS",
    navArtists: "ARTISTAS",
    navExperience: "EXPERIENCIA",
    navAbout: "NOSOTROS",
    navContact: "CONTACTO",
    menu: "MENÚ",
    close: "CERRAR",
    tickets: "ENTRADAS",
    heroKicker: "DE NOCHE",
    heroLine1: "LA MÚSICA MANDA",
    heroLine2: "EN LA NOCHE.",
    ctaNext: "PRÓXIMO EVENTO",
    ctaDiscover: "DESCUBRE LA EXPERIENCIA",
    scroll: "BAJA",
    nextEvent: "PRÓXIMO EVENTO",
    upcoming: "PRÓXIMO",
    date: "FECHA",
    venue: "SALA",
    time: "HORARIO",
    lineup: "CARTEL",
    allEvents: "TODOS LOS EVENTOS",
    upcomingTitle: "PRÓXIMOS EVENTOS",
    aboutKicker: "QUIÉNES SOMOS",
    aboutTitle: "UNA COMUNIDAD EN TORNO AL HOUSE",
    aboutBody1:
      "ONHOUSE nace de una pasión profunda por el house y de la convicción de que la música conecta a las personas. Cada noche se construye para que música, espacio y público vayan sincronizados.",
    aboutBody2:
      "No organizamos fiestas sin más. Construimos una comunidad alrededor de una visión musical concreta: sesiones largas, sonidos profundos, ambientes íntimos y elegancia sin artificio.",
    aboutQuote: "CREAR SEGUIDORES, NO ASISTENTES.",
    aboutMark: "Quiénes somos",
    soundKicker: "EL SONIDO",
    soundBody:
      "El sonido no acompaña la noche: la manda. House, deep house y tech house, con el tiempo suficiente para llevar la sala a otro sitio. Primero la música, después la fiesta.",
    cultureQuote: "NO HAY ESPECTADORES. TODOS FORMAN PARTE DEL RITUAL.",
    tagCommunity: "COMUNIDAD",
    tagRespect: "RESPETO",
    tagFreedom: "LIBERTAD",
    tagRhythm: "RITMO",
    tagConnection: "CONEXIÓN",
    expKicker: "LA EXPERIENCIA",
    pillars: [
      {
        num: "1",
        title: "MÚSICA",
        body: "Coherencia musical: house elegante y profundo, lejos de lo comercial.",
      },
      {
        num: "2",
        title: "FLOW",
        body: "Control orgánico de la energía para que el DJ y la pista sigan conectados.",
      },
      {
        num: "3",
        title: "ESPACIO",
        body: "Luz y atmósfera para reforzar la cultura de club, no para decorarla.",
      },
    ],
    expIntro1:
      "No es solo una fiesta. Es un espacio donde el ritmo manda y todo lo demás desaparece.",
    expIntro2:
      "Nacemos desde la esencia underground, donde la identidad se construye sin filtros ni poses. Creamos un ambiente de luces bajas y bajos profundos, un espacio donde cada persona vibra en la misma frecuencia y la música conecta de forma real.",
    expIntro3:
      "Aquí no hay espectadores, todos forman parte del ritual. Apostamos por house crudo y grooves hipnóticos que transforman la noche en un viaje, donde el tiempo se disuelve y la experiencia se siente auténtica.",
    artistsKicker: "ARTISTAS",
    viewAll: "VER TODOS",
    vctrKicker: "EN FOCO",
    vctrGenre: "HOUSE / DEEP HOUSE",
    vctrResident: "RESIDENTE",
    vctrBody:
      "Sesiones largas construidas con calma. VCTR sostiene la sala desde el primer disco hasta el último, pasando del deep house a grooves más duros e hipnóticos sin romper nunca el hilo.",
    vctrCta: "DESCUBRIR VCTR",
    ibizaBody:
      "Ibiza leída desde su cultura musical y no desde sus postales. Clubes, pistas, cabinas, equipos de sonido y las horas entre la medianoche y el amanecer. Ibiza de noche, no Ibiza de vacaciones.",
    contactKicker: "CONTACTO",
    contactTitle: "BOOKINGS, COLABORACIONES, NOCHES.",
    contactBody:
      "Para bookings, colaboraciones, prensa o cualquier otra cosa, escríbenos directamente. Los enlaces de venta se añadirán cuando 001 esté confirmado.",
    bookings: "BOOKINGS",
    general: "GENERAL",
    phone: "TELÉFONO",
    founder: "FUNDADOR / PROMOTOR",
    promoter: "PROMOTOR",
    promoterBody: "AURO — gestión de festivales y teatros",
    eventsIntro:
      "Un registro editorial de las noches ONHOUSE. Primero las fechas próximas, después el archivo.",
    archive: "ARCHIVO",
    archiveTitle: "EL ARCHIVO EMPIEZA EN 001.",
    archiveBody:
      "Todavía no hay nada aquí. Cada noche a partir de 001 quedará documentada en blanco y negro: fotografía, vídeo, cartel y la sala tal como fue.",
    artistsIntro:
      "Residentes e invitados. Cada nombre se confirma solo cuando se confirma la sesión. Los carteles se anuncian aquí antes que en ningún otro sitio.",
    bookingCta: "¿PINCHAS HOUSE Y QUIERES PINCHAR EN ONHOUSE?",
    footerStatement: "LA MÚSICA MANDA EN LA NOCHE.",
    navigate: "NAVEGAR",
    reach: "CONTACTO",
    legal: "LEGAL",
    legalNotice: "Aviso Legal",
    privacy: "Política de Privacidad",
    cookies: "Política de Cookies",
    rights: "TODOS LOS DERECHOS RESERVADOS",
    lastUpdated: "ÚLTIMA ACTUALIZACIÓN",
    noEvents: "AÚN NO HAY FECHAS ANUNCIADAS.",
    errorTitle: "ALGO HA FALLADO.",
    errorBody: "La noche sigue. Inténtalo de nuevo o vuelve al principio.",
    retry: "REINTENTAR",
    notFoundTitle: "AQUÍ NO HAY NADA.",
    notFoundBody: "Esta página no existe. La música está en otro sitio.",
    backHome: "VOLVER AL INICIO",
    loading: "CARGANDO",
    prevPage: "ANT.",
    nextPage: "SIG.",
    pagination: "Páginas de eventos",
  },
};

/** Contact details, identical in both languages. */
export const contactDetails = {
  bookingsEmail: "bartolome.munoz@onhouse.es",
  generalEmail: "Marvicol2010@hotmail.com",
  phone: "+34 691 88 06 71",
  phoneHref: "tel:+34691880671",
  instagram: "@onhouseofficial",
  instagramHref: "https://instagram.com/onhouseofficial",
  site: "www.onhouse.es",
  siteHref: "https://www.onhouse.es",
  founder: "Bartolomé Muñoz Pons",
} as const;
