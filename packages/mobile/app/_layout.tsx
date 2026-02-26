import { Stack } from 'expo-router';
import { ThemeProvider } from '@shopify/restyle';
import { StatusBar } from 'expo-status-bar';

import { theme } from '../theme/theme';

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </ThemeProvider>
  );
}
