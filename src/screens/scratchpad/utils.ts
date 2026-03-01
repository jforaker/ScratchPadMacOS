import type { Note } from '../../types/Note';

export function getNoteTitle(note: Note, index: number): string {
  const withoutLeadingWhitespace = note.content.replace(/^\s+/, '');

  if (withoutLeadingWhitespace.length === 0) {
    return `note #${index + 1}`;
  }

  return withoutLeadingWhitespace.slice(0, 20);
}
