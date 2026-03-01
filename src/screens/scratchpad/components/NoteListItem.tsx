import React, { memo } from 'react';
import { type GestureResponderEvent, Text } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
const TamaguiButton = require('../../../components/TamaguiButton').default;
const AppIcon = require('../../../components/AppIcon').default;

interface NoteListItemProps {
  noteId: string;
  title: string;
  isSelected: boolean;
  backgroundColor: string;
  textColor: string;
  onSelect: (noteId: string) => void;
  onPressIn: (noteId: string, event: GestureResponderEvent) => void;
}

function NoteListItem({
  noteId,
  title,
  isSelected,
  backgroundColor,
  textColor,
  onSelect,
  onPressIn,
}: NoteListItemProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <TamaguiButton
      unstyled
      onPress={() => onSelect(noteId)}
      onPressIn={(event: GestureResponderEvent) => onPressIn(noteId, event)}
      style={[
        styles.noteItem,
        isSelected && styles.noteItemSelected,
        { backgroundColor },
      ]}
      pressStyle={styles.noteItemPressed}
    >
      <AppIcon
        name={isSelected ? 'document' : 'document-outline'}
        size={14}
        color={textColor}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.noteItemText,
          isSelected && styles.noteItemTextSelected,
          { color: textColor },
        ]}
      >
        {title}
      </Text>
    </TamaguiButton>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  noteItem: {
    paddingVertical: theme.spacing.noteItemVertical,
    paddingHorizontal: theme.spacing.noteItemHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: theme.radius.md,
    marginBottom: 4,
    borderWidth: theme.layout.hairlineWidth,
    borderColor: 'transparent',
  },
  noteItemPressed: { opacity: 0.9 },
  noteItemSelected: {
    backgroundColor: theme.colors.sidebarSelected,
    borderColor: theme.colors.headerBorder,
  },
  noteItemText: {
    color: theme.colors.text,
    fontSize: theme.typography.listFontSize,
    fontFamily: theme.typography.fontFamily,
    opacity: 0.9,
  },
  noteItemTextSelected: {
    fontWeight: '700',
    opacity: 1,
  },
}));

function arePropsEqual(prev: NoteListItemProps, next: NoteListItemProps) {
  return (
    prev.noteId === next.noteId &&
    prev.title === next.title &&
    prev.isSelected === next.isSelected &&
    prev.backgroundColor === next.backgroundColor &&
    prev.textColor === next.textColor
  );
}

export default memo(NoteListItem, arePropsEqual);
