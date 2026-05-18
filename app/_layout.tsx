import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subject/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="topic/[id]" options={{ headerShown: true, headerTitle: '', headerBackTitle: 'Артқа', headerTintColor: Colors.primary, headerStyle: { backgroundColor: Colors.bg } }} />
        <Stack.Screen name="quiz/[topicId]" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="result/[quizId]" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="ubt-session/index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="reading/[textId]" options={{ headerShown: true, headerTitle: 'Мәтін оқу', headerBackTitle: 'Артқа', headerTintColor: Colors.primary, headerStyle: { backgroundColor: Colors.bg } }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
