import { View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { COLOR_SCHEMES, DEFAULT_SCHEME } from '../constants/colorSchemes';

const scheme = COLOR_SCHEMES[DEFAULT_SCHEME];

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not found' }} />
      <View style={[styles.container, { backgroundColor: scheme.background }]}>
        <Link href="/" style={[styles.button, { color: scheme.text }]}>
          Go back to Home screen
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
  },
});