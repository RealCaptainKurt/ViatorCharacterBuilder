import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { AdditionalNPCComponent, NPCTrait } from '../../types';
import CollapsibleSection from './CollapsibleSection';
import TextContentRow from './TextContentRow';
import NPCTraitList from './NPCTraitList';
import ModalOverlay from './ModalOverlay';
import GlassInput from './GlassInput';
import GlassButton from './GlassButton';

interface Props {
  comp: AdditionalNPCComponent;
  scheme: ColorScheme;
  collapsed: boolean;
  onToggle: () => void;
  editControls?: React.ReactNode;
  onUpdateDescription: (desc: string) => void;
  onAddTrait: (name: string) => void;
  onUpdateTrait: (traitId: string, name: string, value: number) => void;
  onRemoveTrait: (traitId: string) => void;
}

export default function StandaloneNPC({
  comp,
  scheme,
  collapsed,
  onToggle,
  editControls,
  onUpdateDescription,
  onAddTrait,
  onUpdateTrait,
  onRemoveTrait,
}: Props) {
  const [addingTrait, setAddingTrait] = useState(false);
  const [newTraitName, setNewTraitName] = useState('');

  const handleAddTrait = () => {
    if (!newTraitName.trim()) return;
    onAddTrait(newTraitName.trim());
    setNewTraitName('');
    setAddingTrait(false);
  };

  const closeAddingTrait = () => {
    setNewTraitName('');
    setAddingTrait(false);
  };

  return (
    <>
      <CollapsibleSection
        title={comp.name}
        scheme={scheme}
        collapsed={collapsed}
        onToggle={onToggle}
        rightContent={editControls}
      >
        <TextContentRow
          content={comp.description}
          scheme={scheme}
          placeholder="Tap to add description..."
          title={comp.name}
          onSave={onUpdateDescription}
        />
        
        <NPCTraitList
          traits={comp.traits}
          scheme={scheme}
          onUpdateTrait={onUpdateTrait}
          onRemoveTrait={onRemoveTrait}
        />

        <TouchableOpacity onPress={() => setAddingTrait(true)} style={styles.addTraitBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Text style={[styles.addTraitText, { color: scheme.primary }]}>+ Add Trait</Text>
        </TouchableOpacity>
      </CollapsibleSection>

      <ModalOverlay visible={addingTrait} onClose={closeAddingTrait} scheme={scheme} title="Add Trait">
        <GlassInput scheme={scheme} label="Trait Name" value={newTraitName} onChangeText={setNewTraitName} autoFocus />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <GlassButton label="Cancel" onPress={closeAddingTrait} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
          <GlassButton
            label="Add"
            onPress={handleAddTrait}
            scheme={scheme}
            variant="primary"
            small
            style={{ flex: 1 }}
            disabled={!newTraitName.trim()}
          />
        </View>
      </ModalOverlay>
    </>
  );
}

const styles = StyleSheet.create({
  addTraitBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  addTraitText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
