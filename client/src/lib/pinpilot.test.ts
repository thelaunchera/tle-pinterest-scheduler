import { describe, expect, it } from "vitest";
import {
  createPinPilotBackup,
  DEFAULT_SETTINGS,
  fromZonedInputValue,
  november2026CampaignPins,
  mergeNovember2026CampaignPins,
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

describe("November 2026 Pinterest campaign", () => {
  it("includes 3 pins at 10 AM Florida with real destination links", () => {
    const pins = november2026CampaignPins();
    expect(pins).toHaveLength(3);
    expect(pins.map(pin => pin.scheduledAt)).toEqual([
      "2026-11-16T15:00:00.000Z",
      "2026-11-18T15:00:00.000Z",
      "2026-11-20T15:00:00.000Z",
    ]);
    expect(pins.every(pin => pin.image.includes("pinpilot-campaign/2026-11/"))).toBe(true);
    expect(pins.every(pin => pin.link.startsWith("https://"))).toBe(true);
  });

  it("merges without overwriting existing pins or duplicating the campaign", () => {
    const first = mergeNovember2026CampaignPins([samplePin]);
    const repeated = mergeNovember2026CampaignPins(first.pins);
    expect(first.added).toBe(3);
    expect(first.pins[0]).toEqual(samplePin);
    expect(repeated.added).toBe(0);
    expect(repeated.pins).toEqual(first.pins);
  });
});
