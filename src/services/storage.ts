import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Note } from '../types/Note';

const NOTES_INDEX_KEY = 'notes.index';
const NOTE_PREFIX = 'note.';
const THEME_MODE_KEY = 'theme.mode';

function noteKey(id: string): string {
  return `${NOTE_PREFIX}${id}`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// --- Note index (ordered list of note IDs) ---

export async function loadNoteIndex(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(NOTES_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveNoteIndex(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(NOTES_INDEX_KEY, JSON.stringify(ids));
}

// --- Individual notes ---

export async function loadNote(id: string): Promise<Note | null> {
  const raw = await AsyncStorage.getItem(noteKey(id));

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loadAllNotes(): Promise<Note[]> {
  const ids = await loadNoteIndex();

  if (ids.length === 0) return [];

  const notes = await Promise.all(ids.map(id => loadNote(id)));

  return notes.filter((note): note is Note => note !== null);
}

export async function saveNoteContent(
  id: string,
  content: string,
): Promise<void> {
  const existing = await loadNote(id);

  if (!existing) return;

  const updated: Note = {
    ...existing,
    content,
    updatedAt: Date.now(),
  };

  await AsyncStorage.setItem(noteKey(id), JSON.stringify(updated));
}

export async function createNote(): Promise<Note> {
  const id = generateId();
  const now = Date.now();
  const note: Note = {
    id,
    content: '',
    color: null,
    createdAt: now,
    updatedAt: now,
  };
  const ids = await loadNoteIndex();
  ids.push(id);

  await AsyncStorage.setItem(noteKey(id), JSON.stringify(note));
  await saveNoteIndex(ids);

  return note;
}

export async function deleteNote(id: string): Promise<void> {
  const ids = await loadNoteIndex();
  const filtered = ids.filter(i => i !== id);

  await AsyncStorage.removeItem(noteKey(id));
  await saveNoteIndex(filtered);
}

export async function clearNoteContent(id: string): Promise<void> {
  await saveNoteContent(id, '');
}

export async function saveNoteColor(
  id: string,
  color: string | null,
): Promise<void> {
  const existing = await loadNote(id);

  if (!existing) return;

  const updated: Note = {
    ...existing,
    color,
    updatedAt: Date.now(),
  };

  await AsyncStorage.setItem(noteKey(id), JSON.stringify(updated));
}

// --- UI preferences ---

export async function loadThemeMode(): Promise<'light' | 'dark' | null> {
  const raw = await AsyncStorage.getItem(THEME_MODE_KEY);

  if (raw === 'light' || raw === 'dark') return raw;

  return null;
}

export async function saveThemeMode(mode: 'light' | 'dark'): Promise<void> {
  await AsyncStorage.setItem(THEME_MODE_KEY, mode);
}

// --- Migration: move old single-note data to multi-note ---

export async function migrateIfNeeded(): Promise<void> {
  const OLD_KEY = 'scratch.content';
  const ids = await loadNoteIndex();

  if (ids.length > 0) return; // already migrated

  const oldContent = await AsyncStorage.getItem(OLD_KEY);
  const note = await createNote();

  if (oldContent) {
    await saveNoteContent(note.id, oldContent);
    await AsyncStorage.removeItem(OLD_KEY);
  }
}
