import { TUNINGS } from '../audio/tunings.ts';
export const NATURAL_NOTES = [60, 62, 64, 65, 67, 69, 71];
export const ALL_NOTES = Array.from({ length: 12 }, (_, i) => 60 + i);
export type NoteSelection = { notes: number[]; sharps: boolean; flats?: boolean };
export const DEFAULT_SELECTION: NoteSelection = { notes: NATURAL_NOTES, sharps: false };
export function readSelection(value: unknown): NoteSelection | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.notes)) return null;
  if (typeof v.sharps === 'boolean') {
    if (v.flats !== undefined && typeof v.flats !== 'boolean') return null;
    const allowed = v.sharps || v.flats ? ALL_NOTES : NATURAL_NOTES;
    return v.notes.length <= 12 && v.notes.every(n => allowed.includes(n)) && new Set(v.notes).size === v.notes.length
      ? { notes: v.notes, sharps: v.sharps, ...(v.flats !== undefined ? { flats: v.flats as boolean } : {}) } : null;
  }
  const tuning = TUNINGS.find(t => t.id === v.tuning);
  if (!tuning || v.notes.length > 6 || !v.notes.every(n => tuning.notes.includes(n))) return null;
  const notes = [...new Set(v.notes.map(n => 60 + n % 12))];
  return { notes, sharps: notes.some(n => !NATURAL_NOTES.includes(n)) };
}
export function toggleSharps(selection: NoteSelection, sharps: boolean): NoteSelection {
  return toggleAccidentals(selection, 'sharps', sharps);
}

export function toggleAccidentals(selection: NoteSelection, kind: 'sharps' | 'flats', enabled: boolean): NoteSelection {
  const next = { ...selection, [kind]: enabled };
  return { ...next, notes: next.sharps || next.flats ? next.notes : next.notes.filter(n => NATURAL_NOTES.includes(n)) };
}
const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
export function selectedNoteName(midi: number, selection: Pick<NoteSelection, 'sharps' | 'flats'>): string {
  const pc = ((midi % 12) + 12) % 12;
  if (!selection.flats || SHARP_NAMES[pc] === FLAT_NAMES[pc]) return SHARP_NAMES[pc];
  return selection.sharps ? `${SHARP_NAMES[pc]} / ${FLAT_NAMES[pc]}` : FLAT_NAMES[pc];
}
