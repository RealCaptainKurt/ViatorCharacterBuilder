import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { Trait } from '../../types';
import GlassInput from '../ui/GlassInput';
import GlassButton from '../ui/GlassButton';
import ModalOverlay from '../ui/ModalOverlay';

interface Props {
  trait: Trait;
  scheme: ColorScheme;
  onUpdate: (name: string, level: number) => void;
  onRemove: () => void;
}

const LEVELS = [1, 2, 3, 4, 5, 6];

export default function TraitRow({ trait, scheme, onUpdate, onRemove }: Props) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(trait.name);
  const [editLevel, setEditLevel] = useState(trait.level);

  const handleSave = () => {
    if (!editName.trim()) return;
    onUpdate(editName.trim(), editLevel);
    setEditing(false);
  };

  const handleRemove = () => {
    Alert.alert('Remove Trait', `Remove "${trait.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove },
    ]);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setEditName(trait.name);
          setEditLevel(trait.level);
          setEditing(true);
        }}
        activeOpacity={0.8}
        style={[styles.row, { borderBottomColor: scheme.surfaceBorder }]}
      >
        <Text style={[styles.name, { color: scheme.text }]}>{trait.name}</Text>
        <View style={styles.pips}>
          {LEVELS.map((l) => (
            <View
              key={l}
              style={[
                styles.pip,
                {
                  backgroundColor:
                    l <= trait.level
                      ? scheme.levelColors[trait.level - 1]
                      : scheme.surface,
                  borderColor: scheme.surfaceBorder,
                },
              ]}
            />
          ))}
        </View>
      </TouchableOpacity>

      <ModalOverlay
        visible={editing}
        onClose={() => setEditing(false)}
        scheme={scheme}
        title="Edit Trait"
      >
        <GlassInput
          scheme={scheme}
          label="Trait Name"
          value={editName}
          onChangeText={setEditName}
          placeholder="e.g. Swordsmanship"
          containerStyle={styles.inputContainer}
        />

        <Text style={[styles.levelLabel, { color: scheme.textSecondary }]}>
          Level
        </Text>
        <View style={styles.levelRow}>
          {LEVELS.map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => setEditLevel(l)}
              style={[
                styles.levelBtn,
                {
                  backgroundColor:
                    editLevel >= l
                      ? scheme.levelColors[editLevel - 1]
                      : scheme.surface,
                  borderColor:
                    editLevel >= l ? scheme.primary : scheme.surfaceBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.levelBtnText,
                  {
                    color: editLevel >= l ? scheme.text : scheme.textMuted,
                  },
                ]}
              >
                {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actions}>
          <GlassButton
            label="Remove"
            onPress={() => {
              setEditing(false);
              setTimeout(handleRemove, 200);
            }}
            scheme={scheme}
            variant="destructive"
            small
            style={styles.actionBtn}
          />
          <GlassButton
            label="Cancel"
            onPress={() => setEditing(false)}
            scheme={scheme}
            variant="ghost"
            small
            style={styles.actionBtn}
          />
          <GlassButton
            label="Save"
            onPress={handleSave}
            scheme={scheme}
            variant="primary"
            small
            style={styles.actionBtn}
          />
        </View>
      </ModalOverlay>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  pips: {
    flexDirection: 'row',
    gap: 5,
  },
  pip: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  levelBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
  },
});
