import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  type GestureResponderEvent,
  useColorScheme,
} from 'react-native';
import debounce from 'lodash.debounce';
import { UnistylesRuntime } from 'react-native-unistyles';
import type { ThemeMode } from '../../constants/theme';
import type { Note } from '../../types/Note';
import {
  clearNoteContent,
  createNote,
  deleteNote,
  loadAllNotes,
  loadThemeMode,
  migrateIfNeeded,
  saveNoteContent,
  saveThemeMode,
} from '../../services/storage';
import { getNoteTitle } from './utils';

interface MenuItem {
  name: string;
  onClick: () => void;
}

function isRightClick(e: GestureResponderEvent) {
  return (e.nativeEvent as { button?: number }).button === 2;
}

function showContextualMenu(menuItems: MenuItem[], anchor?: number) {
  const cancelIndex = menuItems.length;
  const destructiveIndex = menuItems.findIndex(
    (item) => item.name === 'Delete',
  );

  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: [...menuItems.map((item) => item.name), 'Cancel'],
      cancelButtonIndex: cancelIndex,
      destructiveButtonIndex:
        destructiveIndex >= 0 ? destructiveIndex : undefined,
      anchor,
    },
    (buttonIndex) => {
      if (buttonIndex === cancelIndex || buttonIndex == null) {
        return;
      }
      menuItems[buttonIndex]?.onClick();
    },
  );
}

export default function useScratchPadState() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const systemColorScheme = useColorScheme();
  const activeNoteId = selectedNoteId ?? notes[0]?.id ?? null;
  const scheduleSaveNoteContent = useMemo(
    () =>
      debounce((noteId: string, content: string) => {
        saveNoteContent(noteId, content).catch(() => undefined);
      }, 250),
    [],
  );

  const cancelPendingSave = useCallback(
    () => scheduleSaveNoteContent.cancel(),
    [scheduleSaveNoteContent],
  );

  const flushPendingSave = useCallback(
    () => scheduleSaveNoteContent.flush(),
    [scheduleSaveNoteContent],
  );

  useEffect(() => {
    const loadNotes = async () => {
      await migrateIfNeeded();
      const loaded = await loadAllNotes();
      if (loaded.length > 0) {
        setNotes(loaded);
        setSelectedNoteId(loaded[0].id);

        return;
      }

      const firstNote = await createNote();
      setNotes([firstNote]);
      setSelectedNoteId(firstNote.id);
    };
    loadNotes();
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await loadThemeMode();
      const resolvedTheme: ThemeMode =
        savedTheme ?? (systemColorScheme === 'dark' ? 'dark' : 'light');
      setThemeMode(resolvedTheme);
      UnistylesRuntime.setTheme(resolvedTheme);
    };
    loadTheme();
  }, [systemColorScheme]);

  const handleChangeText = useCallback(
    (value: string) => {
      if (!activeNoteId) return;

      setNotes((prev) =>
        prev.map((note: Note) =>
          note.id === activeNoteId
            ? { ...note, content: value, updatedAt: Date.now() }
            : note,
        ),
      );
      scheduleSaveNoteContent(activeNoteId, value);
    },
    [activeNoteId, scheduleSaveNoteContent],
  );

  const handleClear = useCallback(
    (noteId?: string) => {
      const noteIdToClear = noteId ?? activeNoteId;
      if (!noteIdToClear) return;

      Alert.alert('Clear this note?', 'Everything will be erased.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            cancelPendingSave();
            setNotes((prev) =>
              prev.map((note) =>
                note.id === noteIdToClear ? { ...note, content: '' } : note,
              ),
            );
            clearNoteContent(noteIdToClear);
          },
        },
      ]);
    },
    [activeNoteId, cancelPendingSave],
  );

  const handleDelete = useCallback(
    (noteId?: string) => {
      const noteIdToDelete = noteId ?? activeNoteId;

      if (!noteIdToDelete) return;

      const noteTitle = getNoteTitle(
        notes.find((note) => note.id === noteIdToDelete) ?? {
          content: '',
          id: '',
          createdAt: 0,
          updatedAt: 0,
        },
        notes.findIndex((note) => note.id === noteIdToDelete) ?? 0,
      );

      Alert.alert(
        `Delete ${noteTitle}?`,
        'This note will be permanently deleted.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              cancelPendingSave();

              if (notes.length <= 1) {
                await deleteNote(noteIdToDelete);
                const replacement = await createNote();
                setNotes([replacement]);
                setSelectedNoteId(replacement.id);

                return;
              }

              const remaining = notes.filter(
                (note) => note.id !== noteIdToDelete,
              );
              const deletedSelected = selectedNoteId === noteIdToDelete;
              const currentIndex = notes.findIndex(
                (note) => note.id === noteIdToDelete,
              );
              const fallbackIndex = Math.min(
                currentIndex,
                remaining.length - 1,
              );
              const fallbackSelection = remaining[Math.max(0, fallbackIndex)];

              setNotes(remaining);
              setSelectedNoteId((current) => {
                if (deletedSelected) {
                  return fallbackSelection?.id ?? null;
                }

                if (current && remaining.some((note) => note.id === current)) {
                  return current;
                }

                return fallbackSelection?.id ?? null;
              });

              await deleteNote(noteIdToDelete);
            },
          },
        ],
      );
    },
    [activeNoteId, cancelPendingSave, notes, selectedNoteId],
  );

  const handleAddNote = useCallback(async () => {
    const note = await createNote();
    setNotes((prev) => [...prev, note]);
    setSelectedNoteId(note.id);
  }, []);

  const handleToggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    UnistylesRuntime.setTheme(nextTheme);
    saveThemeMode(nextTheme);
  }, [themeMode]);

  const handleSelectNote = useCallback((noteId: string) => {
    setSelectedNoteId(noteId);
  }, []);

  const handleNotePressIn = useCallback(
    (noteId: string, event: GestureResponderEvent) => {
      if (isRightClick(event)) {
        setSelectedNoteId(noteId);
        const anchor =
          typeof event.nativeEvent.target === 'number'
            ? event.nativeEvent.target
            : undefined;

        showContextualMenu(
          [
            { name: 'Delete', onClick: () => handleDelete(noteId) },
            { name: 'Clear', onClick: () => handleClear(noteId) },
          ],
          anchor,
        );
      }
    },
    [handleDelete, handleClear],
  );

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId) ?? null,
    [notes, activeNoteId],
  );

  const toggleSidebar = useCallback(
    () => setIsSidebarCollapsed((prev) => !prev),
    [],
  );

  useEffect(() => {
    return () => {
      flushPendingSave();
    };
  }, [flushPendingSave]);

  return {
    notes,
    selectedNote,
    themeMode,
    isSidebarCollapsed,
    toggleSidebar,
    handleDelete,
    handleClear,
    handleToggleTheme,
    handleSelectNote,
    handleAddNote,
    handleNotePressIn,
    handleChangeText,
  };
}
