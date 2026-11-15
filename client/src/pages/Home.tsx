import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  GripVertical,
  ImagePlus,
  LayoutGrid,
  LibraryBig,
  Link2,
  Menu,
  MoreHorizontal,
  Pencil,
  Pin,
  Plus,
  Search,
  Settings2,
  Shuffle,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { toast } from "sonner";
import {
  addDaysToDateKey,
  dateKeyDistance,
  createPinPilotBackup,
  parsePinPilotBackup,
  escapeSpreadsheetCsvCell,
  fromZonedInputValue,
  mondayStartDateKey,
  newPinId,
  readPins,
  readSettings,
  savePins,
  saveSettings,
  toZonedInputValue,
  weekdayForDateKey,
  zonedCaption,
  zonedDateKey,
  zonedDateTimeKey,
  zonedTime,
  type PinterestPin,
  type PlannerSettings,
  type PinPilotBackup,
  type PinStatus,
} from "@/lib/pinpilot";

type Section = "schedule" | "library" | "export" | "settings";
type CalendarView = "month" | "week";
type PinForm = Omit<PinterestPin, "id" | "exported">;

const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

const TIMEZONES = [
  { value: "America/Mexico_City", label: "Ciudad de México (UTC−6)" },
  { value: "America/Bogota", label: "Bogotá (UTC−5)" },
  { value: "America/Lima", label: "Lima (UTC−5)" },
  { value: "America/Santiago", label: "Santiago (UTC−4/−3)" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (UTC−3)" },
  { value: "America/New_York", label: "Nueva York (UTC−5/−4)" },
  { value: "America/New_York", label: "Florida — Este, Miami/Orlando (UTC−5/−4)" },
  { value: "America/Chicago", label: "Florida Panhandle — Pensacola (UTC−6/−5)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (UTC−8/−7)" },
  { value: "Europe/Madrid", label: "Madrid (UTC+1/+2)" },
];

const EMPTY_FORM: PinForm = {
  title: "",
  description: "",
  link: "",
  board: "",
  image: "",
  scheduledAt: null,
  status: "draft",
};

const monthLabel = (date: Date) => {
  const value = format(date, "MMMM yyyy", { locale: es });
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const dateValue = (date: Date, time: string, timezone: string) =>
  fromZonedInputValue(`${format(date, "yyyy-MM-dd")}T${time}`, timezone);

const dateFromDateKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const dateCaption = (value: string | null, timezone: string) =>
  zonedCaption(value, timezone);

const statusText: Record<PinStatus, string> = {
  draft: "Borrador",
  scheduled: "Programado",
  published: "Marcado como publicado",
};

const statusClass: Record<PinStatus, string> = {
  draft: "status-draft",
  scheduled: "status-scheduled",
  published: "status-published",
};

function PinThumb({ pin, compact = false }: { pin: PinterestPin; compact?: boolean }) {
  if (pin.image) {
    return (
      <div className={`pin-thumb ${compact ? "pin-thumb-compact" : ""}`}>
        <img src={pin.image} alt="" loading="lazy" />
      </div>
    );
  }
  return (
    <div className={`pin-thumb pin-thumb-empty ${compact ? "pin-thumb-compact" : ""}`}>
      <span><Pin size={compact ? 12 : 18} /></span>
    </div>
  );
}

function PinCard({
  pin,
  onEdit,
  compact = false,
}: {
  pin: PinterestPin;
  onEdit: (pin: PinterestPin) => void;
  compact?: boolean;
}) {
  return (
    <button className={`pin-card ${compact ? "pin-card-compact" : ""}`} onClick={() => onEdit(pin)}>
      <PinThumb pin={pin} compact={compact} />
      <span className="pin-card-copy">
        <span className="pin-card-title">{pin.title || "Pin sin título"}</span>
        {!compact && <span className="pin-card-board">{pin.board || "Sin tablero"}</span>}
      </span>
      {compact && <span className={`mini-status ${statusClass[pin.status]}`} />}
    </button>
  );
}

function AppMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <Pin size={19} strokeWidth={2.7} />
      <Sparkles size={10} className="brand-spark" />
    </span>
  );
}

async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Elige un archivo de imagen.");
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("No se pudo leer la imagen."));
    });
    const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la imagen.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        value => (value ? resolve(value) : reject(new Error("No se pudo comprimir la imagen."))),
        "image/jpeg",
        0.82,
      );
    });
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("No se pudo guardar la imagen."));
      reader.readAsDataURL(blob);
    });
  } finally {
    URL.revokeObjectURL(source);
  }
}

