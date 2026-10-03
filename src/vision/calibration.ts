import type { AimOffset } from "./core/aim";

export interface StoredCalibration {
  offset: AimOffset;
  spread: number;
  samples: number;
  at: number;
}

const KEY = "cue.vision.calibration.v1";

function readAll(): Record<string, StoredCalibration> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, StoredCalibration>;
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, StoredCalibration>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    return;
  }
}

export function loadCalibration(key: string): StoredCalibration | null {
  return readAll()[key] ?? null;
}

export function saveCalibration(key: string, cal: StoredCalibration): void {
  writeAll({ ...readAll(), [key]: cal });
}

export function clearCalibration(key: string): void {
  const all = readAll();
  delete all[key];
  writeAll(all);
}

export function allCalibrations(): Record<string, StoredCalibration> {
  return readAll();
}
