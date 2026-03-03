import { useEffect, useRef, useState } from "react";
import { Redirect, router } from "expo-router";
import {
    StyleSheet,
    TextInput,
    ScrollView,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";

import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/src/theme/ThemeContext";
import { useNotes } from "@/src/notes/NotesContext";
import { useAuthContext } from "@/hooks/auth-context";
import { ThemedText } from "@/components/themed-text";
import TopFade from "@/components/ui/TopFade";

export default function NoteCreateScreen() {
    const { colors } = useTheme();
    const { isLoggedIn, isLoading, user } = useAuthContext();
    const { createNote } = useNotes();
    const insets = useSafeAreaInsets();
    const contentRef = useRef<TextInput>(null);
    const scrollRef = useRef<ScrollView>(null);
    const createdRef = useRef(false);
    const isFocused = useIsFocused();
    const aliveRef = useRef(true);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    if (isLoading) return null;
    if (!isLoggedIn) return <Redirect href="/login" />;

    useEffect(() => {
        if (createdRef.current || !isFocused) return;
        const trimmed = content.trim();
        if (trimmed.length === 0) {
            return;
        }

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
    }, [title, content, createNote, isFocused]);

    useEffect(() => {
        aliveRef.current = true;
        return () => {
            aliveRef.current = false;
        };
    }, []);

    return (
        <View style={[styles.flex, { backgroundColor: colors.bg }]}>
            <TopFade />
            <ScrollView
                ref={scrollRef}
                style={styles.flex}
                contentContainerStyle={[
                    styles.container,
                    {
                        paddingTop: insets.top,
                        paddingBottom: insets.bottom + 80,
                    },
                ]}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={true}
                keyboardDismissMode="interactive"
                scrollEventThrottle={16}
            >
                <ThemedText
                    style={[
                        styles.ownerText,
                        { color: colors.textMuted, top: insets.top + Spacing.S },
                    ]}
                >
                    owner: you
                </ThemedText>
                <TextInput
                    placeholder="New title"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor={colors.textMuted}
                    style={[styles.title, { color: colors.text }]}
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
                    style={[styles.content, { color: colors.text }]}
                    scrollEnabled={false}
                    selectionColor={colors.primary}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, position: "relative" },
    container: {
        flexGrow: 1,
        paddingHorizontal: Spacing.M,
    },
    title: {
        ...Typography.h1,
        paddingVertical: Spacing.M,
        includeFontPadding: false,
    },
    content: {
        flex: 1,
        minHeight: 300,
        ...Typography.p,
        lineHeight: 24,
    },
    ownerText: {
        fontSize: 11,
        position: "absolute",
        right: Spacing.S,
    },
});
