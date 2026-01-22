import { Stack } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ThemeProvider, useTheme } from "@/src/theme/ThemeContext";
import { Shadow, Spacing, Radius } from "@/constants/theme";
import { ThemeIcon } from "@/components/ui/ThemeIcon";

import { usePathname, useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

import {NotesProvider, useNotes } from "@/src/notes/NotesContext";



function LayoutContent() {
    const { mode, setMode, colors } = useTheme();

    const router = useRouter();
    const pathname = usePathname();
    const isNote = pathname === "/note";

    const { saveDraft, resetDraft } = useNotes();

    return (
        <View style={[styles.screen, { backgroundColor: colors.bg }]}>
            <Stack screenOptions={{ headerShown: false }} />

            <LinearGradient
                colors={["rgba(0,0,0,0.5)", "transparent"]}
                style={styles.topGradient}
                pointerEvents="none"
            />

            <Pressable
                onPress={() => setMode(m => (m === "light" ? "dark" : "light"))}
                style={[
                    styles.themeButton,
                    { backgroundColor: colors.s2, borderColor: colors.border },
                    Shadow.near,
                ]}
            >
                <ThemeIcon mode={mode} size={18} color={colors.text} />
            </Pressable>

            <Pressable
                onPress={() => {
                    if (isNote) {
                        const saved = saveDraft();
                        if (!saved) resetDraft();
                        router.back();
                    } else {
                        router.push("/note");
                    }
                }}
                style={[
                    styles.fabButton,
                    { backgroundColor: colors.s2, borderColor: colors.border },
                    Shadow.near,
                ]}
            >
                {isNote ? (
                    // Save icon
                    <Svg width={26} height={26} viewBox="0 0 24 24">
                        <Path
                            d="M5 3h11l3 3v15H5z M7 3v6h8V3"
                            stroke={colors.text}
                            strokeWidth={2}
                            fill="none"
                            strokeLinejoin="round"
                        />
                    </Svg>
                ) : (
                    // Plus icon
                    <Svg width={28} height={28} viewBox="0 0 24 24">
                        <Path
                            d="M12 5v14M5 12h14"
                            stroke={colors.text}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                        />
                    </Svg>
                )}
            </Pressable>
        </View>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <NotesProvider>
                <LayoutContent />
            </NotesProvider>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    themeButton: {
        position: "absolute",
        left: Spacing.S,
        bottom: Spacing.S,
        padding: 12,
        borderWidth: 1,
        borderRadius: Radius.input,
    },
    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 35,
    },
    fabButton: {
        position: "absolute",
        right: Spacing.S,
        bottom: Spacing.S,
        width: 80,
        height: 80,
        borderRadius: Radius.input,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        elevation: 10,
    },

});