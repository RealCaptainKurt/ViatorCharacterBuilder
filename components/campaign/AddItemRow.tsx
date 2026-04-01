import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

interface Props {
  visible: boolean;
  scheme: ColorScheme;
  title?: string;
  namePlaceholder?: string;
  descPlaceholder?: string;
  onAdd: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function AddItemRow({
  visible,
  scheme,
  title,
  namePlaceholder = 'Name',
  descPlaceholder = 'Description (optional)',
  onAdd,
  onCancel,
}: Props) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (!visible) {
      setName('');
      setDesc('');
    }
  }, [visible]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), desc.trim());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <GlassCard scheme={scheme} style={styles.modal}>
                {title ? (
                  <Text style={[styles.title, { color: scheme.text }]}>{title}</Text>
                ) : null}
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={namePlaceholder}
                  placeholderTextColor={scheme.textMuted}
                  style={[
                    styles.input,
                    {
                      color: scheme.text,
                      borderColor: scheme.surfaceBorder,
                      backgroundColor: scheme.primaryMuted,
                    },
                  ]}
                  selectionColor={scheme.primary}
                  autoFocus
                />
                <TextInput
                  value={desc}
                  onChangeText={setDesc}
                  placeholder={descPlaceholder}
                  placeholderTextColor={scheme.textMuted}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.input,
                    styles.descInput,
                    {
                      color: scheme.text,
                      borderColor: scheme.surfaceBorder,
                      backgroundColor: scheme.primaryMuted,
                    },
                  ]}
                  selectionColor={scheme.primary}
                />
                <View style={styles.actions}>
                  <GlassButton
                    label="Cancel"
                    onPress={onCancel}
                    scheme={scheme}
                    variant="ghost"
                    small
                    style={{ flex: 1 }}
                  />
                  <GlassButton
                    label="Add"
                    onPress={handleAdd}
                    scheme={scheme}
                    variant="primary"
                    small
                    style={{ flex: 1 }}
                    disabled={!name.trim()}
                  />
                </View>
              </GlassCard>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 10,
  },
  descInput: {
    minHeight: 70,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
