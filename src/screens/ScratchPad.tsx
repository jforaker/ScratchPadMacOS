import React from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import NativeScratchEditor from '../components/NativeScratchEditor';
import NotesSidebar from './scratchpad/components/NotesSidebar';
import ScratchPadHeader from './scratchpad/components/ScratchPadHeader';
import useScratchPadState from './scratchpad/useScratchPadState';

export default function ScratchPad() {
  const { styles, theme } = useStyles(stylesheet);
  const {
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
  } = useScratchPadState();

  return (
    <View style={styles.container}>
      <ScratchPadHeader
        isSidebarCollapsed={isSidebarCollapsed}
        themeMode={themeMode}
        onToggleSidebar={toggleSidebar}
        onDelete={handleDelete}
        onClear={handleClear}
        onToggleTheme={handleToggleTheme}
      />

      <View style={styles.body}>
        {!isSidebarCollapsed && (
          <NotesSidebar
            notes={notes}
            selectedNoteId={selectedNote?.id ?? null}
            onSelectNote={handleSelectNote}
            onAddNote={handleAddNote}
            onNotePressIn={handleNotePressIn}
          />
        )}

        <NativeScratchEditor
          text={selectedNote?.content ?? ''}
          onChangeText={handleChangeText}
          placeholder="Start typing..."
          fontSize={theme.typography.fontSize}
          fontFamily={theme.typography.fontFamily}
          darkMode={themeMode === 'dark'}
          style={styles.editorInner}
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
  body: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
  },
  editorInner: {
    flex: 1,
    margin: 12,
    padding: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.headerBackground,
    borderWidth: theme.layout.hairlineWidth,
    borderColor: theme.colors.headerBorder,
  },
}));
