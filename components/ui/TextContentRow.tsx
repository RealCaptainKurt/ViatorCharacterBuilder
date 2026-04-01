import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

interface Props {
  content: string;
  scheme: ColorScheme;
  placeholder?: string;
  title?: string;
  onSave: (content: string) => void;
}

export default function TextContentRow({
  content,
  scheme,
  placeholder = 'Tap to edit...',
  title,
  onSave,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const openEdit = () => {
    setDraft(content);
    setEditing(true);
  };

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
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
        <Text style={[styles.editIcon, { color: scheme.textMuted }]}>✎</Text>
      </TouchableOpacity>

      <Modal
        visible={editing}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={() => setEditing(false)}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <GlassCard scheme={scheme} style={styles.modal}>
                  {title ? (
                    <Text style={[styles.title, { color: scheme.text }]}>
                      {title}
                    </Text>
                  ) : null}
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    multiline
                    autoFocus
                    textAlignVertical="top"
                    style={[
                      styles.input,
                      {
                        color: scheme.text,
                        borderColor: scheme.surfaceBorder,
                        backgroundColor: scheme.primaryMuted,
                      },
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={scheme.textMuted}
                    selectionColor={scheme.primary}
                  />
                  <View style={styles.actions}>
                    <GlassButton
                      label="Cancel"
                      onPress={() => setEditing(false)}
                      scheme={scheme}
                      variant="ghost"
                      small
                      style={{ flex: 1 }}
                    />
                    <GlassButton
                      label="Save"
                      onPress={handleSave}
                      scheme={scheme}
                      variant="primary"
                      small
                      style={{ flex: 1 }}
                    />
                  </View>
                </GlassCard>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    maxWidth: 460,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
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
