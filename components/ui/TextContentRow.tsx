import React, { memo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import TextEditModal from '../modals/TextEditModal';

interface Props {
  content: string;
  scheme: ColorScheme;
  placeholder?: string;
  title?: string;
  allowNameEdit?: boolean;
  initialName?: string;
  onSave: (content: string, name?: string) => void;
}

function TextContentRow({
  content,
  scheme,
  placeholder = 'Tap to edit...',
  title,
  allowNameEdit = false,
  initialName = '',
  onSave,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const openEdit = () => {
    setDraft(content);
    setEditing(true);
  };

  return (
    <>
      <TouchableOpacity onPress={openEdit} activeOpacity={0.75} style={styles.row}>
        {content ? (
          <Text style={[styles.content, { color: scheme.text }]}>{content}</Text>
        ) : (
          <Text style={[styles.placeholder, { color: scheme.textMuted }]}>
            {placeholder}
          </Text>
        )}
        <Feather name="edit-2" size={14} color={scheme.textMuted} style={{ paddingTop: 2 }} />
      </TouchableOpacity>

      <TextEditModal
        visible={editing}
        scheme={scheme}
        title={title ? `Edit ${title}` : 'Edit Content'}
        initialName={initialName}
        initialDesc={draft}
        showNameInput={allowNameEdit}
        descPlaceholder={placeholder}
        onConfirm={(name, desc) => {
          onSave(desc, allowNameEdit ? name : undefined);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 4,
  },
  content: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  placeholder: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
  },
  editIcon: {
    fontSize: 16,
    paddingTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 110,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default memo(TextContentRow);
