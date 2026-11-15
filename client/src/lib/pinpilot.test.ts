import { describe, expect, it } from "vitest";
import {
  createPinPilotBackup,
  DEFAULT_SETTINGS,
  fromZonedInputValue,
  editorial2026Pins,
  mergeEditorial2026Pins,
  migrateToRealEditorialPins,
  parsePinPilotBackup,
  type PinterestPin,
} from "./pinpilot";

const samplePin: PinterestPin = {
  id: "pin-1",
  title: "Ideas de temporada",
  description: "Una descripción breve.",
  link: "https://example.com/ideas",
  board: "Ideas",
  image: "data:image/jpeg;base64,/9j/AA==",
  scheduledAt: "2026-12-01T15:00:00.000Z",
  status: "scheduled",
  exported: false,
};

describe("PinPilot JSON backup", () => {
  it("round-trips schedules, settings, and local image data", () => {
    const backup = createPinPilotBackup(
      [samplePin],
      { ...DEFAULT_SETTINGS, timezone: "America/New_York", boards: ["Ideas"], daysOfWeek: [1, 3] },
      "2026-11-15T12:00:00.000Z",
    );

    expect(parsePinPilotBackup(JSON.stringify(backup))).toEqual(backup);
  });

  it("rejects unsupported formats and invalid time zones", () => {
    expect(() => parsePinPilotBackup("{}")).toThrow(/no es un respaldo/i);
    const backup = createPinPilotBackup([samplePin], { ...DEFAULT_SETTINGS, timezone: "Not/AZone" });
    expect(() => parsePinPilotBackup(JSON.stringify(backup))).toThrow(/zona horaria/i);
  });

  it("rejects executable image schemes and repeated IDs", () => {
    const unsafeImage = createPinPilotBackup([{ ...samplePin, image: "javascript:alert(1)" }], DEFAULT_SETTINGS);
    expect(() => parsePinPilotBackup(JSON.stringify(unsafeImage))).toThrow(/campos inválidos/i);

    const duplicateIds = createPinPilotBackup([samplePin, samplePin], DEFAULT_SETTINGS);
    expect(() => parsePinPilotBackup(JSON.stringify(duplicateIds))).toThrow(/identificadores.*repetidos/i);
  });
});

describe("US timezone conversion", () => {
  it("uses Florida Eastern time for new planners", () => {
    expect(DEFAULT_SETTINGS.timezone).toBe("America/New_York");
  });

  it.each([
    ["America/New_York", "2026-01-15T09:00", "2026-01-15T14:00:00.000Z"],
    ["America/New_York", "2026-07-15T09:00", "2026-07-15T13:00:00.000Z"],
    ["America/Chicago", "2026-01-15T09:00", "2026-01-15T15:00:00.000Z"],
    ["America/Chicago", "2026-07-15T09:00", "2026-07-15T14:00:00.000Z"],
  ])("preserves 09:00 local in %s at %s", (timezone, local, expected) => {
    expect(fromZonedInputValue(local, timezone)).toBe(expected);
  });
});

describe("The Launch Era editorial, without mixing brands or fake schedules", () => {
  it("uses real Notion editorial sources as unscheduled drafts", () => {
    const pins = editorial2026Pins();
    expect(pins).toHaveLength(7);
    expect(new Set(pins.map(pin => pin.id)).size).toBe(7);
    expect(pins.every(pin => pin.scheduledAt === null && pin.status === "draft")).toBe(true);
    expect(pins.some(pin => pin.title.includes("What could your website look like?"))).toBe(true);
    expect(pins.some(pin => pin.title.includes("Admin Panel"))).toBe(true);
    expect(pins.some(pin => pin.link.includes("content-lab/prompts/"))).toBe(true);
    expect(pins.every(pin => !/cleaning|class|clase|block jam/i.test(pin.title))).toBe(true);
  });

  it("does not duplicate content or overwrite existing user-created pins", () => {
    const first = mergeEditorial2026Pins([samplePin]);
    const again = mergeEditorial2026Pins(first.pins);
    expect(first.added).toBe(7);
    expect(first.pins[0]).toEqual(samplePin);
    expect(again.added).toBe(0);
    expect(again.pins).toEqual(first.pins);
  });

  it("removes only obsolete examples and the three speculative old pins", () => {
    const old: PinterestPin[] = [
      { ...samplePin, id: "demo-breakfast" },
      { ...samplePin, id: "tle-pin-2026-11-16-freebie-photo-ideas" },
      { ...samplePin, id: "pin-user-created", title: "My own business pin" },
    ];
    const migrated = migrateToRealEditorialPins(old);
    expect(migrated.removed).toBe(2);
    expect(migrated.pins.some(pin => pin.id === "pin-user-created")).toBe(true);
    expect(migrated.pins.some(pin => pin.id === "demo-breakfast")).toBe(false);
  });
});
