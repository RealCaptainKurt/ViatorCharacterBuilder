import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface Props {
  visible: boolean;
  onClose: () => void;
  maxHeight?: string | number;
  keyboardAvoiding?: boolean;
  contentStyle?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Standard bottom-sheet modal wrapper used across the app.
 * The sheet is absolutely positioned at the bottom of the screen so it
 * renders correctly on both web and native (Expo Go / tunnel).
 * Tapping the blurred backdrop area above the sheet dismisses it.
 */
export default function ModalSheet({
  visible,
  onClose,
  maxHeight = '85%',
  keyboardAvoiding = false,
  contentStyle,
  children,
}: Props) {
  const inner = (
    <View style={styles.backdrop}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />

      {/* Full-screen dismiss target — sits behind the sheet in z-order */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      {/* Sheet — absolutely pinned to the bottom, rendered above dismiss target */}
      <TouchableWithoutFeedback>
        <View style={[styles.sheet, { maxHeight }]}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
          <View style={[styles.sheetInner, contentStyle]}>
            {children}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : inner}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(100,140,255,0.2)',
  },
  sheetInner: {
    padding: 24,
    flex: 1,
    backgroundColor: 'rgba(10,14,30,0.88)',
  },
});
