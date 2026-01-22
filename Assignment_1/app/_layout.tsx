// app/_layout.tsx
import { Stack, router, usePathname } from "expo-router";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import { ThemeProvider, useTheme } from "@/src/theme/ThemeContext";
import { NotesProvider, useNotes } from "@/src/notes/NotesContext";
import { Shadow, Spacing, Radius } from "@/constants/theme";
import { ThemeIcon } from "@/components/ui/ThemeIcon";

function LayoutContent() {
    const { mode, setMode, colors } = useTheme();
    const pathname = usePathname();

    // In-editor = /note/<id>
    const isInNote = pathname.startsWith("/note/");
    const noteId = isInNote ? pathname.split("/")[2] : null;

    const { deleteNote } = useNotes();

    return (
        <View style={[styles.screen, { backgroundColor: colors.bg }]}>
            <Stack screenOptions={{ headerShown: false }} />

            <LinearGradient
                colors={["rgba(0,0,0,0.5)", "transparent"]}
                style={styles.topGradient}
                pointerEvents="none"
            />

            <Pressable
                onPress={() => setMode((m) => (m === "light" ? "dark" : "light"))}
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
                    if (isInNote && noteId) {
                        Alert.alert(
                            "Delete note?",
                            "This cannot be undone.",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Delete",
                                    style: "destructive",
                                    onPress: () => {
                                        deleteNote(noteId);
                                        router.back();
                                    },
                                },
                            ]
                        );
                    } else {
                        // /note (app/note/index.tsx) skal opprette ny note og router.replace til /note/<id>
                        router.push({ pathname: "/note" });
                    }
                }}
                style={[
                    styles.fabButton,
                    { backgroundColor: colors.s2, borderColor: colors.border },
                    Shadow.near,
                ]}
            >
                {isInNote ? (
                    // Trash icon
                    <Svg width={26} height={26} viewBox="0 0 24 24">
                        <Path
                            d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
                            stroke={colors.text}
                            strokeWidth={2}
                            fill="none"
                            strokeLinecap="round"
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
