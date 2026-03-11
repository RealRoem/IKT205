import { Stack, router, usePathname } from "expo-router";
import { Alert, AppState, Keyboard, Platform, Pressable, StatusBar, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemeProvider, useTheme } from "@/src/theme/ThemeContext";
import { NotesProvider, useNotes } from "@/src/notes/NotesContext";
import { Radius, Shadow, Spacing } from "@/constants/theme";
import FloatingMenu from "@/components/ui/FloatingMenu";
import { useAuthContext } from "@/hooks/auth-context";
import AuthProvider from "@/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import { useNoteScreenContext, NoteScreenProvider } from "@/hooks/note-screen-context";
import { requestLocalNotificationPermission } from "@/src/notifications/localNotifications";
import { registerExpoPushTokenForUser } from "@/src/notifications/pushTokens";

function RootNavigator() {
    return <Stack screenOptions={{ headerShown: false }} />;
}

function LayoutContent() {
    const { mode, setMode, colors } = useTheme();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const { deleteNote } = useNotes();
    const noteScreen = useNoteScreenContext();
    const { isLoggedIn, user } = useAuthContext();
    const [menuOpen, setMenuOpen] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showEvent = Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow";
        const hideEvent = Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide";

        const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        void requestLocalNotificationPermission();
    }, []);

    useEffect(() => {
        if (!isLoggedIn || !user?.id) return;
        void registerExpoPushTokenForUser(user.id);
    }, [isLoggedIn, user?.id]);

    useEffect(() => {
        if (!isLoggedIn || !user?.id) return;

        const sub = AppState.addEventListener("change", (state) => {
            if (state !== "active") return;
            void registerExpoPushTokenForUser(user.id);
        });

        return () => sub.remove();
    }, [isLoggedIn, user?.id]);

    const isInNote = pathname.startsWith("/note/");
    const noteId = isInNote ? pathname.split("/")[2] : null;
    const controlsHidden = pathname === "/login" || pathname === "/modal";
    const canDelete = !!(isInNote && noteId && noteScreen?.meta?.canEdit);
    const bottomOffset = Math.max(insets.bottom + 8, Spacing.S);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    const toggleTheme = () => setMode((m) => (m === "light" ? "dark" : "light"));

    const handleAuthPress = async () => {
        setMenuOpen(false);

        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
        } else {
            router.replace("/login");
        }
    };

    const onFabPress = () => {
        if (canDelete && noteId) {
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
    };

    return (
        <View style={[styles.screen, { backgroundColor: colors.bg }]}>
            <StatusBar
                barStyle={mode === "dark" ? "light-content" : "dark-content"}
                backgroundColor="transparent"
                translucent
            />

            <RootNavigator />

            {!keyboardVisible && !controlsHidden && (
                <>
                    <FloatingMenu
                        colors={colors}
                        mode={mode}
                        isLoggedIn={isLoggedIn}
                        isOpen={menuOpen}
                        bottomOffset={bottomOffset}
                        onToggle={() => setMenuOpen((open) => !open)}
                        onClose={() => setMenuOpen(false)}
                        onThemeToggle={toggleTheme}
                        onAuthPress={handleAuthPress}
                    />

                    <Pressable
                        onPress={onFabPress}
                        style={({ pressed }) => [
                            styles.fabButton,
                            {
                                backgroundColor: canDelete ? colors.danger : colors.primary,
                                borderColor: colors.border,
                                bottom: bottomOffset,
                                opacity: pressed ? 0.88 : 1,
                            },
                            Shadow.far,
                        ]}
                    >
                        {canDelete ? (
                            <Svg width={24} height={24} viewBox="0 0 24 24">
                                <Path
                                    d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
                                    stroke="#FFFFFF"
                                    strokeWidth={2.1}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </Svg>
                        ) : (
                            <Svg width={24} height={24} viewBox="0 0 24 24">
                                <Path
                                    d="M12 5v14M5 12h14"
                                    stroke="#FFFFFF"
                                    strokeWidth={2.3}
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
        width: 58,
        height: 58,
        borderRadius: Radius.fab,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
});