function buildSlots(
  count: number,
  settings: PlannerSettings,
  currentPins: PinterestPin[],
): string[] {
  const allowedDays = [...new Set(settings.daysOfWeek)];
  if (!allowedDays.length) return [];
  const perWeek = Math.max(1, Math.min(7, settings.postsPerWeek));
  const weekCounts = new Map<string, number>();
  const taken = new Set<string>();
  currentPins
    .filter(pin => pin.status === "scheduled" && pin.scheduledAt)
    .forEach(pin => {
      const dayKey = zonedDateKey(pin.scheduledAt!, settings.timezone);
      const weekKey = mondayStartDateKey(dayKey);
      weekCounts.set(weekKey, (weekCounts.get(weekKey) ?? 0) + 1);
      taken.add(zonedDateTimeKey(pin.scheduledAt!, settings.timezone));
    });
  const slots: string[] = [];
  const todayKey = zonedDateKey(new Date(), settings.timezone);

  for (let offset = 1; offset <= 240 && slots.length < count; offset += 1) {
    const dayKey = addDaysToDateKey(todayKey, offset);
    if (!allowedDays.includes(weekdayForDateKey(dayKey))) continue;
    const weekKey = mondayStartDateKey(dayKey);
    if ((weekCounts.get(weekKey) ?? 0) >= perWeek) continue;

    const [preferredHour, preferredMinute] = settings.publishTime.split(":").map(Number);
    let hour = Number.isFinite(preferredHour) ? preferredHour : 9;
    const minute = Number.isFinite(preferredMinute) ? preferredMinute : 0;
    const makeTime = () => `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    let candidate = fromZonedInputValue(`${dayKey}T${makeTime()}`, settings.timezone);
    while (hour < 22 && (!candidate || taken.has(zonedDateTimeKey(candidate, settings.timezone)))) {
      hour += 1;
      candidate = fromZonedInputValue(`${dayKey}T${makeTime()}`, settings.timezone);
    }
    if (!candidate || taken.has(zonedDateTimeKey(candidate, settings.timezone))) continue;

    slots.push(candidate);
    taken.add(zonedDateTimeKey(candidate, settings.timezone));
    weekCounts.set(weekKey, (weekCounts.get(weekKey) ?? 0) + 1);
  }
  return slots;
}
function interleaveBoards(pins: PinterestPin[]): PinterestPin[] {
  const groups = new Map<string, PinterestPin[]>();
  for (const pin of pins) {
    const key = pin.board || "Sin tablero";
    groups.set(key, [...(groups.get(key) ?? []), pin]);
  }
  const keys = [...groups.keys()].sort((a, b) => (groups.get(a)?.length ?? 0) - (groups.get(b)?.length ?? 0));
  const result: PinterestPin[] = [];
  while (keys.some(key => (groups.get(key)?.length ?? 0) > 0)) {
    for (const key of keys) {
      const next = groups.get(key)?.shift();
      if (next) result.push(next);
    }
  }
  return result;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("schedule");
  const [pins, setPins] = useState<PinterestPin[]>(readPins);
  const [settings, setSettings] = useState<PlannerSettings>(readSettings);
  const [selectedDate, setSelectedDate] = useState(() => dateFromDateKey(zonedDateKey(new Date(), settings.timezone)));
  const [shownMonth, setShownMonth] = useState(() => startOfMonth(dateFromDateKey(zonedDateKey(new Date(), settings.timezone))));
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [searchText, setSearchText] = useState("");
  const [libraryFilter, setLibraryFilter] = useState<"all" | PinStatus>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PinForm>(EMPTY_FORM);
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiTone, setAiTone] = useState("Cálido y útil");
  const [manualPrompt, setManualPrompt] = useState("");
  const [pendingBackup, setPendingBackup] = useState<PinPilotBackup | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!savePins(pins)) {
      toast.error("No se pudo guardar. El almacenamiento del navegador podría estar lleno.");
    }
  }, [pins]);

  useEffect(() => {
    if (!saveSettings(settings)) toast.error("No se pudieron guardar tus preferencias.");
  }, [settings]);

  const todayKey = zonedDateKey(new Date(), settings.timezone);
  const todayDate = dateFromDateKey(todayKey);
  const scheduledPins = useMemo(
    () => pins.filter(pin => pin.status === "scheduled" && pin.scheduledAt),
    [pins],
  );
  const draftPins = useMemo(() => pins.filter(pin => pin.status === "draft"), [pins]);
  const publishedPins = useMemo(() => pins.filter(pin => pin.status === "published"), [pins]);
  const daysOfRunway = useMemo(() => {
    const dates = scheduledPins.map(pin => zonedDateKey(pin.scheduledAt!, settings.timezone)).sort();
    if (!dates.length) return 0;
    return Math.max(0, dateKeyDistance(zonedDateKey(new Date(), settings.timezone), dates[dates.length - 1]));
  }, [scheduledPins, settings.timezone]);

  const visibleDays = useMemo(() => {
    if (calendarView === "week") {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, index) => addDays(start, index));
    }
    const start = startOfWeek(startOfMonth(shownMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(shownMonth), { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    while (days.length < 42) days.push(addDays(days[days.length - 1], 1));
    return days;
  }, [calendarView, selectedDate, shownMonth]);

  const selectedPins = useMemo(
    () => pins
      .filter(pin => pin.scheduledAt && zonedDateKey(pin.scheduledAt, settings.timezone) === format(selectedDate, "yyyy-MM-dd"))
      .sort((a, b) => zonedTime(a.scheduledAt!, settings.timezone).localeCompare(zonedTime(b.scheduledAt!, settings.timezone))),
    [pins, selectedDate, settings.timezone],
  );

  const filteredPins = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase();
    return pins.filter(pin => {
      const matchesStatus = libraryFilter === "all" || pin.status === libraryFilter;
      const matchesQuery = !query || [pin.title, pin.description, pin.board, pin.link]
        .some(value => value.toLocaleLowerCase().includes(query));
      return matchesStatus && matchesQuery;
    });
  }, [pins, searchText, libraryFilter]);

  const setSetting = <K extends keyof PlannerSettings>(key: K, value: PlannerSettings[K]) => {
    setSettings(previous => ({ ...previous, [key]: value }));
  };

  const setTimezone = (timezone: string) => {
    setSetting("timezone", timezone);
    const nextToday = dateFromDateKey(zonedDateKey(new Date(), timezone));
    setSelectedDate(nextToday);
    setShownMonth(startOfMonth(nextToday));
  };

  const openNewPin = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, board: settings.boards[0] ?? "" });
    setAiKeywords("");
    setManualPrompt("");
    setEditorOpen(true);
    setIsMobileNavOpen(false);
  };

  const editPin = (pin: PinterestPin) => {
    setEditingId(pin.id);
    setForm({
      title: pin.title,
      description: pin.description,
      link: pin.link,
      board: pin.board,
      image: pin.image,
      scheduledAt: pin.scheduledAt,
      status: pin.status,
    });
    setAiKeywords("");
    setManualPrompt("");
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setManualPrompt("");
  };

  const handleSavePin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error("Agrega un título para guardar el pin.");
      return;
    }
    const nextStatus: PinStatus = form.status === "published"
      ? "published"
      : form.scheduledAt
        ? "scheduled"
        : "draft";
    if (editingId) {
      setPins(previous => previous.map(pin => pin.id === editingId
        ? { ...pin, ...form, title: form.title.trim(), status: nextStatus }
        : pin));
      toast.success("Pin actualizado.");
    } else {
      setPins(previous => [{
        id: newPinId(),
        ...form,
        title: form.title.trim(),
        status: nextStatus,
        exported: false,
      }, ...previous]);
      toast.success(nextStatus === "scheduled" ? "Pin añadido al calendario." : "Borrador guardado.");
    }
    closeEditor();
  };

  const markAsPublished = () => {
    if (!editingId) return;
    setForm(previous => ({ ...previous, status: "published" }));
    setPins(previous => previous.map(pin => pin.id === editingId
      ? { ...pin, status: "published" }
      : pin));
    toast.message("Marcado manualmente como publicado; PinPilot no lo publicó en Pinterest.");
  };

  const openChatGPT = () => {
    const prompt = [
      "Actúa como especialista en Pinterest y prepara contenido de pin en español latinoamericano.",
      "Si recibes un título o descripción existentes, reescríbelos y optimízalos; si solo recibes un tema, crea el contenido desde cero.",
      `Tema o título actual: ${form.title || form.description || "(escribe aquí el tema)"}`,
      `Descripción existente: ${form.description || "(sin descripción; redacta una)"}`,
      `Tablero: ${form.board || "por definir"}`,
      `Palabras clave: ${aiKeywords || "sugiérelas con naturalidad"}`,
      `Tono: ${aiTone}`,
      "Entrega exactamente: TÍTULO (máximo 100 caracteres), DESCRIPCIÓN (clara y atractiva, con palabras clave naturales) y LLAMADA A LA ACCIÓN. No inventes enlaces ni resultados garantizados.",
    ].join("\n");
    window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer");
    const showManualPrompt = () => {
      setManualPrompt(prompt);
      toast.message("No se pudo copiar. Selecciona el prompt visible para copiarlo manualmente.");
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(prompt)
        .then(() => {
          setManualPrompt("");
          toast.success("Prompt copiado. Pégalo en la conversación de ChatGPT que abriste.");
        })
        .catch(showManualPrompt);
    } else {
      showManualPrompt();
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const image = await compressImage(file);
      setForm(previous => ({ ...previous, image }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la imagen.");
    }
  };

  const changeDate = (date: Date) => {
    setSelectedDate(date);
    setShownMonth(startOfMonth(date));
  };

  const moveCalendar = (direction: -1 | 1) => {
    if (calendarView === "month") {
      setShownMonth(previous => direction === 1 ? addMonths(previous, 1) : subMonths(previous, 1));
    } else {
      const next = direction === 1 ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1);
      setSelectedDate(next);
      setShownMonth(startOfMonth(next));
    }
  };

  const handleDrop = (day: Date, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove("drop-active");
    const id = event.dataTransfer.getData("text/plain");
    const pin = pins.find(item => item.id === id);
    if (!pin) return;
    const time = pin.scheduledAt ? zonedTime(pin.scheduledAt, settings.timezone) : settings.publishTime;
    const target = dateValue(day, time, settings.timezone);
    if (!target) return;
    const conflict = pins.some(item => item.id !== id && item.status === "scheduled" && item.scheduledAt
      && zonedDateTimeKey(item.scheduledAt, settings.timezone) === zonedDateTimeKey(target, settings.timezone));
    setPins(previous => previous.map(item => item.id === id
      ? { ...item, scheduledAt: target, status: "scheduled" }
      : item));
    changeDate(day);
    toast[conflict ? "warning" : "success"](
      conflict ? "Se detectó otro pin a esa hora; revisa los horarios del día." : "Pin reprogramado.",
    );
  };

  const scheduleDrafts = (smart: boolean) => {
    const drafts = pins.filter(pin => pin.status === "draft");
    if (!drafts.length) {
      toast.message("No hay borradores sin fecha para programar.");
      return;
    }
    const ordered = smart ? interleaveBoards(drafts) : drafts;
    const slots = buildSlots(ordered.length, settings, pins);
    if (!slots.length) {
      toast.error("No encontramos horarios. Revisa los días habilitados en Ajustes.");
      return;
    }
    const boardList = settings.boards.length ? settings.boards : [];
    const updates = new Map(ordered.slice(0, slots.length).map((pin, index) => [
      pin.id,
      { scheduledAt: slots[index], board: boardList[index % Math.max(1, boardList.length)] || pin.board },
    ]));
    setPins(previous => previous.map(pin => {
      const update = updates.get(pin.id);
      return update ? { ...pin, ...update, status: "scheduled" } : pin;
    }));
    toast.success(`${updates.size} ${updates.size === 1 ? "pin programado" : "pines programados"}${smart ? " con mezcla inteligente" : " automáticamente"}.`);
  };

  const downloadCsv = (scheduledOnly = false) => {
    const rows = pins.filter(pin => pin.status !== "published" && (!scheduledOnly || pin.status === "scheduled"));
    if (!rows.length) {
      toast.message("No hay contenido para exportar con este filtro.");
      return;
    }
    const headers = ["Título", "Descripción", "Enlace", "Tablero", "Fecha", "Hora", "Imagen", "Estado"];
    const data = rows.map(pin => {
      const image = pin.image.startsWith("data:") ? "Imagen adjunta en PinPilot" : pin.image;
      return [
        pin.title,
        pin.description,
        pin.link,
        pin.board,
        pin.scheduledAt ? zonedDateKey(pin.scheduledAt, settings.timezone) : "",
        pin.scheduledAt ? zonedTime(pin.scheduledAt, settings.timezone) : "",
        image,
        statusText[pin.status],
      ];
    });
    const csv = [headers, ...data].map(row => row.map(value => escapeSpreadsheetCsvCell(String(value ?? ""))).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `pinpilot-pines-${todayKey}.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
    const exportedIds = new Set(rows.map(pin => pin.id));
    setPins(previous => previous.map(pin => exportedIds.has(pin.id) ? { ...pin, exported: true } : pin));
    toast.success(`CSV descargado con ${rows.length} ${rows.length === 1 ? "pin" : "pines"}.`);
  };

  const downloadFullBackup = () => {
    const backup = createPinPilotBackup(pins, settings);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `pinpilot-respaldo-${todayKey}.json`;
    anchor.click();
    URL.revokeObjectURL(href);
    toast.success(`Respaldo completo descargado: ${pins.length} ${pins.length === 1 ? "pin" : "pines"}, ajustes e imágenes locales.`);
  };

  const handleBackupFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("El respaldo supera el límite de 20 MB.");
      return;
    }
    try {
      setPendingBackup(parsePinPilotBackup(await file.text()));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo leer el respaldo.");
    }
  };

  const restoreBackup = (mode: "merge" | "replace") => {
    if (!pendingBackup) return;
    const currentIds = new Set(pins.map(pin => pin.id));
    const nextPins = mode === "replace"
      ? pendingBackup.pins
      : [...pins, ...pendingBackup.pins.filter(pin => !currentIds.has(pin.id))];
    if (!savePins(nextPins)) {
      toast.error("No se pudo restaurar: el almacenamiento del navegador está lleno. No se cambiaron los pines visibles.");
      return;
    }
    if (mode === "replace" && !saveSettings(pendingBackup.settings)) {
      savePins(pins);
      toast.error("No se pudieron guardar los ajustes. Se conservaron los datos actuales.");
      return;
    }
    setPins(nextPins);
    if (mode === "replace") {
      setSettings(pendingBackup.settings);
      const nextToday = dateFromDateKey(zonedDateKey(new Date(), pendingBackup.settings.timezone));
      setSelectedDate(nextToday);
      setShownMonth(startOfMonth(nextToday));
    }
    setPendingBackup(null);
    toast.success(mode === "replace" ? "Respaldo restaurado; pines y ajustes reemplazados." : "Respaldo combinado sin duplicar identificadores.");
  };

  const navItems: { id: Section; label: string; icon: typeof CalendarDays }[] = [
    { id: "schedule", label: "Calendario", icon: CalendarDays },
    { id: "library", label: "Biblioteca", icon: LibraryBig },
    { id: "export", label: "Exportar", icon: ArrowDownToLine },
    { id: "settings", label: "Ajustes", icon: Settings2 },
  ];

  const sectionTitle: Record<Section, string> = {
    schedule: "Tu contenido, a tiempo.",
    library: "Ideas listas para crecer.",
    export: "Lleva tus pines contigo.",
    settings: "Ajusta el ritmo a tu marca.",
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isMobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <AppMark />
          <div className="brand-name">pinpilot<span>.</span><small>STUDIO</small></div>
          <button className="icon-button sidebar-close" aria-label="Cerrar menú" onClick={() => setIsMobileNavOpen(false)}><X size={18} /></button>
        </div>
        <button className="workspace-switcher" onClick={() => setActiveSection("settings")}>
          <span className="workspace-avatar">{(settings.accountName.trim()[0] || "P").toUpperCase()}</span>
          <span className="workspace-copy"><b>{settings.accountName || "Mi cuenta"}</b><small>Planificador personal</small></span>
          <ChevronDown size={15} />
        </button>
        <div className="nav-label">ESPACIO DE TRABAJO</div>
        <nav className="side-nav" aria-label="Navegación principal">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                className={`nav-item ${activeSection === item.id ? "nav-item-active" : ""}`}
                key={item.id}
                onClick={() => { setActiveSection(item.id); setIsMobileNavOpen(false); }}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.id === "library" && draftPins.length > 0 && <span className="nav-count">{draftPins.length}</span>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="note-icon"><Sparkles size={16} /></span>
          <div><b>Ideas en movimiento</b><p>Tu calendario vive en este navegador.</p></div>
        </div>
        <div className="sidebar-footer">
          <span className="footer-avatar">P</span>
          <span><b>PinPilot</b><small>Asistente de contenido</small></span>
          <MoreHorizontal size={18} />
        </div>
      </aside>

      {isMobileNavOpen && <button className="mobile-scrim" aria-label="Cerrar menú" onClick={() => setIsMobileNavOpen(false)} />}

      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Abrir menú" onClick={() => setIsMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="topbar-context"><span>PinPilot</span><span className="crumb-divider">/</span><b>{navItems.find(item => item.id === activeSection)?.label}</b></div>
          <div className="topbar-actions">
            <span className="connection-pill"><span className="connection-dot" /> Pinterest no conectado</span>
            <button className="button button-primary button-top" onClick={openNewPin}><Plus size={16} /> Añadir pin</button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> TU ESTUDIO DE CONTENIDO</div>
              <h1>{sectionTitle[activeSection]}</h1>
              <p>{activeSection === "schedule" ? "Organiza, prepara y programa tus ideas para Pinterest desde un solo lugar." : activeSection === "library" ? "Tus borradores y pines programados, ordenados para volver a ellos." : activeSection === "export" ? "Descarga tu contenido y continúa el flujo donde ya trabajas." : "Define cuándo y cómo quieres compartir nuevas ideas."}</p>
            </div>
            <div className="heading-date"><CalendarDays size={16} /><span>{format(todayDate, "EEEE, d 'de' MMMM", { locale: es })}</span></div>
          </div>

          <section className="stats-grid" aria-label="Resumen del calendario">
            <div className="stat-card stat-yellow"><span className="stat-label">EN COLA</span><strong>{scheduledPins.length}</strong><small>pines programados</small><span className="stat-symbol"><CalendarDays size={17} /></span></div>
            <div className="stat-card"><span className="stat-label">DÍAS CUBIERTOS</span><strong>{daysOfRunway}</strong><small>de calendario por delante</small><span className="stat-symbol"><Clock3 size={17} /></span></div>
            <div className="stat-card stat-blue"><span className="stat-label">EN CSV</span><strong>{pins.filter(pin => pin.exported).length}</strong><small>incluidos en una exportación</small><span className="stat-symbol"><FileSpreadsheet size={17} /></span></div>
            <div className="stat-card"><span className="stat-label">PUBLICADOS</span><strong>{publishedPins.length}</strong><small>marcados manualmente</small><span className="stat-symbol"><CheckCircle2 size={17} /></span></div>
            <div className="stat-draft"><span><span className="draft-dot" /> Borradores sin fecha</span><strong>{draftPins.length}</strong><button onClick={() => setActiveSection("library")}>Ver biblioteca <ArrowRight size={13} /></button></div>
          </section>

          {activeSection === "schedule" && (
            <section className="workspace-section">
              <div className="section-toolbar">
                <div className="calendar-nav">
                  <button className="icon-button outline-icon" aria-label="Anterior" onClick={() => moveCalendar(-1)}><ArrowLeft size={16} /></button>
                  <button className="button button-today" onClick={() => { changeDate(todayDate); setCalendarView("month"); }}>Hoy</button>
                  <button className="icon-button outline-icon" aria-label="Siguiente" onClick={() => moveCalendar(1)}><ArrowRight size={16} /></button>
                  <h2>{calendarView === "month" ? monthLabel(shownMonth) : `Semana del ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "d MMM", { locale: es })}`}</h2>
                </div>
                <div className="toolbar-actions">
                  <div className="view-toggle" role="group" aria-label="Vista del calendario">
                    <button className={calendarView === "month" ? "view-active" : ""} onClick={() => setCalendarView("month")}>Mes</button>
                    <button className={calendarView === "week" ? "view-active" : ""} onClick={() => setCalendarView("week")}>Semana</button>
                  </div>
                  <button className="button button-secondary" onClick={() => scheduleDrafts(false)}><Sparkles size={15} /> <span>Programar borradores</span></button>
                  <button className="button button-shuffle" onClick={() => scheduleDrafts(true)}><Shuffle size={15} /> <span>Mezcla inteligente</span></button>
                </div>
              </div>

              <div className="schedule-layout">
                <div className={`calendar-card ${calendarView === "week" ? "calendar-week-view" : ""}`}>
                  <div className="weekday-row">
                    {WEEKDAYS.map(day => <span key={day.value}>{day.label}</span>)}
                  </div>
                  <div className="calendar-grid">
                    {visibleDays.map(day => {
                      const dayPins = pins.filter(pin => pin.status === "scheduled" && pin.scheduledAt && zonedDateKey(pin.scheduledAt, settings.timezone) === format(day, "yyyy-MM-dd"));
                      const inMonth = calendarView === "week" || isSameMonth(day, shownMonth);
                      return (
                        <div
                          key={day.toISOString()}
                          className={`day-cell ${!inMonth ? "day-outside" : ""} ${format(day, "yyyy-MM-dd") === todayKey ? "day-today" : ""} ${isSameDay(day, selectedDate) ? "day-selected" : ""}`}
                          onClick={() => changeDate(day)}
                          onDragOver={event => { event.preventDefault(); event.currentTarget.classList.add("drop-active"); }}
                          onDragLeave={event => event.currentTarget.classList.remove("drop-active")}
                          onDrop={event => handleDrop(day, event)}
                        >
                          <div className="day-topline">
                            <span className={`day-number ${format(day, "yyyy-MM-dd") === todayKey ? "today-number" : ""}`}>{format(day, "d")}</span>
                            {dayPins.length > 0 && <span className="day-count">{dayPins.length}</span>}
                          </div>
                          <div className="day-pins">
                            {dayPins.slice(0, calendarView === "week" ? 5 : 2).map(pin => (
                              <div
                                className={`calendar-pin ${pin.status === "published" ? "calendar-pin-published" : ""}`}
                                key={pin.id}
                                draggable
                                onDragStart={event => { event.dataTransfer.setData("text/plain", pin.id); event.dataTransfer.effectAllowed = "move"; }}
                                onClick={event => { event.stopPropagation(); editPin(pin); }}
                                title={`${pin.title} · ${dateCaption(pin.scheduledAt, settings.timezone)}`}
                              >
                                <span className="pin-time">{zonedTime(pin.scheduledAt!, settings.timezone)}</span>
                                <span className="calendar-pin-title">{pin.title || "Pin sin título"}</span>
                                <GripVertical className="drag-grip" size={12} />
                              </div>
                            ))}
                            {dayPins.length > (calendarView === "week" ? 5 : 2) && <span className="more-pins">+{dayPins.length - (calendarView === "week" ? 5 : 2)} más</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="calendar-legend"><span><i className="legend-scheduled" /> Programado</span><span><i className="legend-draft" /> Borrador en biblioteca</span><span className="drag-hint"><GripVertical size={13} /> Arrastra un pin para cambiar la fecha</span></div>
                </div>

                <aside className="day-panel">
                  <div className="day-panel-header">
                    <div><span className="eyebrow">DETALLE DEL DÍA</span><h3>{format(selectedDate, "EEEE", { locale: es })}<small>{format(selectedDate, "d 'de' MMMM", { locale: es })}</small></h3></div>
                    <button className="icon-button" aria-label="Añadir pin para este día" onClick={() => { setEditingId(null); setForm({ ...EMPTY_FORM, board: settings.boards[0] ?? "", scheduledAt: dateValue(selectedDate, settings.publishTime, settings.timezone) }); setEditorOpen(true); }}><Plus size={17} /></button>
                  </div>
                  <div className="day-panel-divider" />
                  {selectedPins.length ? (
                    <div className="day-pin-list">
                      {selectedPins.map(pin => (
                        <button className="day-pin-row" key={pin.id} onClick={() => editPin(pin)}>
                          <PinThumb pin={pin} compact />
                          <span className="day-pin-info"><b>{pin.title}</b><small><Clock3 size={12} /> {zonedTime(pin.scheduledAt!, settings.timezone)} · {pin.board || "Sin tablero"}</small></span>
                          <ArrowUpRight size={15} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-day"><span className="empty-calendar-icon"><CalendarDays size={22} /></span><b>No hay pines para este día.</b><p>Abre un borrador de la biblioteca y asígnale esta fecha, o programa borradores automáticamente.</p><button onClick={() => { setEditingId(null); setForm({ ...EMPTY_FORM, board: settings.boards[0] ?? "", scheduledAt: dateValue(selectedDate, settings.publishTime, settings.timezone) }); setEditorOpen(true); }}><Plus size={14} /> Añadir a este día</button></div>
                  )}
                  <div className="day-panel-footer"><span className="clock-chip"><Clock3 size={13} /> {settings.publishTime}</span><span>{settings.timezone.split("/").pop()?.replaceAll("_", " ")}</span></div>
                </aside>
              </div>

              <div className="integration-note"><span className="integration-icon"><Pin size={17} /></span><div><b>Planificación lista; publicación aún no conectada</b><p>Los cambios y horarios se guardan en este navegador. Para publicar directamente hará falta autorizar una integración oficial de Pinterest.</p></div><button onClick={() => setActiveSection("settings")}>Ver ajustes <ArrowRight size={14} /></button></div>
            </section>
          )}

          {activeSection === "library" && (
            <section className="library-section">
              <div className="library-toolbar">
                <div className="search-field"><Search size={17} /><input value={searchText} onChange={event => setSearchText(event.target.value)} placeholder="Buscar por título, tablero o palabra clave" aria-label="Buscar pines" /></div>
                <div className="filter-group"><Filter size={15} />
                  <select value={libraryFilter} onChange={event => setLibraryFilter(event.target.value as "all" | PinStatus)} aria-label="Filtrar por estado">
                    <option value="all">Todos los estados</option><option value="draft">Borradores</option><option value="scheduled">Programados</option><option value="published">Marcados como publicados</option>
                  </select>
                </div>
                <button className="button button-primary" onClick={openNewPin}><Plus size={16} /> Crear pin</button>
              </div>
              <div className="library-summary"><span><b>{filteredPins.length}</b> {filteredPins.length === 1 ? "pin" : "pines"} en la biblioteca</span><span><span className="legend-scheduled" /> {scheduledPins.length} programados <span className="summary-separator">·</span> <span className="legend-draft" /> {draftPins.length} borradores</span></div>
              {filteredPins.length ? (
                <div className="library-grid">
                  {filteredPins.map(pin => (
                    <article className="library-card" key={pin.id}>
                      <button className="library-image-button" onClick={() => editPin(pin)} aria-label={`Editar ${pin.title || "pin"}`}><PinThumb pin={pin} /><span className={`status-badge ${statusClass[pin.status]}`}>{statusText[pin.status]}</span></button>
                      <div className="library-card-body">
                        <div className="library-board"><span className="board-dot" /> {pin.board || "Sin tablero"}</div>
                        <button className="library-title" onClick={() => editPin(pin)}>{pin.title || "Pin sin título"}</button>
                        <p>{pin.description || "Agrega una descripción atractiva a este pin."}</p>
                        <div className="library-card-footer"><span><Clock3 size={13} /> {dateCaption(pin.scheduledAt, settings.timezone)}</span><button onClick={() => editPin(pin)}><Pencil size={14} /> Editar</button></div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="large-empty"><span><LibraryBig size={24} /></span><h3>No encontramos pines</h3><p>Prueba otra búsqueda o crea un borrador para empezar.</p><button className="button button-primary" onClick={openNewPin}><Plus size={15} /> Crear pin</button></div>
              )}
            </section>
          )}

          {activeSection === "export" && (
            <section className="export-section">
              <div className="export-intro-card"><div className="export-illustration"><FileSpreadsheet size={32} /><span>CSV</span></div><div className="export-copy"><span className="eyebrow">EXPORTAR CONTENIDO</span><h2>Un archivo, todo listo.</h2><p>Descarga un CSV con títulos, descripciones, enlaces, tableros y horarios. Puedes conservarlo, revisarlo o llevarlo a tu flujo de trabajo.</p></div><div className="export-actions"><button className="button button-primary" onClick={() => downloadCsv(false)}><Download size={16} /> Exportar borradores y programados</button><button className="text-button" onClick={() => downloadCsv(true)}>Solo pines programados <ArrowRight size={14} /></button></div></div>
              <div className="backup-card">
                <div className="backup-card-heading"><span className="small-card-icon"><Download size={17} /></span><div><b>Respaldo completo para migrar</b><p>El JSON conserva pines, horarios, ajustes e imágenes subidas; el CSV no incluye los bytes de las imágenes locales.</p></div></div>
                <div className="backup-actions"><button className="button button-primary" onClick={downloadFullBackup}><Download size={15} /> Descargar respaldo completo</button><label className="button button-secondary upload-button backup-upload"><Upload size={15} /> Importar respaldo JSON<input type="file" accept=".json,application/json" onChange={handleBackupFileUpload} /></label></div>
                <small className="backup-privacy">Guarda el JSON en un lugar privado: puede contener imágenes y contenido de tus pines.</small>
              </div>
              <div className="export-lower-grid"><div className="export-info-card"><span className="small-card-icon"><FileSpreadsheet size={17} /></span><div><b>Campos incluidos</b><p>Título, descripción, enlace, tablero, fecha, hora, referencia de imagen y estado. Las imágenes subidas se exportan por separado.</p></div></div><div className="export-info-card"><span className="small-card-icon"><CheckCircle2 size={17} /></span><div><b>Privado en tu navegador</b><p>Tus borradores permanecen en este navegador. Al usar ChatGPT se copia un prompt al portapapeles; tú decides cuándo pegarlo en tu cuenta.</p></div></div></div>
              <div className="export-warning"><span><ExternalLink size={16} /></span><p><b>Importante:</b> este CSV no publica los pines en Pinterest por sí solo. La publicación automática requiere una integración autorizada con Pinterest.</p></div>
              <div className="export-table-card"><div className="subsection-heading"><div><h3>Vista previa</h3><p>Contenido que se incluirá en la descarga</p></div><span className="table-count">{pins.filter(pin => pin.status !== "published").length} filas</span></div><div className="table-scroll"><table><thead><tr><th>Pin</th><th>Tablero</th><th>Fecha prevista</th><th>Estado</th></tr></thead><tbody>{pins.filter(pin => pin.status !== "published").slice(0, 8).map(pin => <tr key={pin.id}><td><span className="table-pin"><PinThumb pin={pin} compact /><b>{pin.title || "Pin sin título"}</b></span></td><td>{pin.board || "—"}</td><td>{dateCaption(pin.scheduledAt, settings.timezone)}</td><td><span className={`status-badge ${statusClass[pin.status]}`}>{statusText[pin.status]}</span></td></tr>)}</tbody></table></div></div>
            </section>
          )}

          {activeSection === "settings" && (
            <section className="settings-section">
              <div className="settings-main-card"><div className="subsection-heading"><div><h2>Preferencias de programación</h2><p>Define un ritmo para distribuir tus ideas automáticamente.</p></div><span className="settings-heading-icon"><Settings2 size={18} /></span></div>
                <div className="settings-field"><div className="settings-label"><b>Frecuencia</b><small>Máximo de pines por semana</small></div><div className="stepper"><button aria-label="Restar frecuencia" onClick={() => setSetting("postsPerWeek", Math.max(1, settings.postsPerWeek - 1))}>−</button><strong>{settings.postsPerWeek}</strong><span>por semana</span><button aria-label="Aumentar frecuencia" onClick={() => setSetting("postsPerWeek", Math.min(7, settings.postsPerWeek + 1))}>+</button></div></div>
                <div className="settings-field"><div className="settings-label"><b>Días preferidos</b><small>Elige los días en que quieres publicar</small></div><div className="weekday-select">{WEEKDAYS.map(day => <button key={day.value} className={settings.daysOfWeek.includes(day.value) ? "weekday-active" : ""} onClick={() => setSetting("daysOfWeek", settings.daysOfWeek.includes(day.value) ? settings.daysOfWeek.filter(value => value !== day.value) : [...settings.daysOfWeek, day.value])}>{day.label}</button>)}</div></div>
                <div className="settings-two-col"><label className="settings-field settings-field-stacked"><span className="settings-label"><b>Hora sugerida</b><small>Hora local de tu cuenta</small></span><span className="input-with-icon"><Clock3 size={15} /><input type="time" value={settings.publishTime} onChange={event => setSetting("publishTime", event.target.value)} /></span></label><label className="settings-field settings-field-stacked"><span className="settings-label"><b>Zona horaria</b><small>Para mostrar y exportar horarios</small></span><select className="form-select" value={settings.timezone} onChange={event => setTimezone(event.target.value)}>{TIMEZONES.map(zone => <option key={zone.value} value={zone.value}>{zone.label}</option>)}</select></label></div>
                <label className="settings-field settings-field-stacked"><span className="settings-label"><b>Tableros</b><small>Separa los nombres con comas; se alternan al programar automáticamente.</small></span><input className="form-input" value={settings.boards.join(", ")} onChange={event => setSetting("boards", [...new Set(event.target.value.split(",").map(value => value.trim()).filter(Boolean))])} placeholder="Ideas para desayunos, Hogar cálido" /></label>
              </div>
              <div className="settings-side-column"><div className="settings-side-card"><div className="integration-head"><span className="pinterest-mark"><Pin size={18} /></span><span className="integration-status">Desconectado</span></div><h3>Cuenta de Pinterest</h3><p>La aplicación puede organizar fechas y exportar contenido. Para publicar directamente, hace falta una integración oficial y autorización de la cuenta.</p><button className="button button-outline-wide" disabled><Link2 size={15} /> Conexión no configurada</button><small className="disabled-explainer">No se ha vinculado una cuenta de Pinterest.</small></div><div className="settings-side-card account-card"><span className="eyebrow">ESPACIO DE TRABAJO</span><label className="settings-field settings-field-stacked"><span className="settings-label"><b>Nombre de la cuenta</b></span><input className="form-input" value={settings.accountName} onChange={event => setSetting("accountName", event.target.value)} /></label><div className="local-storage-note"><Check size={14} /> Preferencias guardadas en este navegador</div></div></div>
            </section>
          )}

          <footer className="page-footer"><span><AppMark /> Planifica con intención.</span><span>PinPilot · Vista previa de producto</span></footer>
        </div>
      </main>

      {pendingBackup && (
        <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPendingBackup(null); }}>
          <section className="pin-editor backup-dialog" role="dialog" aria-modal="true" aria-labelledby="backup-dialog-title">
            <div className="editor-header"><div><span className="eyebrow">RESTAURACIÓN SEGURA</span><h2 id="backup-dialog-title">¿Cómo quieres importar?</h2></div><button className="icon-button" aria-label="Cerrar" onClick={() => setPendingBackup(null)}><X size={19} /></button></div>
            <div className="backup-dialog-body"><p>El archivo contiene <b>{pendingBackup.pins.length} pines</b>, incluyendo {pendingBackup.pins.filter(pin => pin.status === "scheduled" && pin.scheduledAt).length} programados y sus imágenes locales.</p><p>Hay {pendingBackup.pins.filter(pin => pins.some(current => current.id === pin.id)).length} identificadores que ya existen en este navegador.</p><p className="backup-dialog-warning">Antes de reemplazar datos, descarga un respaldo de lo que tienes ahora. La combinación conserva tus ajustes actuales y no duplica IDs; reemplazar importa los pines y ajustes del archivo.</p></div>
            <div className="editor-footer backup-footer"><button className="button button-ghost" onClick={() => setPendingBackup(null)}>Cancelar</button><button className="button button-secondary" onClick={() => restoreBackup("merge")}>Combinar sin duplicar</button><button className="button button-primary" onClick={() => restoreBackup("replace")}>Reemplazar todo</button></div>
          </section>
        </div>
      )}

      {editorOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeEditor(); }}>
          <section className="pin-editor" role="dialog" aria-modal="true" aria-labelledby="pin-editor-title">
            <div className="editor-header"><div><span className="eyebrow">{editingId ? "ACTUALIZAR CONTENIDO" : "NUEVA IDEA"}</span><h2 id="pin-editor-title">{editingId ? "Edita tu pin" : "Crea un pin"}</h2></div><button className="icon-button" aria-label="Cerrar" onClick={closeEditor}><X size={19} /></button></div>
            <form onSubmit={handleSavePin}>
              <label className="form-label">Título <span>Obligatorio</span><input className="form-input" autoFocus value={form.title} onChange={event => setForm(previous => ({ ...previous, title: event.target.value }))} placeholder="Una idea clara y atractiva" maxLength={100} required /></label>
              <div className="ai-helper-panel"><div className="ai-helper-heading"><span className="ai-spark"><Sparkles size={16} /></span><div><b>Trabaja con ChatGPT</b><small>Prepara el prompt aquí; redacta y revisa desde tu cuenta.</small></div><span className="ai-powered">CHATGPT</span></div><div className="ai-fields"><input className="form-input ai-keywords" value={aiKeywords} onChange={event => setAiKeywords(event.target.value)} placeholder="Palabras clave (opcional)" /><select className="form-select ai-tone" value={aiTone} onChange={event => setAiTone(event.target.value)}><option>Cálido y útil</option><option>Inspirador</option><option>Directo y experto</option><option>Divertido</option></select></div><div className="ai-actions"><button className="button button-ai" type="button" onClick={openChatGPT}><ExternalLink size={14} /> Copiar prompt y abrir ChatGPT</button></div>{manualPrompt && <div className="chat-prompt-fallback"><small>No se pudo copiar automáticamente. Selecciona el texto para copiarlo y pegarlo en ChatGPT.</small><textarea className="form-textarea" rows={6} readOnly value={manualPrompt} aria-label="Prompt de ChatGPT para copiar manualmente" onFocus={event => event.currentTarget.select()} /></div>}<small className="ai-privacy">Se copia solo el prompt. Tras generarlo en ChatGPT, copia la respuesta y pégala aquí en los campos de título y descripción.</small></div>
              <label className="form-label">Descripción<textarea className="form-textarea" rows={4} value={form.description} onChange={event => setForm(previous => ({ ...previous, description: event.target.value }))} placeholder="Explica el valor de la idea e invita a guardar el pin." maxLength={800} /></label>
              <div className="form-two-col"><label className="form-label">Tablero<select className="form-select" value={form.board} onChange={event => setForm(previous => ({ ...previous, board: event.target.value }))}><option value="">Selecciona o escribe uno</option>{[...new Set([...settings.boards, form.board].filter(Boolean))].map(board => <option key={board} value={board}>{board}</option>)}</select><input className="form-input board-inline-input" value={form.board} onChange={event => setForm(previous => ({ ...previous, board: event.target.value }))} placeholder="O escribe un tablero" /></label><label className="form-label">Enlace destino<input className="form-input" type="url" value={form.link} onChange={event => setForm(previous => ({ ...previous, link: event.target.value }))} placeholder="https://tusitio.com/idea" /></label></div>
              <label className="form-label">Fecha y hora <span>Opcional</span><input className="form-input" type="datetime-local" value={toZonedInputValue(form.scheduledAt, settings.timezone)} onChange={event => setForm(previous => ({ ...previous, scheduledAt: fromZonedInputValue(event.target.value, settings.timezone), status: event.target.value ? "scheduled" : "draft" }))} /></label>
              <div className="image-field"><div><b>Imagen del pin</b><small>Una imagen vertical funciona mejor en Pinterest.</small></div><label className="upload-button"><Upload size={15} /> {form.image ? "Cambiar imagen" : "Subir imagen"}<input type="file" accept="image/*" onChange={handleImageUpload} /></label></div>
              {form.image && <div className="image-preview"><img src={form.image} alt="Vista previa del pin" /><button type="button" className="remove-image" onClick={() => setForm(previous => ({ ...previous, image: "" }))}><X size={14} /> Quitar</button></div>}
              <div className="editor-footer"><div>{editingId && form.status !== "published" && <button type="button" className="text-button mark-published" onClick={markAsPublished}><CheckCircle2 size={14} /> Marcar como publicado</button>}{editingId && form.status === "published" && <span className="manual-published"><CheckCircle2 size={14} /> Marcado manualmente</span>}</div><div className="editor-footer-actions"><button type="button" className="button button-ghost" onClick={closeEditor}>Cancelar</button><button type="submit" className="button button-primary"><Check size={15} /> Guardar pin</button></div></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
