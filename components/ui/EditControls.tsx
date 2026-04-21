import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassButton from './GlassButton';

interface Props {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
  confirmRemove?: boolean;
  scheme: ColorScheme;
}

export default function EditControls({ onMoveUp, onMoveDown, onRemove, confirmRemove, scheme }: Props) {
  return (
    <View style={styles.container}>
      <GlassButton
        onPress={onMoveUp || (() => {})}
        disabled={!onMoveUp}
        scheme={scheme}
        variant="secondary"
        icon={<Ionicons name="chevron-up" size={16} color={onMoveUp ? scheme.primary : scheme.textMuted} />}
        style={styles.btn}
      />
      
      <GlassButton
        onPress={onMoveDown || (() => {})}
        disabled={!onMoveDown}
        scheme={scheme}
        variant="secondary"
        icon={<Ionicons name="chevron-down" size={16} color={onMoveDown ? scheme.primary : scheme.textMuted} />}
        style={styles.btn}
      />

      <GlassButton
        onPress={onRemove}
        scheme={scheme}
        variant="destructive"
        icon={
          confirmRemove ? (
            <Ionicons name="checkmark" size={16} color={scheme.destructive} />
          ) : (
            <Ionicons name="close" size={16} color={scheme.destructive} />
          )
        }
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btn: {
    width: 28,
    height: 28,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 6,
  },
});
