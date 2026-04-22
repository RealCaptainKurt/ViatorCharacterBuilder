import React, { memo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { AdditionalNPCComponent } from '../../types';
import CollapsibleSection from './CollapsibleSection';
import NPCEditModal from '../modals/NPCEditModal';
import NPCTraitList from './NPCTraitList';

interface Props {
  comp: AdditionalNPCComponent;
  scheme: ColorScheme;
  collapsed: boolean;
  onToggle: () => void;
  editControls?: React.ReactNode;
  /** Called when the user saves name + description changes */
  onUpdate: (name: string, desc: string) => void;
  onAddTrait: (name: string) => void;
  onUpdateTrait: (traitId: string, name: string, value: number) => void;
  onRemoveTrait: (traitId: string) => void;
}

function StandaloneNPC({
  comp,
  scheme,
  collapsed,
  onToggle,
  editControls,
  onUpdate,
  onAddTrait,
  onUpdateTrait,
  onRemoveTrait,
}: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <CollapsibleSection
        title={comp.name}
        scheme={scheme}
        collapsed={collapsed}
        onToggle={onToggle}
        rightContent={editControls}
      >
        {/* Description row with edit icon */}
        <View style={styles.descRow}>
          <Text
            style={[
              styles.desc,
              {
                flex: 1,
                color: comp.description ? scheme.textSecondary : scheme.textMuted,
                fontStyle: comp.description ? 'normal' : 'italic',
              },
            ]}
          >
            {comp.description || 'No description — tap to edit.'}
          </Text>
          <TouchableOpacity
            onPress={() => setEditing(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.editIcon}
          >
            <Feather name="edit-2" size={13} color={scheme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Traits */}
        {comp.traits.length > 0 && (
          <>
            <View style={[styles.divider, { backgroundColor: scheme.surfaceBorder }]} />
            <NPCTraitList
              traits={comp.traits}
              scheme={scheme}
              onUpdateTrait={onUpdateTrait}
              onRemoveTrait={onRemoveTrait}
            />
          </>
        )}
      </CollapsibleSection>

      {/* Unified edit modal */}
      <NPCEditModal
        visible={editing}
        scheme={scheme}
        title={`Edit ${comp.name}`}
        initialName={comp.name}
        initialDesc={comp.description}
        traits={comp.traits}
        showNameInput={true}
        onConfirm={(name, desc) => { onUpdate(name, desc); setEditing(false); }}
        onCancel={() => setEditing(false)}
        onAddTrait={onAddTrait}
        onUpdateTrait={onUpdateTrait}
        onRemoveTrait={onRemoveTrait}
      />
    </>
  );
}

const styles = StyleSheet.create({
  descRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 4,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  editIcon: {
    paddingTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
});

export default memo(StandaloneNPC);
