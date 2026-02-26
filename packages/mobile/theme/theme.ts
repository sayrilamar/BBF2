import { createTheme } from '@shopify/restyle';

const palette = {
  midnight: '#0A1023',
  panel: '#121B35',
  electric: '#5D8CFF',
  electricSoft: '#DCE6FF',
  textPrimary: '#F7F9FF',
  textSecondary: '#AAB8DE',
  success: '#2ED3A8',
};

export const theme = createTheme({
  colors: {
    background: palette.midnight,
    card: palette.panel,
    primary: palette.electric,
    primaryMuted: palette.electricSoft,
    textPrimary: palette.textPrimary,
    textSecondary: palette.textSecondary,
    success: palette.success,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    xxl: 32,
  },
  borderRadii: {
    s: 8,
    m: 14,
    l: 20,
    xl: 28,
  },
  textVariants: {
    defaults: {
      color: 'textPrimary',
      fontSize: 14,
    },
    hero: {
      fontSize: 30,
      lineHeight: 38,
      color: 'textPrimary',
      fontWeight: '700',
    },
    title: {
      fontSize: 20,
      lineHeight: 26,
      color: 'textPrimary',
      fontWeight: '700',
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      color: 'textSecondary',
      fontWeight: '500',
    },
    label: {
      fontSize: 13,
      lineHeight: 18,
      color: 'textSecondary',
      fontWeight: '600',
    },
    stat: {
      fontSize: 18,
      lineHeight: 22,
      color: 'textPrimary',
      fontWeight: '700',
    },
  },
});

export type Theme = typeof theme;
