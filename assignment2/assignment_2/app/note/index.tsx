import { useEffect, useRef, useState } from "react";
import { Redirect, router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/src/theme/ThemeContext";
import { useNotes } from "@/src/notes/NotesContext";
import { useAuthContext } from "@/hooks/auth-context";

export default function NoteCreateScreen() {
    const { colors } = useTheme();
    const { isLoggedIn, isLoading } = useAuthContext();
    const { createNote } = useNotes();
    const insets = useSafeAreaInsets();
    const contentRef = useRef<TextInput>(null);
    const createdRef = useRef(false);
    const isFocused = useIsFocused();
    const aliveRef = useRef(true);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (!isLoggedIn || isLoading) return;
        if (createdRef.current || !isFocused) return;
        const trimmed = content.trim();
        if (trimmed.length === 0) return;

        const t = setTimeout(async () => {
            if (!isFocused || !aliveRef.current) return;
            try {
                const note = await createNote({ title, content: trimmed });
                createdRef.current = true;
                if (isFocused && aliveRef.current) {
                    router.replace({ pathname: "/note/[id]", params: { id: note.id } });
                }
            } catch (err: any) {
                console.error("Create note failed", err);
            }
        }, 400);

        return () => clearTimeout(t);
    }, [title, content, createNote, isFocused, isLoggedIn, isLoading]);

    useEffect(() => {
        aliveRef.current = true;
        return () => {
            aliveRef.current = false;
        };
    }, []);

    if (isLoading) return null;
    if (!isLoggedIn) return <Redirect href="/login" />;

    return (
        <View style={[styles.screen, { backgroundColor: colors.bg }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    {
                        paddingTop: insets.top + Spacing.S,
                        paddingBottom: insets.bottom + 94,
                    },
                ]}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
                keyboardDismissMode="interactive"
            >
                <Text style={[styles.ownerText, { color: colors.textMuted }]}>owner: you</Text>

                <TextInput
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor={colors.textMuted}
                    style={[styles.titleInput, { color: colors.text }]}
                    returnKeyType="next"
                    onSubmitEditing={() => contentRef.current?.focus()}
                    blurOnSubmit={false}
                    selectionColor={colors.primary}
                />

                <TextInput
                    ref={contentRef}
                    value={content}
                    onChangeText={setContent}
                    multiline
                    textAlignVertical="top"
                    placeholder="Start writing..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.contentInput, { color: colors.text }]}
                    scrollEnabled={false}
                    selectionColor={colors.primary}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: Spacing.M + 4,
    },
    ownerText: {
        fontSize: 12,
        marginBottom: Spacing.S,
    },
    titleInput: {
        ...Typography.h1,
        marginBottom: Spacing.XS,
        includeFontPadding: false,
    },
    contentInput: {
        flex: 1,
        minHeight: 340,
        ...Typography.p,
    },
});
