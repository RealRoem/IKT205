import { Stack, router, usePathname } from "expo-router";
import { StyleSheet, Pressable, Alert, StatusBar, Keyboard, Platform, View } from "react-native"; // Lagt til Keyboard, Platform, View
import { useState, useEffect } from "react"; // Lagt til useState, useEffect
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemeProvider, useTheme } from "@/src/theme/ThemeContext";
import { NotesProvider, useNotes } from "@/src/notes/NotesContext";
import { Shadow, Spacing, Radius } from "@/constants/theme";
import FloatingMenu from "@/components/ui/FloatingMenu";

import { useAuthContext } from "@/hooks/auth-context";
import AuthProvider from "@/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import { useNoteScreenContext, NoteScreenProvider } from "@/hooks/note-screen-context";

function RootNavigator() {
    return <Stack screenOptions={{ headerShown: false }} />
}

function LayoutContent() {
    const { mode, setMode, colors } = useTheme();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const { deleteNote } = useNotes();
    const noteScreen = useNoteScreenContext();
    const { isLoggedIn } = useAuthContext();
    const [menuOpen, setMenuOpen] = useState(false);

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
    const toggleTheme = () => setMode((m) => (m === "light" ? "dark" : "light"));
    const handleSignOut = async () => {
        setMenuOpen(false);
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
        } else {
            router.replace("/login");
        }
    };

    return (
        <View style={[styles.screen, { backgroundColor: colors.bg }]}>
            {/* Statusbar fiks for Android & iOS */}
            <StatusBar
                barStyle={mode === "dark" ? "light-content" : "dark-content"}
                backgroundColor="transparent"
                translucent={true}
            />

            <RootNavigator />

            {/* Skjul knapper når tastaturet er oppe for å unngå at de svever */}
            {!keyboardVisible && (
                <>
                    {isLoggedIn ? (
                        <FloatingMenu
                            colors={colors}
                            mode={mode}
                            isOpen={menuOpen}
                            bottomOffset={Math.max(insets.bottom, Spacing.S)}
                            onToggle={() => setMenuOpen((open) => !open)}
                            onClose={() => setMenuOpen(false)}
                            onThemeToggle={toggleTheme}
                            onSignOut={handleSignOut}
                        />
                    ) : null}

                    {/* FAB (Delete or Create) */}
                    <Pressable
                        onPress={() => {
                            if (isInNote && noteId && noteScreen?.meta?.canEdit) {
                                Alert.alert("Delete note?", "This cannot be undone.", [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: async () => {
                                            await deleteNote(noteId);
                                            router.back();
                                        },
                                    },
                                ]);
                                return;
                            }

                            if (!isLoggedIn) {
                                router.push("/login");
                                return;
                            }
                            router.push("/note");
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
                        {isInNote && noteScreen?.meta?.canEdit ? (
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
        <AuthProvider>
            <ThemeProvider>
                <NotesProvider>
                    <NoteScreenProvider>
                        <LayoutContent />
                    </NoteScreenProvider>
                </NotesProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    fabButton: {
        position: "absolute",
        right: Spacing.S,
        width: 78,
        height: 78,
        borderRadius: 22,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
});
