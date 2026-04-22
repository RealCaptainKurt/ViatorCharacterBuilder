import React, { memo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { NPCTrait } from '../../types';
import NumberListItemRow from './NumberListItemRow';

interface Props {
  traits: NPCTrait[];
  scheme: ColorScheme;
  onUpdateTrait: (traitId: string, name: string, value: number) => void;
  onRemoveTrait: (traitId: string) => void;
}

function NPCTraitList({ traits, scheme, onUpdateTrait, onRemoveTrait }: Props) {
  const [confirmTraitId, setConfirmTraitId] = useState<string | null>(null);

  if (traits.length === 0) return null;

  return (
    <View style={styles.container}>
      {traits.map((trait) => (
        <View key={trait.id} style={styles.traitRow}>
          <NumberListItemRow
            item={trait}
            scheme={scheme}
            onUpdateValue={(val, name) => onUpdateTrait(trait.id, name ?? trait.name, val)}
            onRemove={() => {
              if (confirmTraitId === trait.id) {
                onRemoveTrait(trait.id);
                setConfirmTraitId(null);
              } else {
                setConfirmTraitId(trait.id);
              }
            }}
            confirmRemove={confirmTraitId === trait.id}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginTop: 8,
  },
  traitRow: {
    marginBottom: 2,
  },
});

export default memo(NPCTraitList);
