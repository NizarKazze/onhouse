import { contactDetails } from "@/i18n/copy";
import type { Locale } from "@/types";

/**
 * Legal texts (aviso legal, privacy and cookies), in both languages.
 * The Spanish version is the reference text; the English one is a courtesy
 * translation and says so.
 */

/** A paragraph, or a bullet list when it is an array. */
export type LegalBlock = string | string[];

export type LegalSection = {
  heading: string;
  body: LegalBlock[];
};

export type LegalDoc = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export type LegalDocId = "notice" | "privacy" | "cookies";

export const LEGAL_UPDATED = { en: "22 October 2026", es: "22 de octubre de 2026" };

/**
 * Who runs the site. The bracketed values still have to be filled in by the
 * owner before launch: the LSSI requires a tax ID and a postal address.
 */
export const legalEntity = {
  holder: contactDetails.founder,
  taxId: "[NIF PENDIENTE]",
  address: "[DOMICILIO PENDIENTE], Ibiza (Illes Balears), España",
  email: contactDetails.generalEmail,
  phone: contactDetails.phone,
  domain: contactDetails.site,
} as const;

const e = legalEntity;

export const legal: Record<Locale, Record<LegalDocId, LegalDoc>> = {
  es: {
    notice: {
      title: "AVISO LEGAL",
      intro:
        "En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan los datos identificativos del titular de este sitio web.",
      sections: [
        {
          heading: "1. Titular",
          body: [
            [
              `Titular: ${e.holder}, que opera bajo la marca ONHOUSE.`,
              `NIF: ${e.taxId}`,
              `Domicilio: ${e.address}`,
              `Correo electrónico: ${e.email}`,
              `Teléfono: ${e.phone}`,
              `Dominio: ${e.domain}`,
            ],
          ],
        },
        {
          heading: "2. Objeto",
          body: [
            "Este sitio web presenta el proyecto ONHOUSE: sus eventos de música house en Ibiza, sus artistas y sus datos de contacto. El acceso es gratuito y no requiere registro.",
            "La venta de entradas no se realiza en este sitio. Los enlaces de «Entradas» llevan a plataformas de terceros, cuyas condiciones de compra, devolución y privacidad son las de cada plataforma.",
          ],
        },
        {
          heading: "3. Condiciones de uso",
          body: [
            "Quien navega por este sitio se compromete a hacer un uso adecuado de sus contenidos, conforme a la ley, la buena fe y el orden público, y a no emplearlos para actividades ilícitas ni para dañar el sitio, sus sistemas o a terceros.",
            "La zona de administración está reservada al personal autorizado de ONHOUSE. Cualquier intento de acceso no autorizado está prohibido.",
          ],
        },
        {
          heading: "4. Propiedad intelectual e industrial",
          body: [
            "La marca ONHOUSE, el diseño del sitio, los textos, las fotografías, los vídeos y el resto de contenidos pertenecen a su titular o a terceros que han autorizado su uso. Los nombres, imágenes y marcas de los artistas pertenecen a sus respectivos titulares.",
            "Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa, salvo para uso personal y privado.",
          ],
        },
        {
          heading: "5. Información sobre los eventos",
          body: [
            "Las fechas, salas, horarios y carteles se publican de buena fe y pueden cambiar. La información vinculante de cada evento es la que figure en la plataforma de venta de entradas y en las condiciones de acceso de la sala.",
          ],
        },
        {
          heading: "6. Enlaces externos",
          body: [
            "El sitio contiene enlaces a sitios de terceros (por ejemplo, Instagram o plataformas de venta de entradas). ONHOUSE no controla esos sitios ni responde de sus contenidos ni de su tratamiento de datos.",
          ],
        },
        {
          heading: "7. Responsabilidad",
          body: [
            "ONHOUSE procura que el sitio funcione de forma continua y sin errores, pero no puede garantizarlo. No será responsable de los daños derivados de interrupciones, fallos técnicos o virus ajenos a su control, ni del uso indebido del sitio por parte de terceros.",
          ],
        },
        {
          heading: "8. Legislación y jurisdicción",
          body: [
            "Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan conforme a la ley; cuando el usuario sea consumidor, los de su domicilio.",
          ],
        },
      ],
    },

    privacy: {
      title: "POLÍTICA DE PRIVACIDAD",
      intro:
        "Esta política explica qué datos personales se tratan a través de este sitio web, para qué y con qué derechos, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).",
      sections: [
        {
          heading: "1. Responsable del tratamiento",
          body: [
            [
              `Responsable: ${e.holder} (ONHOUSE)`,
              `NIF: ${e.taxId}`,
              `Domicilio: ${e.address}`,
              `Correo electrónico: ${e.email}`,
            ],
          ],
        },
        {
          heading: "2. Qué datos tratamos",
          body: [
            "El sitio no tiene formularios, registro de usuarios ni herramientas de analítica o publicidad. Solo se tratan datos personales en estos casos:",
            [
              "Contacto: cuando nos escribes por correo electrónico, nos llamas o nos contactas por Instagram, tratamos tu nombre, tus datos de contacto y lo que nos cuentes.",
              "Datos técnicos de navegación: al visitar el sitio, el servidor recibe tu dirección IP, el navegador y la página solicitada. Se usan solo para servir la web, mantenerla segura y evitar abusos (por ejemplo, limitar el número de peticiones).",
              "Administración: las personas autorizadas que acceden al panel de administración se identifican con usuario y contraseña. Registramos los intentos de acceso (usuario, IP y fecha) para impedir ataques.",
            ],
          ],
        },
        {
          heading: "3. Finalidades y base jurídica",
          body: [
            [
              "Responder a tus consultas, bookings, colaboraciones o peticiones de prensa: tu consentimiento al escribirnos y, en su caso, la aplicación de medidas precontractuales o de un contrato (art. 6.1.a y 6.1.b RGPD).",
              "Seguridad y funcionamiento del sitio: nuestro interés legítimo en proteger el servicio (art. 6.1.f RGPD).",
              "Gestión del acceso al panel de administración: la relación con las personas autorizadas y el interés legítimo en la seguridad (art. 6.1.b y 6.1.f RGPD).",
            ],
            "No tomamos decisiones automatizadas ni elaboramos perfiles con tus datos.",
          ],
        },
        {
          heading: "4. Cuánto tiempo los conservamos",
          body: [
            [
              "Comunicaciones de contacto: el tiempo necesario para atender tu petición y, después, durante los plazos de prescripción de las responsabilidades que pudieran derivarse.",
              "Datos técnicos e intentos de acceso: un periodo breve, solo el necesario para la seguridad; después se eliminan automáticamente.",
              "Sesiones de administración: caducan tras un periodo de inactividad y, en todo caso, a las 12 horas.",
            ],
          ],
        },
        {
          heading: "5. Destinatarios",
          body: [
            "No cedemos tus datos a terceros salvo obligación legal. Para prestar el servicio usamos proveedores que actúan como encargados del tratamiento:",
            [
              "Vercel Inc. (alojamiento del sitio y almacenamiento de imágenes).",
              "El proveedor de base de datos del sitio, para los datos del panel de administración.",
              "El proveedor de correo electrónico con el que recibimos tus mensajes.",
            ],
            "Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo, en particular en Estados Unidos. Esas transferencias se amparan en el Marco de Privacidad de Datos UE-EE. UU. o en las cláusulas contractuales tipo aprobadas por la Comisión Europea.",
          ],
        },
        {
          heading: "6. Tus derechos",
          body: [
            "Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como retirar tu consentimiento en cualquier momento, escribiendo a " +
              `${e.email}. Indica qué derecho ejerces y, si es necesario para identificarte, aporta un documento que acredite tu identidad.`,
            "Si consideras que no hemos tratado tus datos correctamente, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).",
          ],
        },
        {
          heading: "7. Menores",
          body: [
            "Este sitio no está dirigido a menores de 14 años y no tratamos conscientemente sus datos. El acceso a los eventos está sujeto a la edad mínima que fije cada sala.",
          ],
        },
        {
          heading: "8. Seguridad",
          body: [
            "Aplicamos medidas técnicas y organizativas adecuadas: conexión cifrada (HTTPS), contraseñas almacenadas de forma irreversible, cookies de sesión protegidas y limitación de intentos de acceso.",
          ],
        },
        {
          heading: "9. Cambios",
          body: [
            "Podemos actualizar esta política cuando cambie el sitio o la normativa. La fecha de la última actualización figura al final de esta página.",
          ],
        },
      ],
    },

    cookies: {
      title: "POLÍTICA DE COOKIES",
      intro:
        "Esta política explica qué cookies y tecnologías similares utiliza este sitio, conforme al artículo 22.2 de la LSSI-CE.",
      sections: [
        {
          heading: "1. Qué son las cookies",
          body: [
            "Las cookies son pequeños archivos que un sitio web guarda en tu dispositivo. Tecnologías similares, como el almacenamiento local del navegador (localStorage), cumplen una función parecida.",
          ],
        },
        {
          heading: "2. Qué utilizamos",
          body: [
            "Este sitio no utiliza cookies de análisis, de publicidad ni de redes sociales, y no rastrea tu navegación. Solo usamos elementos técnicos necesarios:",
            [
              "onhouse.lang (almacenamiento local del navegador): recuerda el idioma que eliges (español o inglés). Es propio, no caduca hasta que lo borres y no contiene datos personales.",
              "__Host-onh_session (cookie propia): mantiene la sesión de las personas autorizadas en el panel de administración. Solo se crea al iniciar sesión, caduca como máximo a las 12 horas y no afecta a los visitantes.",
            ],
            "Al ser estrictamente necesarios para el servicio que solicitas, estos elementos están exentos de consentimiento y por eso el sitio no muestra un aviso de cookies.",
          ],
        },
        {
          heading: "3. Sitios de terceros",
          body: [
            "Si sigues un enlace a Instagram o a una plataforma de venta de entradas, ese sitio puede instalar sus propias cookies. Consulta su política de cookies; ONHOUSE no las controla.",
          ],
        },
        {
          heading: "4. Cómo gestionarlas",
          body: [
            "Puedes ver y borrar las cookies y el almacenamiento local desde la configuración de tu navegador. Si los borras, el sitio volverá a mostrarse en el idioma por defecto.",
          ],
        },
        {
          heading: "5. Cambios",
          body: [
            "Si en el futuro incorporamos cookies que requieran tu consentimiento, actualizaremos esta política y te lo pediremos antes de instalarlas.",
          ],
        },
      ],
    },
  },

  en: {
    notice: {
      title: "LEGAL NOTICE",
      intro:
        "In accordance with article 10 of Spanish Law 34/2002 on Information Society Services and Electronic Commerce (LSSI-CE), these are the details of the owner of this website. This is a courtesy translation; the Spanish version prevails.",
      sections: [
        {
          heading: "1. Owner",
          body: [
            [
              `Owner: ${e.holder}, trading as ONHOUSE.`,
              `Tax ID (NIF): ${e.taxId}`,
              `Address: ${e.address}`,
              `Email: ${e.email}`,
              `Phone: ${e.phone}`,
              `Domain: ${e.domain}`,
            ],
          ],
        },
        {
          heading: "2. Purpose",
          body: [
            "This website presents the ONHOUSE project: its house music events in Ibiza, its artists and its contact details. Access is free and requires no registration.",
            "Tickets are not sold on this site. “Get tickets” links lead to third-party platforms, whose purchase, refund and privacy terms are their own.",
          ],
        },
        {
          heading: "3. Terms of use",
          body: [
            "By using this site you agree to use its content lawfully and in good faith, and not to use it for unlawful purposes or to harm the site, its systems or anyone else.",
            "The administration area is reserved for authorised ONHOUSE staff. Any attempt at unauthorised access is prohibited.",
          ],
        },
        {
          heading: "4. Intellectual property",
          body: [
            "The ONHOUSE brand, the site design, texts, photographs, videos and other content belong to their owner or to third parties who have authorised their use. Artists’ names, images and marks belong to their respective owners.",
            "Reproduction, distribution, public communication or transformation without express permission is prohibited, except for personal, private use.",
          ],
        },
        {
          heading: "5. Event information",
          body: [
            "Dates, venues, times and line-ups are published in good faith and may change. The binding information for each event is the one shown on the ticketing platform and in the venue’s admission terms.",
          ],
        },
        {
          heading: "6. External links",
          body: [
            "The site links to third-party sites (for example Instagram or ticketing platforms). ONHOUSE does not control those sites and is not responsible for their content or their handling of personal data.",
          ],
        },
        {
          heading: "7. Liability",
          body: [
            "ONHOUSE tries to keep the site running continuously and without errors but cannot guarantee it. It is not liable for damage caused by interruptions, technical failures or malware beyond its control, or by misuse of the site by third parties.",
          ],
        },
        {
          heading: "8. Governing law",
          body: [
            "These terms are governed by Spanish law. Any dispute will be heard by the courts that have jurisdiction under the law; where the user is a consumer, those of their place of residence.",
          ],
        },
      ],
    },

    privacy: {
      title: "PRIVACY POLICY",
      intro:
        "This policy explains what personal data is processed through this website, why, and what rights you have, under Regulation (EU) 2016/679 (GDPR) and Spanish Organic Law 3/2018 (LOPDGDD). This is a courtesy translation; the Spanish version prevails.",
      sections: [
        {
          heading: "1. Data controller",
          body: [
            [
              `Controller: ${e.holder} (ONHOUSE)`,
              `Tax ID (NIF): ${e.taxId}`,
              `Address: ${e.address}`,
              `Email: ${e.email}`,
            ],
          ],
        },
        {
          heading: "2. What data we process",
          body: [
            "The site has no forms, no user accounts and no analytics or advertising tools. Personal data is only processed in these cases:",
            [
              "Contact: when you email us, call us or reach us on Instagram, we process your name, your contact details and whatever you tell us.",
              "Technical browsing data: when you visit the site, the server receives your IP address, browser and the page requested. This is used only to serve the site, keep it secure and prevent abuse (for example, by limiting the number of requests).",
              "Administration: authorised people who use the admin panel sign in with a username and password. We log sign-in attempts (username, IP and time) to stop attacks.",
            ],
          ],
        },
        {
          heading: "3. Purposes and legal basis",
          body: [
            [
              "Answering your enquiries, bookings, collaborations or press requests: your consent when you contact us and, where relevant, taking steps before or under a contract (GDPR art. 6.1.a and 6.1.b).",
              "Keeping the site secure and working: our legitimate interest in protecting the service (GDPR art. 6.1.f).",
              "Managing access to the admin panel: our relationship with authorised people and our legitimate interest in security (GDPR art. 6.1.b and 6.1.f).",
            ],
            "We do not make automated decisions or build profiles from your data.",
          ],
        },
        {
          heading: "4. How long we keep it",
          body: [
            [
              "Contact messages: as long as needed to deal with your request, then for the limitation periods of any resulting liabilities.",
              "Technical data and sign-in attempts: a short period, only as long as security requires; they are then deleted automatically.",
              "Admin sessions: they expire after a period of inactivity and, in any case, after 12 hours.",
            ],
          ],
        },
        {
          heading: "5. Recipients",
          body: [
            "We do not share your data with third parties unless the law requires it. To run the service we use providers acting as data processors:",
            [
              "Vercel Inc. (site hosting and image storage).",
              "The site’s database provider, for admin panel data.",
              "The email provider through which we receive your messages.",
            ],
            "Some of these providers may process data outside the European Economic Area, in particular in the United States. Those transfers rely on the EU-US Data Privacy Framework or on the standard contractual clauses approved by the European Commission.",
          ],
        },
        {
          heading: "6. Your rights",
          body: [
            "You can exercise your rights of access, rectification, erasure, objection, restriction and portability, and withdraw your consent at any time, by writing to " +
              `${e.email}. Say which right you are exercising and, if needed to identify you, include proof of identity.`,
            "If you believe we have not handled your data properly, you can complain to the Spanish Data Protection Agency (www.aepd.es).",
          ],
        },
        {
          heading: "7. Minors",
          body: [
            "This site is not aimed at children under 14 and we do not knowingly process their data. Entry to events is subject to the minimum age set by each venue.",
          ],
        },
        {
          heading: "8. Security",
          body: [
            "We apply appropriate technical and organisational measures: encrypted connections (HTTPS), passwords stored irreversibly, protected session cookies and limits on sign-in attempts.",
          ],
        },
        {
          heading: "9. Changes",
          body: [
            "We may update this policy when the site or the law changes. The date of the last update is shown at the bottom of this page.",
          ],
        },
      ],
    },

    cookies: {
      title: "COOKIE POLICY",
      intro:
        "This policy explains which cookies and similar technologies this site uses, under article 22.2 of Spanish Law 34/2002 (LSSI-CE). This is a courtesy translation; the Spanish version prevails.",
      sections: [
        {
          heading: "1. What cookies are",
          body: [
            "Cookies are small files a website stores on your device. Similar technologies, such as the browser’s local storage (localStorage), do much the same job.",
          ],
        },
        {
          heading: "2. What we use",
          body: [
            "This site uses no analytics, advertising or social media cookies, and does not track your browsing. We only use strictly necessary technical items:",
            [
              "onhouse.lang (browser local storage): remembers the language you choose (English or Spanish). First-party, kept until you clear it, and contains no personal data.",
              "__Host-onh_session (first-party cookie): keeps authorised people signed in to the admin panel. It is only set on sign-in, expires after 12 hours at most and does not affect visitors.",
            ],
            "Because they are strictly necessary for the service you request, these items are exempt from consent, which is why the site shows no cookie banner.",
          ],
        },
        {
          heading: "3. Third-party sites",
          body: [
            "If you follow a link to Instagram or a ticketing platform, that site may set its own cookies. Check its cookie policy; ONHOUSE does not control them.",
          ],
        },
        {
          heading: "4. Managing them",
          body: [
            "You can view and delete cookies and local storage in your browser settings. If you clear them, the site will go back to its default language.",
          ],
        },
        {
          heading: "5. Changes",
          body: [
            "If we ever add cookies that need your consent, we will update this policy and ask for your consent before setting them.",
          ],
        },
      ],
    },
  },
};
