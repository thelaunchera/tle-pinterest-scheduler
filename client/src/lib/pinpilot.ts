import { mergeOriginalCarousels } from "./editorial-carousels";

export type PinStatus = "draft" | "scheduled" | "published";

export type PinterestPin = {
  id: string;
  title: string;
  description: string;
  link: string;
  board: string;
  image: string;
  scheduledAt: string | null;
  status: PinStatus;
  exported: boolean;
  sourceUrl?: string;
  assetsUrl?: string;
  slideUrls?: string[];
  slideCount?: number;
  reviewNote?: string;
};

export type PlannerSettings = {
  accountName: string;
  timezone: string;
  publishTime: string;
  postsPerWeek: number;
  daysOfWeek: number[];
  boards: string[];
};

export type PinPilotBackup = {
  format: "pinpilot-backup";
  version: 1;
  exportedAt: string;
  pins: PinterestPin[];
  settings: PlannerSettings;
};

const PINS_KEY = "pinpilot.pins.v1";
const SETTINGS_KEY = "pinpilot.settings.v1";
const FLORIDA_TIMEZONE_MIGRATION_KEY = "pinpilot.timezone.florida.v1";

export const DEFAULT_SETTINGS: PlannerSettings = {
  accountName: "The Launch Era · Pinterest",
  timezone: "America/New_York",
  publishTime: "10:00",
  postsPerWeek: 3,
  daysOfWeek: [1, 3, 5],
  boards: ["Websites & Digital Menus", "Creative Direction & Product Photos", "Personajes · Websites + IA", "Freebies · Carruseles creativos"],
};

const zonedParts = (value: string | Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const result: Record<string, string> = {};
  for (const part of parts) if (part.type !== "literal") result[part.type] = part.value;
  return result;
};

