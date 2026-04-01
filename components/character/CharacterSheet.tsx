import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLOR_SCHEMES } from '../../constants/colorSchemes';
import { Character } from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../ui/GlassCard';
import CollapsibleSection from '../ui/CollapsibleSection';
import TraitRow from './TraitRow';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import TextContentRow from '../ui/TextContentRow';

interface CollapsedState {
  description: boolean;
  traits: boolean;
  [key: string]: boolean;
}

interface Props {
  character: Character;
}

export default function CharacterSheet({ character }: Props) {
  const scheme = COLOR_SCHEMES[character.colorScheme];
  const {
    updateCharacterField,
    addTrait,
    updateTrait,
    removeTrait,
    updateCharacterComponent,
  } = useAppStore();

  const [collapsed, setCollapsed] = useState<CollapsedState>({
    description: false,
    traits: false,
  });

  const [addingTrait, setAddingTrait] = useState(false);
  const [newTraitName, setNewTraitName] = useState('');
  const [newTraitLevel, setNewTraitLevel] = useState(1);

  const toggle = (key: string) =>
    setCollapsed((s) => ({ ...s, [key]: !s[key] }));

  const handleAddTrait = () => {
    if (!newTraitName.trim()) return;
    addTrait(character.id, newTraitName.trim(), newTraitLevel);
    setNewTraitName('');
    setNewTraitLevel(1);
    setAddingTrait(false);
  };

  return (
    <GlassCard scheme={scheme} style={styles.card}>
      {/* ── Name & XP ─────────────────────────────── */}
      <View style={styles.nameRow}>
        <TextInput
          value={character.name}
          onChangeText={(v) => updateCharacterField(character.id, 'name', v)}
          style={[styles.nameInput, { color: scheme.text }]}
          placeholder="Character Name"
          placeholderTextColor={scheme.textMuted}
          selectionColor={scheme.primary}
        />
        <View style={styles.xpBox}>
          <Text style={[styles.xpLabel, { color: scheme.textSecondary }]}>XP</Text>
          <TextInput
            value={String(character.xp)}
            onChangeText={(v) => {
              const n = parseInt(v, 10);
              if (!isNaN(n) && n >= 0) {
                updateCharacterField(character.id, 'xp', n);
              } else if (v === '') {
                updateCharacterField(character.id, 'xp', 0);
              }
            }}
            keyboardType="number-pad"
            style={[styles.xpInput, { color: scheme.primary, borderColor: scheme.surfaceBorder }]}
            selectionColor={scheme.primary}
          />
        </View>
      </View>

      {/* ── Description ───────────────────────────── */}
      <CollapsibleSection
        title="Description"
        scheme={scheme}
        collapsed={collapsed.description}
        onToggle={() => toggle('description')}
      >
        <TextContentRow
          content={character.description}
          scheme={scheme}
          placeholder="Tap to add description..."
          title="Description"
          onSave={(v) => updateCharacterField(character.id, 'description', v)}
        />
      </CollapsibleSection>

      {/* ── Traits ────────────────────────────────── */}
      <CollapsibleSection
        title="Traits"
        scheme={scheme}
        collapsed={collapsed.traits}
        onToggle={() => toggle('traits')}
        rightContent={
          <TouchableOpacity
            onPress={() => setAddingTrait((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.addBtn, { color: scheme.primary }]}>
              {addingTrait ? '✕' : '+'}
            </Text>
          </TouchableOpacity>
        }
      >
        {character.traits.length === 0 && !addingTrait ? (
          <Text style={[styles.empty, { color: scheme.textMuted }]}>
            No traits yet. Tap + to add one.
          </Text>
        ) : null}

        {character.traits.map((trait) => (
          <TraitRow
            key={trait.id}
            trait={trait}
            scheme={scheme}
            onUpdate={(name, level) => updateTrait(character.id, trait.id, name, level)}
            onRemove={() => removeTrait(character.id, trait.id)}
          />
        ))}

        {addingTrait && (
          <View
            style={[styles.addTraitForm, { borderTopColor: scheme.surfaceBorder }]}
          >
            <TextInput
              value={newTraitName}
              onChangeText={setNewTraitName}
              placeholder="Trait name"
              placeholderTextColor={scheme.textMuted}
              style={[
                styles.addTraitInput,
                {
                  color: scheme.text,
                  borderColor: scheme.surfaceBorder,
                  backgroundColor: scheme.primaryMuted,
                },
              ]}
              autoFocus
            />
            <View style={styles.levelRow}>
              {[1, 2, 3, 4, 5, 6].map((l) => (
                <TouchableOpacity
                  key={l}
                  onPress={() => setNewTraitLevel(l)}
                  style={[
                    styles.levelPip,
                    {
                      backgroundColor:
                        l <= newTraitLevel
                          ? scheme.levelColors[newTraitLevel - 1]
                          : scheme.surface,
                      borderColor:
                        l <= newTraitLevel ? scheme.primary : scheme.surfaceBorder,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        l <= newTraitLevel ? scheme.text : scheme.textMuted,
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.addTraitActions}>
              <GlassButton
                label="Cancel"
                onPress={() => { setAddingTrait(false); setNewTraitName(''); }}
                scheme={scheme}
                variant="ghost"
                small
                style={{ flex: 1 }}
              />
              <GlassButton
                label="Add Trait"
                onPress={handleAddTrait}
                scheme={scheme}
                variant="primary"
                small
                style={{ flex: 1 }}
                disabled={!newTraitName.trim()}
              />
            </View>
          </View>
        )}
      </CollapsibleSection>

      {/* ── Additional Components ──────────────────── */}
      {character.additionalComponents.map((comp) => (
        <CollapsibleSection
          key={comp.id}
          title={comp.name}
          scheme={scheme}
          collapsed={collapsed[comp.id] ?? false}
          onToggle={() => toggle(comp.id)}
        >
          <TextContentRow
            content={comp.content}
            scheme={scheme}
            placeholder={`Tap to add ${comp.name.toLowerCase()}...`}
            title={comp.name}
            onSave={(v) => updateCharacterComponent(character.id, comp.id, comp.name, v)}
          />
        </CollapsibleSection>
      ))}

    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  nameInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingVertical: 4,
  },
  xpBox: {
    alignItems: 'center',
    width: 72,
    flexShrink: 0,
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  xpInput: {
    fontSize: 18,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: 72,
    textAlign: 'center',
  },
  empty: {
    fontStyle: 'italic',
    fontSize: 13,
    paddingVertical: 8,
  },
  addBtn: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    paddingHorizontal: 4,
  },
  addTraitForm: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  addTraitInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelPip: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTraitActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
