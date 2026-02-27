import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  type GestureResponderEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {
  createStyleSheet,
  UnistylesRuntime,
  useStyles,
} from 'react-native-unistyles';
import NativeScratchEditor from '../components/NativeScratchEditor';
import type { ThemeMode } from '../constants/theme';
import type { Note } from '../types/Note';
import {
  clearNoteContent,
  createNote,
  deleteNote,
  loadAllNotes,
  loadThemeMode,
  migrateIfNeeded,
  saveNoteColor,
  saveNoteContent,
  saveThemeMode,
} from '../services/storage';

const SIDEBAR_COLOR_OPTIONS = [
  '#FFF9E0',
  '#FDE8D7',
  '#F7E3FF',
  '#DDF5E8',
  '#DCEEFE',
  '#2A2A2A',
  '#35435A',
  '#2D4A3E',
] as const;

export default function ScratchPad() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [colorPickerNoteId, setColorPickerNoteId] = useState<string | null>(
    null,
  );
  const systemColorScheme = useColorScheme();
  const activeNoteId = selectedNoteId ?? notes[0]?.id ?? null;
  const { styles, theme } = useStyles(stylesheet);

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

  const handleChangeText = (value: string) => {
    if (!activeNoteId) return;

    setNotes((prev) =>
      prev.map((note) =>
        note.id === activeNoteId
          ? { ...note, content: value, updatedAt: Date.now() }
          : note,
      ),
    );
    saveNoteContent(activeNoteId, value);
  };

  const handleClear = () => {
    if (!activeNoteId) return;

    Alert.alert('Clear this note?', 'Everything will be erased.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          setNotes((prev) =>
            prev.map((note) =>
              note.id === activeNoteId ? { ...note, content: '' } : note,
            ),
          );
          clearNoteContent(activeNoteId);
        },
      },
    ]);
  };

  const handleDelete = () => {
    if (!activeNoteId) return;

    Alert.alert('Delete this note?', 'This note will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const noteIdToDelete = activeNoteId;

          if (notes.length <= 1) {
            await deleteNote(noteIdToDelete);
            const replacement = await createNote();
            setNotes([replacement]);
            setSelectedNoteId(replacement.id);
            setColorPickerNoteId(null);
            return;
          }

          const currentIndex = notes.findIndex(
            (note) => note.id === noteIdToDelete,
          );
          const remaining = notes.filter((note) => note.id !== noteIdToDelete);
          const fallbackIndex = Math.min(currentIndex, remaining.length - 1);
          const nextSelection = remaining[Math.max(0, fallbackIndex)];

          setNotes(remaining);
          setSelectedNoteId(nextSelection?.id ?? null);
          setColorPickerNoteId((current) =>
            current === noteIdToDelete ? null : current,
          );
          await deleteNote(noteIdToDelete);
        },
      },
    ]);
  };

  const handleAddNote = async () => {
    const note = await createNote();
    setNotes((prev) => [...prev, note]);
    setSelectedNoteId(note.id);
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    UnistylesRuntime.setTheme(nextTheme);
    saveThemeMode(nextTheme);
  };

  const handleSelectNoteColor = (noteId: string, color: string | null) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, color } : note)),
    );
    setSelectedNoteId(noteId);
    setColorPickerNoteId(null);
    saveNoteColor(noteId, color);
  };

  const handleNotePressIn = (noteId: string, event: GestureResponderEvent) => {
    const mouseButton = (event.nativeEvent as { button?: number }).button;
    if (mouseButton === 2) {
      setSelectedNoteId(noteId);
      setColorPickerNoteId((current) => (current === noteId ? null : noteId));
    }
  };

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId) ?? null,
    [notes, activeNoteId],
  );

  const getNoteTitle = (note: Note, index: number): string => {
    const trimmed = note.content.trim();
    if (trimmed.length === 0) return `note #${index + 1}`;

    return trimmed.slice(0, 20);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setIsSidebarCollapsed((prev) => !prev)}
          style={styles.sidebarToggle}
        >
          <Text style={styles.sidebarToggleText}>
            {isSidebarCollapsed ? '>' : '<'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scratch Pad</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleToggleTheme}
            style={styles.themeButton}
            accessibilityRole="button"
            accessibilityLabel={
              themeMode === 'dark'
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
          >
            <Text style={styles.themeButtonText}>
              {themeMode === 'dark' ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        {!isSidebarCollapsed && (
          <View
            style={[
              styles.sidebar,
              {
                borderRightColor: theme.colors.headerBorder,
                backgroundColor: theme.colors.headerBackground,
              },
            ]}
          >
            <ScrollView
              style={styles.noteListScroll}
              contentContainerStyle={styles.noteList}
            >
              {notes.map((note, index) => {
                const isSelected = note.id === selectedNote?.id;
                const noteColors = getNoteRowColors(
                  note.color,
                  themeMode,
                  theme,
                );
                return (
                  <View key={note.id}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedNoteId(note.id);
                        if (colorPickerNoteId !== note.id) {
                          setColorPickerNoteId(null);
                        }
                      }}
                      onPressIn={(event) => handleNotePressIn(note.id, event)}
                      style={[
                        styles.noteItem,
                        isSelected && styles.noteItemSelected,
                        {
                          backgroundColor: isSelected
                            ? noteColors.selectedBackground
                            : noteColors.background,
                        },
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.noteItemText,
                          isSelected && styles.noteItemTextSelected,
                          { color: noteColors.text },
                        ]}
                      >
                        {getNoteTitle(note, index)}
                      </Text>
                    </TouchableOpacity>

                    {colorPickerNoteId === note.id && (
                      <View
                        style={[
                          styles.noteColorPickerRow,
                          { borderColor: theme.colors.headerBorder },
                        ]}
                      >
                        {SIDEBAR_COLOR_OPTIONS.map((color) => {
                          const isSelectedColor =
                            color.toLowerCase() === note.color?.toLowerCase();
                          return (
                            <TouchableOpacity
                              key={`${note.id}-${color}`}
                              onPress={() =>
                                handleSelectNoteColor(note.id, color)
                              }
                              style={[
                                styles.colorSwatch,
                                { backgroundColor: color },
                                isSelectedColor && styles.colorSwatchSelected,
                              ]}
                            />
                          );
                        })}
                        <TouchableOpacity
                          onPress={() => handleSelectNoteColor(note.id, null)}
                          style={[
                            styles.resetColorButton,
                            { borderColor: theme.colors.headerBorder },
                          ]}
                        >
                          <Text
                            style={[
                              styles.resetColorText,
                              { color: theme.colors.text },
                            ]}
                          >
                            Default
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            <View
              style={[
                styles.sidebarFooter,
                {
                  borderTopColor: theme.colors.headerBorder,
                  backgroundColor: theme.colors.addButtonBackground,
                },
              ]}
            >
              <TouchableOpacity
                onPress={handleAddNote}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>+ Add Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <NativeScratchEditor
          text={selectedNote?.content ?? ''}
          onChangeText={handleChangeText}
          placeholder="Start typing..."
          fontSize={theme.typography.fontSize}
          darkMode={themeMode === 'dark'}
          style={styles.editor}
        />
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.headerPaddingVertical,
    paddingHorizontal: theme.spacing.headerPaddingHorizontal,
    backgroundColor: theme.colors.headerBackground,
    borderBottomWidth: theme.layout.hairlineWidth,
    borderBottomColor: theme.colors.headerBorder,
  },
  title: {
    fontSize: theme.typography.headerFontSize,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  sidebarToggle: {
    width: theme.layout.sidebarToggleWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarToggleText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.buttonHorizontal,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.clearButton,
  },
  clearButtonText: {
    color: theme.colors.clearButtonText,
    fontSize: theme.typography.listFontSize,
    fontWeight: '500',
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.buttonHorizontal,
    borderRadius: theme.radius.sm,
    backgroundColor: '#8F342C',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.listFontSize,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeButton: {
    width: theme.layout.iconButtonSize,
    height: theme.layout.iconButtonSize,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.iconButtonBackground,
  },
  themeButtonText: {
    fontSize: 16,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    flexShrink: 0,
    width: theme.layout.sidebarWidth,
    height: '100%',
    borderRightWidth: theme.layout.hairlineWidth,
    borderRightColor: theme.colors.headerBorder,
    backgroundColor: theme.colors.headerBackground,
  },
  noteListScroll: {
    flex: 1,
  },
  noteList: {
    paddingVertical: 8,
  },
  noteItem: {
    paddingVertical: theme.spacing.noteItemVertical,
    paddingHorizontal: theme.spacing.noteItemHorizontal,
  },
  noteItemSelected: {
    backgroundColor: theme.colors.sidebarSelected,
  },
  noteItemText: {
    color: theme.colors.text,
    fontSize: theme.typography.listFontSize,
  },
  noteItemTextSelected: {
    fontWeight: '600',
  },
  addButton: {
    borderTopWidth: theme.layout.hairlineWidth,
    borderTopColor: theme.colors.headerBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.addButtonBackground,
    borderRadius: theme.radius.sm,
  },
  addButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.listFontSize,
    fontWeight: '600',
  },
  sidebarFooter: {
    borderTopWidth: theme.layout.hairlineWidth,
    padding: 8,
  },
  noteColorPickerRow: {
    marginHorizontal: 8,
    marginBottom: 6,
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.addButtonBackground,
  },
  colorSwatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: theme.colors.text,
  },
  resetColorButton: {
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetColorText: {
    fontSize: 11,
    fontWeight: '600',
  },
  editor: {
    flex: 1,
  },
}));

function blendHex(baseHex: string, mixHex: string, weight: number): string {
  const safeWeight = Math.min(1, Math.max(0, weight));
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixHex);
  const r = Math.round(base.r + (mix.r - base.r) * safeWeight);
  const g = Math.round(base.g + (mix.g - base.g) * safeWeight);
  const b = Math.round(base.b + (mix.b - base.b) * safeWeight);
  return rgbToHex(r, g, b);
}

function getNoteRowColors(
  noteColor: string | null | undefined,
  themeMode: ThemeMode,
  theme: {
    colors: {
      text: string;
      headerBackground: string;
      sidebarSelected: string;
    };
  },
): {
  background: string;
  selectedBackground: string;
  text: string;
} {
  if (!noteColor) {
    return {
      background: 'transparent',
      selectedBackground: theme.colors.sidebarSelected,
      text: theme.colors.text,
    };
  }

  return {
    background: blendHex(
      noteColor,
      themeMode === 'dark' ? '#000000' : '#FFFFFF',
      0.1,
    ),
    selectedBackground: blendHex(
      noteColor,
      themeMode === 'dark' ? '#000000' : '#FFFFFF',
      0.24,
    ),
    text: isDarkHex(noteColor) ? '#F5F5F5' : '#1F1F1F',
  };
}

function isDarkHex(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance < 140;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return {
    r,
    g,
    b,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(value: number): string {
  return Math.max(0, Math.min(255, value))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
}