export const zonedDateKey = (value: string | Date, timezone: string) => {
  const parts = zonedParts(value, timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const zonedTime = (value: string | Date, timezone: string) => {
  const parts = zonedParts(value, timezone);
  return `${parts.hour}:${parts.minute}`;
};

export const zonedDateTimeKey = (value: string | Date, timezone: string) =>
  `${zonedDateKey(value, timezone)}-${zonedTime(value, timezone)}`;

export const zonedCaption = (value: string | null, timezone: string) =>
  value
    ? new Intl.DateTimeFormat("es-MX", {
        timeZone: timezone,
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(new Date(value))
    : "Sin fecha";

export const toZonedInputValue = (value: string | null, timezone: string) => {
  if (!value) return "";
  const parts = zonedParts(value, timezone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

export const fromZonedInputValue = (value: string, timezone: string) => {
  if (!value) return null;
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const wallTimeAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const displayed = zonedParts(new Date(wallTimeAsUtc), timezone);
  const displayedAsUtc = Date.UTC(
    Number(displayed.year),
    Number(displayed.month) - 1,
    Number(displayed.day),
    Number(displayed.hour),
    Number(displayed.minute),
    0,
    0,
  );
  const offset = displayedAsUtc - wallTimeAsUtc;
  const instant = new Date(wallTimeAsUtc - offset);
  const roundTrip = zonedParts(instant, timezone);
  const normalized = `${roundTrip.year}-${roundTrip.month}-${roundTrip.day}T${roundTrip.hour}:${roundTrip.minute}`;
  return normalized === value ? instant.toISOString() : null;
};

export const dateKeyDistance = (from: string, to: string) => {
  const parse = (key: string) => {
    const [year, month, day] = key.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((parse(to) - parse(from)) / 86_400_000);
};

export const addDaysToDateKey = (key: string, offset: number) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10);
};

export const weekdayForDateKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

export const mondayStartDateKey = (key: string) =>
  addDaysToDateKey(key, -((weekdayForDateKey(key) + 6) % 7));

export const escapeSpreadsheetCsvCell = (value: string) => {
  const safeValue = /^[\u0000-\u0020\u007f\u00a0]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
};

const addDaysAtTime = (offset: number, time = "09:00") => {
  const [year, month, day] = zonedDateKey(new Date(), DEFAULT_SETTINGS.timezone).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  const dateKey = date.toISOString().slice(0, 10);
  return fromZonedInputValue(`${dateKey}T${time}`, DEFAULT_SETTINGS.timezone) ?? new Date().toISOString();
};

// Curated from the current The Launch Era Notion editorial notebook and the live creative freebie.
// These are DRAFTS, not approved Pinterest publications. Keep separate from Podcast, Class and Content Lab calendars.
export const EDITORIAL_IMPORT_KEY = "tle-editorial-2026";
export const editorial2026Pins = (): PinterestPin[] => [
  {
    id: "tle-notion-418a-website-portfolio",
    title: "What could your website look like?",
    description: "What could your website look like? Here are four concepts from The Launch Era, from a brownie shop with gift boxes to a nail studio with an inspo wall. DM us WEBSITE and tell us what you’re building.",
    link: "https://thelaunchera.com/website-for-your-business/",
    board: "Websites & Digital Menus",
    image: `${import.meta.env.BASE_URL}pinpilot-campaign/2026-11/golden-grid.png`,
    scheduledAt: null,
    status: "draft",
    exported: false,
  },
  {
    id: "tle-notion-418a-blue-hour",
    title: "Blue Hour — Fragrance Editorial",
    description: "I started with a cobalt bottle and one question. How many moods can a single shade of blue hold? I used AI to explore four scenes for the same bottle. Blue Hour is a fragrance concept by The Launch Era. Which frame would you put on the cover?",
    link: "https://thelaunchera.com/",
    board: "Creative Direction & Product Photos",
    image: `${import.meta.env.BASE_URL}pinpilot-campaign/2026-11/blue-hour.png`,
    scheduledAt: null,
    status: "draft",
    exported: false,
  },
  {
    id: "tle-notion-419a-admin-panel",
    title: "The Launch Era · What your Admin Panel can change",
    description: "Editorial brief from Notion: Show website content, product photos, pricing and menu/promotions as actually supported. Compare client-managed and monthly-managed services. Images and final caption require approval.",
    link: "https://thelaunchera.com/website-for-your-business/",
    board: "Websites & Digital Menus",
    image: `${import.meta.env.BASE_URL}pinpilot-campaign/2026-11/golden-grid.png`,
    scheduledAt: null,
    status: "draft",
    exported: false,
  },
  {
    id: "tle-notion-419a-instagram-visitors",
    title: "The Launch Era · Your Instagram has visitors. Where do they go next?",
    description: "Editorial brief from Notion: Show an authentic mobile website walkthrough and a working inquiry CTA. Script and visuals are awaiting owner review; not scheduled.",
    link: "https://thelaunchera.com/",
    board: "Websites & Digital Menus",
    image: "",
    scheduledAt: null,
    status: "draft",
    exported: false,
  },
  {
    id: "tle-notion-419a-website-pretty",
    title: "The Launch Era · Your website should do more than look pretty",
    description: "Editorial brief from Notion: Authentic restaurant, service or digital menu demo showing real interactions. CTA: See the demo. No fake checkout or automatic confirmations.",
    link: "https://thelaunchera.com/website-for-your-business/",
    board: "Websites & Digital Menus",
    image: "",
    scheduledAt: null,
    status: "draft",
    exported: false,
  },
  {
    id: "tle-notion-419a-demo-inquiry",
    title: "The Launch Era · From live demo to client inquiry",
    description: "Editorial brief from Notion: Show a verified business demo and a clear next step: request and reply. No unpublished client information. Final visuals and caption pending review.",
    link: "https://thelaunchera.com/",
    board: "Websites & Digital Menus",
    image: "",
    scheduledAt: null,
    status: "draft",
    exported: false,
  },
  {
    id: "tle-resource-8-master-prompts",
    title: "8 Master Prompts — Free Creative Photo Ideas",
    description: "Creative resource from the active The Launch Era Content Lab freebie campaign. Eight product photography composition ideas adaptable to shops, food and beauty brands. Resource is live; Pinterest artwork and caption are not yet approved.",
    link: "https://podcast.thelaunchera.com/content-lab/prompts/",
    board: "Creative Direction & Product Photos",
    image: "https://podcast.thelaunchera.com/content-lab/prompts/matcha-01.jpg?v=hd-20261031",
    scheduledAt: null,
    status: "draft",
    exported: false,
  },
];

export const mergeEditorial2026Pins = (existing: PinterestPin[]) => {
  const known = new Set(existing.map(pin => pin.id));
  const added = editorial2026Pins().filter(pin => !known.has(pin.id));
  return { added: added.length, pins: [...existing, ...added] };
};

// Remove ONLY demo content and the three speculative pins added before reviewing Notion.
// Save the entire prior browser state before migration. Never remove other user-created pins.
const OLD_DEMO_IDS = new Set([
  "demo-breakfast", "demo-home", "demo-flowers", "demo-guide",
  "tle-pin-2026-11-16-freebie-photo-ideas",
  "tle-pin-2026-11-18-food-digital-menu",
  "tle-pin-2026-11-20-beauty-website",
]);
const EDITORIAL_MIGRATION_KEY = "pinpilot.editorial-tle-2026.v1";
const EDITORIAL_PREVIOUS_BACKUP_KEY = "pinpilot.editorial-tle-2026.previous-pins.v1";
const CAROUSEL_MIGRATION_KEY = "pinpilot.original-carousels.v1";
const CAROUSEL_PREVIOUS_BACKUP_KEY = "pinpilot.original-carousels.previous-pins.v1";

export const createDemoPins = (): PinterestPin[] => []; // No fabricated demo pins in a real business workspace.

export const migrateToRealEditorialPins = (existing: PinterestPin[]) => {
  const removed = existing.filter(pin => OLD_DEMO_IDS.has(pin.id) || /block[ -]?jam/i.test(pin.title));
  const keep = existing.filter(pin => !OLD_DEMO_IDS.has(pin.id) && !/block[ -]?jam/i.test(pin.title));
  return { ...mergeEditorial2026Pins(keep), removed: removed.length };
};

export const readPins = (): PinterestPin[] => {
  try {
    const raw = window.localStorage.getItem(PINS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const current = Array.isArray(parsed) ? (parsed as PinterestPin[]) : [];
    const editorialDone = window.localStorage.getItem(EDITORIAL_MIGRATION_KEY) === "done";
    const carouselDone = window.localStorage.getItem(CAROUSEL_MIGRATION_KEY) === "done";
    if (editorialDone && carouselDone) return current;

    // Never replace an edited draft; import only unseen source IDs.
    const basePins = editorialDone ? current : migrateToRealEditorialPins(current).pins;
    const updatedPins = carouselDone ? basePins : mergeOriginalCarousels(basePins).pins;
    if (raw !== null && raw !== JSON.stringify(updatedPins)) {
      // Keep one local copy of the entire previous library before changing it.
      const backupKey = editorialDone ? CAROUSEL_PREVIOUS_BACKUP_KEY : EDITORIAL_PREVIOUS_BACKUP_KEY;
      if (window.localStorage.getItem(backupKey) === null) {
        window.localStorage.setItem(backupKey, raw);
      }
    }
    window.localStorage.setItem(PINS_KEY, JSON.stringify(updatedPins));
    if (!editorialDone) window.localStorage.setItem(EDITORIAL_MIGRATION_KEY, "done");
    if (!carouselDone) window.localStorage.setItem(CAROUSEL_MIGRATION_KEY, "done");
    return updatedPins;
  } catch {
    // Preserve the original browser records on storage failure rather than risk data loss.
    try {
      const raw = window.localStorage.getItem(PINS_KEY);
      const pins: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(pins) ? pins as PinterestPin[] : [];
    } catch { return []; }
  }
};

export const savePins = (pins: PinterestPin[]): boolean => {
  try {
    window.localStorage.setItem(PINS_KEY, JSON.stringify(pins));
    return true;
  } catch {
    return false;
  }
};

export const readSettings = (): PlannerSettings => {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      window.localStorage.setItem(FLORIDA_TIMEZONE_MIGRATION_KEY, "done");
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw) as Partial<PlannerSettings>;
    // Migrate the original Mexico City default once without changing later custom choices.
    if (!window.localStorage.getItem(FLORIDA_TIMEZONE_MIGRATION_KEY)) {
      if (parsed.timezone === "America/Mexico_City") {
        parsed.timezone = "America/New_York";
      }
      window.localStorage.setItem(FLORIDA_TIMEZONE_MIGRATION_KEY, "done");
    }
    // Remove only the sample board labels shipped with the old demo workspace.
    // Retain any real, user-created boards and the user's custom account name.
    if (!window.localStorage.getItem("pinpilot.editorial-boards-tle-2026.v1")) {
      const obsoleteBoards = new Set(["Ideas para desayunos", "Hogar cálido", "Flores y papelería"]);
      const existingBoards = Array.isArray(parsed.boards) ? parsed.boards : [];
      parsed.boards = [...new Set([...existingBoards.filter(board => !obsoleteBoards.has(board)), ...DEFAULT_SETTINGS.boards])];
      if (parsed.accountName === "Mi cuenta de Pinterest") parsed.accountName = DEFAULT_SETTINGS.accountName;
      window.localStorage.setItem("pinpilot.editorial-boards-tle-2026.v1", "done");
    }
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      boards: Array.isArray(parsed.boards) ? [...new Set([...parsed.boards, ...DEFAULT_SETTINGS.boards])] : DEFAULT_SETTINGS.boards,
      daysOfWeek: Array.isArray(parsed.daysOfWeek)
        ? parsed.daysOfWeek
        : DEFAULT_SETTINGS.daysOfWeek,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: PlannerSettings): boolean => {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
};

export const createPinPilotBackup = (
  pins: PinterestPin[],
  settings: PlannerSettings,
  exportedAt = new Date().toISOString(),
): PinPilotBackup => ({
  format: "pinpilot-backup",
  version: 1,
  exportedAt,
  pins: pins.map(pin => ({ ...pin })),
  settings: {
    ...settings,
    daysOfWeek: [...settings.daysOfWeek],
    boards: [...settings.boards],
  },
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isValidImageReference = (value: string) => {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (/^data:image\/(?:jpeg|png|webp|gif);base64,[a-z\d+/]+=*$/i.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const parseBackupPin = (value: unknown, index: number): PinterestPin => {
  if (!isRecord(value)) throw new Error(`El pin ${index + 1} del respaldo no es válido.`);
  const { id, title, description, link, board, image, scheduledAt, status, exported } = value;
  if (
    typeof id !== "string" || !id.trim() || id.length > 200 ||
    typeof title !== "string" || typeof description !== "string" ||
    typeof link !== "string" || typeof board !== "string" ||
    typeof image !== "string" || !isValidImageReference(image) ||
    !(scheduledAt === null || (typeof scheduledAt === "string" && Number.isFinite(Date.parse(scheduledAt)))) ||
    !(status === "draft" || status === "scheduled" || status === "published") ||
    typeof exported !== "boolean"
  ) {
    throw new Error(`El pin ${index + 1} del respaldo contiene campos inválidos.`);
  }
  // Keep source links, slide order and editorial review notes in JSON backups.
  const { sourceUrl, assetsUrl, slideUrls, slideCount, reviewNote } = value;
  const validSourceLink = (link: unknown) =>
    typeof link === "string" && link.length <= 2000 && /^https:\/\//.test(link);
  if (
    (sourceUrl !== undefined && !validSourceLink(sourceUrl)) ||
    (assetsUrl !== undefined && !validSourceLink(assetsUrl)) ||
    (slideUrls !== undefined &&
      (!Array.isArray(slideUrls) || slideUrls.length > 24 || !slideUrls.every(validSourceLink))) ||
    (slideCount !== undefined && (!Number.isInteger(slideCount) || (slideCount as number) < 0 || (slideCount as number) > 24)) ||
    (reviewNote !== undefined && (typeof reviewNote !== "string" || reviewNote.length > 2000))
  ) throw new Error(`El pin ${index + 1} contiene enlaces o notas de carrusel inválidos.`);
  return {
    id, title, description, link, board, image, scheduledAt, status, exported,
    ...(sourceUrl !== undefined ? { sourceUrl: sourceUrl as string } : {}),
    ...(assetsUrl !== undefined ? { assetsUrl: assetsUrl as string } : {}),
    ...(slideUrls !== undefined ? { slideUrls: slideUrls as string[] } : {}),
    ...(slideCount !== undefined ? { slideCount: slideCount as number } : {}),
    ...(reviewNote !== undefined ? { reviewNote: reviewNote as string } : {}),
  };
};

const parseBackupSettings = (value: unknown): PlannerSettings => {
  if (!isRecord(value)) throw new Error("Los ajustes del respaldo no son válidos.");
  const { accountName, timezone, publishTime, postsPerWeek, daysOfWeek, boards } = value;
  if (
    typeof accountName !== "string" || typeof timezone !== "string" ||
    typeof publishTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(publishTime) ||
    typeof postsPerWeek !== "number" || !Number.isInteger(postsPerWeek) || postsPerWeek < 1 || postsPerWeek > 7 ||
    !Array.isArray(daysOfWeek) || daysOfWeek.length > 7 ||
    !daysOfWeek.every(day => typeof day === "number" && Number.isInteger(day) && day >= 0 && day <= 6) ||
    new Set(daysOfWeek).size !== daysOfWeek.length ||
    !Array.isArray(boards) || boards.some(board => typeof board !== "string")
  ) {
    throw new Error("Los ajustes del respaldo contienen campos inválidos.");
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
  } catch {
    throw new Error("La zona horaria del respaldo no es válida.");
  }
  return {
    accountName,
    timezone,
    publishTime,
    postsPerWeek,
    daysOfWeek: [...daysOfWeek],
    boards: [...boards],
  };
};

export const parsePinPilotBackup = (contents: string): PinPilotBackup => {
  let value: unknown;
  try {
    value = JSON.parse(contents);
  } catch {
    throw new Error("El archivo no contiene JSON válido.");
  }
  if (!isRecord(value) || value.format !== "pinpilot-backup" || value.version !== 1) {
    throw new Error("El archivo no es un respaldo PinPilot compatible.");
  }
  if (typeof value.exportedAt !== "string" || !Number.isFinite(Date.parse(value.exportedAt))) {
    throw new Error("La fecha del respaldo no es válida.");
  }
  if (!Array.isArray(value.pins)) throw new Error("La lista de pines del respaldo no es válida.");
  const pins = value.pins.map(parseBackupPin);
  if (new Set(pins.map(pin => pin.id)).size !== pins.length) {
    throw new Error("El respaldo contiene identificadores de pin repetidos.");
  }
  return {
    format: "pinpilot-backup",
    version: 1,
    exportedAt: value.exportedAt,
    pins,
    settings: parseBackupSettings(value.settings),
  };
};

export const newPinId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `pin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
