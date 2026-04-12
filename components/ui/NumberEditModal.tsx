import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassButton from './GlassButton';
import ModalOverlay from './ModalOverlay';

interface Props {
  visible: boolean;
  title: string;
  initialValue: number;
  scheme: ColorScheme;
  onSave: (value: number) => void;
  onClose: () => void;
}

export default function NumberEditModal({ visible, title, initialValue, scheme, onSave, onClose }: Props) {
  const [draft, setDraft] = useState(String(initialValue));

  useEffect(() => {
    if (visible) setDraft(String(initialValue));
  }, [visible, initialValue]);

  const adjust = (delta: number) =>
    setDraft((v) => String((parseInt(v, 10) || 0) + delta));

  const handleSave = () => {
    const n = parseInt(draft, 10);
    if (!isNaN(n)) onSave(n);
    onClose();
  };

  return (
    <ModalOverlay
      visible={visible}
      onClose={onClose}
      scheme={scheme}
      title={title}
    >
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => adjust(-1)}
          style={[styles.adjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.adjustText, { color: scheme.destructive }]}>−</Text>
        </TouchableOpacity>

        <TextInput
          value={draft}
          onChangeText={(v) => { if (v === '' || /^-?\d+$/.test(v)) setDraft(v); }}
          keyboardType="number-pad"
          style={[styles.input, { color: scheme.primary, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
          selectionColor={scheme.primary}
          selectTextOnFocus
          autoFocus
        />

        <TouchableOpacity
          onPress={() => adjust(1)}
          style={[styles.adjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.adjustText, { color: scheme.primary }]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <GlassButton label="Cancel" onPress={onClose} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
        <GlassButton label="Save" onPress={handleSave} scheme={scheme} variant="primary" small style={{ flex: 1 }} />
      </View>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  adjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
