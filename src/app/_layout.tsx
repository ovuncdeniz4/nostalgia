// Root stack. Quiz screens register here; there is no tab bar.

import { Anton_400Regular, useFonts } from '@expo-google-fonts/anton';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Anton_400Regular });
  const ready = loaded || Boolean(error);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [ready]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    const id = 'nostalgia-shell';
    if (document.getElementById(id)) {
      return;
    }
    const node = document.createElement('style');
    node.id = id;
    node.textContent = 'html,body,#root{height:100%;width:100%;margin:0;overflow:hidden;overscroll-behavior:none;}';
    document.head.appendChild(node);
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 320,
          contentStyle: { backgroundColor: colors.bg0 },
          gestureEnabled: Platform.OS !== 'web',
        }}
      />
    </SafeAreaProvider>
  );
}
