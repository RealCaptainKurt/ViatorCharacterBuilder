import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLOR_SCHEMES, ColorScheme } from '../../constants/colorSchemes';
import { ColorSchemeId } from '../../types';
import ModalOverlay from './ModalOverlay';

interface Props {
  visible: boolean;
  onClose: () => void;
  current: ColorSchemeId;
  onChange: (id: ColorSchemeId) => void;
  scheme: ColorScheme;
}

export default function ColorSchemeModal({ visible, onClose, current, onChange, scheme }: Props) {
  const schemes = Object.values(COLOR_SCHEMES) as ColorScheme[];

  const handleSelect = (id: ColorSchemeId) => {
    onChange(id);
    onClose();
  };

  return (
    <ModalOverlay visible={visible} onClose={onClose} scheme={scheme} title="Color Theme">
      <View style={styles.grid}>
        {schemes.map((cs) => {
          const isSelected = cs.id === current;
          return (
            <TouchableOpacity
              key={cs.id}
              onPress={() => handleSelect(cs.id)}
              activeOpacity={0.8}
              style={styles.swatchWrapper}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: cs.primary },
                  isSelected && { borderColor: scheme.text, borderWidth: 2.5 },
                  !isSelected && { borderColor: 'transparent', borderWidth: 2.5 },
                ]}
              >
                <View style={[styles.swatchInner, { backgroundColor: cs.background }]} />
              </View>
              <Text
                style={[
                  styles.swatchLabel,
                  { color: isSelected ? scheme.text : scheme.textMuted },
                ]}
              >
                {cs.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  swatchWrapper: {
    alignItems: 'center',
    width: '33.33%',
    marginBottom: 16,
  },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  swatchLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 5,
    letterSpacing: 0.3,
  },
});
