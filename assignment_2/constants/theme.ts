// theme.ts
import { Platform } from "react-native";

export const Fonts = Platform.select({
  ios: {
    sans: "System",
    serif: "Georgia",
    rounded: "System",
    mono: "Menlo",
  },
  android: {
    sans: "sans-serif",
    serif: "serif",
    rounded: "sans-serif",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    sans: "System",
    serif: "serif",
    rounded: "System",
    mono: "monospace",
  },
});


export const Spacing = {
  XS: 8,
  S: 16,
  M: 24,
  L: 40,
  XL: 64,
} as const;

export const Radius = {
  input: 12,
  card: 16,
  fab: 28,
} as const;

export const Typography = {
  h1: { fontSize: 32, lineHeight: 40, fontFamily: Fonts?.sans, fontWeight: 700, paddingBottom: Spacing.M },
  h2: { fontSize: 18, lineHeight: 24, fontFamily: Fonts?.sans, fontWeight: 700, paddingBottom: Spacing.XS },
  p:  { fontSize: 18, lineHeight: 24, fontFamily: Fonts?.sans },
  meta:{ fontSize: 14, lineHeight: 18, fontFamily: Fonts?.sans },
} as const;

/**
 * 3-tone surfaces:
 * - bg:   app background
 * - s1:   primary surface (cards/inputs)
 * - s2:   secondary surface (pressed/secondary cards)
 */
export const Colors = {
  light: {
    s2: "#FFF8F1",
    s1: "#F7EFE6",
    bg: "#F2E9E1",
    text: "#1F1A17",
    textMuted: "#6E6258",
    border: "#E2D6CA",
    primary: "#C0723A",
    danger: "#D64545",
  },
  dark: {
    bg: "#0B0D10",
    s1: "#12161B",
    s2: "#1B222A",
    text: "#E7EAF0",
    textMuted: "#A7B0BC",
    border: "#2A3440",
    primary: "#7DD3FC",
    danger: "#FF6B6B",
  },
} as const;

export const Shadow = {
  // “Near” for small UI (inputs/buttons)
  near: Platform.select({
    ios: { shadowOpacity: 0.10, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, shadowColor: "rgba(0,0,0,0.25)" },
    android: { elevation: 3, shadowColor: "rgba(0,0,0,0.25)" },
    default: { boxShadow: "0 2px 8px rgba(0,0,0,0.14)" },
  }),
  // “Far” for cards / FAB
  far: Platform.select({
    ios: { shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, shadowColor: "rgba(0,0,0,0.28)" },
    android: { elevation: 6, shadowColor: "rgba(0,0,0,0.28)" },
    default: { boxShadow: "0 10px 26px rgba(0,0,0,0.22)" },
  }),
};

export type ThemeColors = (typeof Colors)[keyof typeof Colors];
