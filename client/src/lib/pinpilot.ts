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

export const DEFAULT_SETTINGS: PlannerSettings = {
  accountName: "Mi cuenta de Pinterest",
  timezone: "America/Mexico_City",
  publishTime: "09:00",
  postsPerWeek: 3,
  daysOfWeek: [1, 3, 5],
  boards: ["Ideas para desayunos", "Hogar cálido", "Flores y papelería"],
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

export const createDemoPins = (): PinterestPin[] => [
  {
    id: "demo-breakfast",
    title: "Un desayuno nutritivo en 10 minutos",
    description:
      "Ideas sencillas para comenzar la mañana con algo rico, colorido y lleno de energía.",
    link: "https://example.com/desayunos-faciles",
    board: "Ideas para desayunos",
    image: "/assets/pin-breakfast.jpg",
    scheduledAt: addDaysAtTime(2, "09:00"),
    status: "scheduled",
    exported: false,
  },
  {
    id: "demo-home",
    title: "Un rincón cálido con tonos terracota",
    description:
      "Texturas naturales, plantas y tonos cálidos para transformar un espacio sin complicarlo.",
    link: "https://example.com/decoracion-calida",
    board: "Hogar cálido",
    image: "/assets/pin-interior.jpg",
    scheduledAt: addDaysAtTime(5, "09:00"),
    status: "scheduled",
    exported: false,
  },
  {
    id: "demo-flowers",
    title: "Flores prensadas para tus proyectos creativos",
    description:
      "Guarda tus flores favoritas y úsalas para crear tarjetas, separadores y detalles hechos a mano.",
    link: "https://example.com/flores-prensadas",
    board: "Flores y papelería",
    image: "/assets/pin-flowers.jpg",
    scheduledAt: null,
    status: "draft",
    exported: false,
  },
  {
    id: "demo-guide",
    title: "Tu guía rápida para planear la semana",
    description:
      "Un plan ligero para guardar ideas, elegir prioridades y tener más claridad al comenzar la semana.",
    link: "",
    board: "Ideas para desayunos",
    image: "",
    scheduledAt: null,
    status: "draft",
    exported: false,
  },
];

export const readPins = (): PinterestPin[] => {
  try {
    const raw = window.localStorage.getItem(PINS_KEY);
    if (raw === null) return createDemoPins();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PinterestPin[]) : createDemoPins();
  } catch {
    return createDemoPins();
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
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<PlannerSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      boards: Array.isArray(parsed.boards) ? parsed.boards : DEFAULT_SETTINGS.boards,
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
  return { id, title, description, link, board, image, scheduledAt, status, exported };
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
