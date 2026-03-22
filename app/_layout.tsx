import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Amplify } from "aws-amplify"; // ← Amplify はオブジェクト
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import awsconfig from "../src/aws-exports";

import { useColorScheme } from '@/hooks/use-color-scheme';

Amplify.configure(awsconfig); // ← AWS 設定はここで一度だけ

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
