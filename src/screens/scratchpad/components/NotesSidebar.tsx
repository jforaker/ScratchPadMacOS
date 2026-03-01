import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  type GestureResponderEvent,
  type ListRenderItemInfo,
  Text,
  View,
} from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import type { Note } from '../../../types/Note';
import { getNoteTitle } from '../utils';
import NoteListItem from './NoteListItem';
import SidebarFooter from './SidebarFooter';
import SidebarLayout from './SidebarLayout';

interface NotesSidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onAddNote: () => void;
  onNotePressIn: (noteId: string, event: GestureResponderEvent) => void;
}

export default function NotesSidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onAddNote,
  onNotePressIn,
}: NotesSidebarProps) {
  const { styles, theme } = useStyles(stylesheet);
  const selectedBackground = useMemo(
    () => theme.colors.sidebarSelected,
    [theme.colors.sidebarSelected],
  );
  const textColor = useMemo(() => theme.colors.text, [theme.colors.text]);

  const keyExtractor = useCallback((item: Note) => item.id, []);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Note>) => {
      const isSelected = item.id === selectedNoteId;

      return (
        <NoteListItem
          noteId={item.id}
          title={getNoteTitle(item, index)}
          isSelected={isSelected}
          backgroundColor={isSelected ? selectedBackground : 'transparent'}
          textColor={textColor}
          onSelect={onSelectNote}
          onPressIn={onNotePressIn}
        />
      );
    },
    [
      onNotePressIn,
      onSelectNote,
      selectedNoteId,
      selectedBackground,
      textColor,
    ],
  );

  return (
    <SidebarLayout footer={<SidebarFooter onAddNote={onAddNote} />}>
      <View style={styles.header}>
        <Text style={styles.heading}>Notes</Text>
        <Text style={styles.count}>{notes.length}</Text>
      </View>
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={LIST_CONTENT_CONTAINER_STYLE}
        initialNumToRender={12}
        maxToRenderPerBatch={24}
        windowSize={7}
      />
    </SidebarLayout>
  );
}

const LIST_CONTENT_CONTAINER_STYLE = { paddingVertical: 6, paddingBottom: 10 };

const stylesheet = createStyleSheet((theme) => ({
  header: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    opacity: 0.6,
    color: theme.colors.text,
  },
  count: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '700',
    opacity: 0.55,
    color: theme.colors.text,
  },
}));
