import { Stack, router, usePathname } from "expo-router";
import {
    StyleSheet,
    Pressable,
    Alert,
    StatusBar,
    Keyboard,
    Platform,
    View
} from "react-native"; // Lagt til Keyboard, Platform, View
import { useState, useEffect } from "react"; // Lagt til useState, useEffect
import Svg, { Path } from "react-native-svg";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ThemeProvider, useTheme } from "@/src/theme/ThemeContext";
import { NotesProvider, useNotes } from "@/src/notes/NotesContext";
import { Shadow, Spacing, Radius } from "@/constants/theme";
import { ThemeIcon } from "@/components/ui/ThemeIcon";

function LayoutContent() {
    const { mode, setMode, colors } = useTheme();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const { deleteNote } = useNotes();

    // 🔹 Keyboard visibility state
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        const hideEvent = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';

        const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const isInNote = pathname.startsWith("/note/");
    const noteId = isInNote ? pathname.split("/")[2] : null;

    return (
        <View style={[styles.screen, { backgroundColor: colors.bg }]}>
            {/* Statusbar fiks for Android & iOS */}
            <StatusBar
                barStyle={mode === "dark" ? "light-content" : "dark-content"}
                backgroundColor="transparent"
                translucent={true}
            />

            <Stack screenOptions={{ headerShown: false }} />

            {/* Skjul knapper når tastaturet er oppe for å unngå at de svever */}
            {!keyboardVisible && (
                <>
                    {/* THEME BUTTON */}
                    <Pressable
                        onPress={() => setMode((m) => (m === "light" ? "dark" : "light"))}
                        style={[
                            styles.themeButton,
                            {
                                backgroundColor: colors.s2,
                                borderColor: colors.border,
                                bottom: Math.max(insets.bottom, Spacing.S),
                            },
                            Shadow.near,
                        ]}
                    >
                        <ThemeIcon mode={mode} size={24} color={colors.text} />
                    </Pressable>

                    {/* FAB (Delete or Create) */}
                    <Pressable
                        onPress={() => {
                            if (isInNote && noteId) {
                                Alert.alert("Delete note?", "This cannot be undone.", [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: () => {
                                            deleteNote(noteId);
                                            router.back();
                                        },
                                    },
                                ]);
                            } else {
                                router.push("/note");
                            }
                        }}
                        style={[
                            styles.fabButton,
                            {
                                backgroundColor: colors.s2,
                                borderColor: colors.border,
                                bottom: Math.max(insets.bottom, Spacing.S),
                            },
                            Shadow.far,
                        ]}
                    >
                        {isInNote ? (
                            <Svg width={30} height={30} viewBox="0 0 24 24">
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
                            <Svg width={32} height={32} viewBox="0 0 24 24">
                                <Path
                                    d="M12 5v14M5 12h14"
                                    stroke={colors.text}
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                />
                            </Svg>
                        )}
                    </Pressable>
                </>
            )}
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
        padding: 14,
        borderWidth: 1,
        borderRadius: Radius.input,
        zIndex: 10,
    },
    fabButton: {
        position: "absolute",
        right: Spacing.S,
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
});