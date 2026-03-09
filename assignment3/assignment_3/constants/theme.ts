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
        rounded: "sans-serif-medium",
        mono: "monospace",
    },
    web: {
        sans: "'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded: "'SF Pro Rounded', 'Avenir Next Rounded', -apple-system, sans-serif",
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
    S: 14,
    M: 20,
    L: 28,
    XL: 40,
} as const;

export const Radius = {
    input: 14,
    card: 22,
    fab: 20,
    pill: 999,
} as const;

export const Typography = {
    h1: {
        fontSize: 34,
        lineHeight: 40,
        fontFamily: Fonts?.sans,
        fontWeight: "700",
        letterSpacing: -0.6,
    },
    h2: {
        fontSize: 21,
        lineHeight: 28,
        fontFamily: Fonts?.sans,
        fontWeight: "600",
        letterSpacing: -0.3,
    },
    p: {
        fontSize: 17,
        lineHeight: 25,
        fontFamily: Fonts?.sans,
    },
    meta: {
        fontSize: 13,
        lineHeight: 18,
        fontFamily: Fonts?.sans,
        letterSpacing: 0.2,
    },
} as const;

export const Colors = {
    light: {
        bg: "#F4F2EE",
        background: "#F4F2EE",
        s1: "#FEFCF8",
        s2: "#ECF0F5",
        elevated: "#FCF8F2",
        accentSoft: "#D9E8FF",
        text: "#111318",
        textMuted: "#606977",
        border: "#D8DFE8",
        primary: "#0A84FF",
        danger: "#FF453A",
    },
    dark: {
        bg: "#100F0D",
        background: "#100F0D",
        s1: "#181613",
        s2: "#1B2430",
        elevated: "#1C1814",
        accentSoft: "#1E3A60",
        text: "#F2F5F9",
        textMuted: "#9CA9B9",
        border: "#2A3543",
        primary: "#5AA9FF",
        danger: "#FF6961",
    },
} as const;

export const Shadow = {
    near: Platform.select({
        ios: {
            shadowOpacity: 0.1,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            shadowColor: "rgba(14,22,34,0.35)",
        },
        android: { elevation: 3, shadowColor: "rgba(14,22,34,0.3)" },
        default: { boxShadow: "0 4px 14px rgba(10,20,32,0.14)" },
    }),
    far: Platform.select({
        ios: {
            shadowOpacity: 0.16,
            shadowRadius: 22,
            shadowOffset: { width: 0, height: 10 },
            shadowColor: "rgba(10,18,28,0.4)",
        },
        android: { elevation: 7, shadowColor: "rgba(10,18,28,0.35)" },
        default: { boxShadow: "0 14px 34px rgba(8,16,26,0.2)" },
    }),
};

export type ThemeColors = (typeof Colors)[keyof typeof Colors];
