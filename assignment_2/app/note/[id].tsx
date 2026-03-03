import {
    StyleSheet,
    TextInput,
    ScrollView,
    View,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/src/theme/ThemeContext";
import { useNotes } from "@/src/notes/NotesContext";
import { useAuthContext } from "@/hooks/auth-context";
import { useNoteScreenContext } from "@/hooks/note-screen-context";
import { ThemedText } from "@/components/themed-text";
import TopFade from "@/components/ui/TopFade";

export default function NoteScreen() {
    const { colors } = useTheme();
    const { isLoggedIn, isLoading, user } = useAuthContext();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getNoteById, refreshNotes } = useNotes();
    const note = id ? getNoteById(id) : undefined;

    useEffect(() => {
        if (!note) {
            refreshNotes();
        }
    }, [id, note]);

    if (isLoading) return null;
    if (!id) return <Redirect href="/" />;

    if (!note) {
        return <View style={[styles.flex, { backgroundColor: colors.bg }]} />;
    }

    return <NoteScreenContent noteId={id} />;
}

function NoteScreenContent({ noteId }: { noteId: string }) {
    const { colors } = useTheme();
    const { user, isLoggedIn } = useAuthContext();
    const { getNoteById, updateNote } = useNotes();
    const noteCtx = useNoteScreenContext();
    const insets = useSafeAreaInsets();
    const contentRef = useRef<TextInput>(null);
    const scrollRef = useRef<ScrollView>(null);

    const note = getNoteById(noteId);
    const [title, setTitle] = useState(note?.title ?? "");
    const [content, setContent] = useState(note?.content ?? "");
    const lastSavedRef = useRef({
        title: (note?.title ?? "").trim(),
        content: (note?.content ?? "").trim(),
    });

    // Sync from server only when the note itself changes (id swap / initial fetch),
    // never while the user is actively typing to avoid cursor jumps.
    useEffect(() => {
        if (!note) return;
        setTitle(note.title ?? "");
        setContent(note.content ?? "");
        lastSavedRef.current = {
            title: (note.title ?? "").trim(),
            content: (note.content ?? "").trim(),
        };
    }, [note?.id]);

    const canEdit = !!(
        note &&
        isLoggedIn &&
        user?.id &&
        (note.author_id ? note.author_id === user.id : true)
    );

    useEffect(() => {
        noteCtx.setMeta({
            noteId,
            canEdit,
        });
        return () => noteCtx.setMeta(null);
    }, [noteId, canEdit]);

    const ownerLabel = canEdit ? "you" : "other";

    const persist = useCallback(async () => {
        if (!note || !canEdit) return;
        const trimmedContent = content.trim();
        if (trimmedContent.length === 0) return;
        const trimmedTitle = title.trim();
        const nextTitle = trimmedTitle === "" ? "Untitled" : trimmedTitle;

        if (
            trimmedContent === lastSavedRef.current.content &&
            nextTitle === lastSavedRef.current.title
        ) {
            return;
        }

        try {
            await updateNote(noteId, { title: nextTitle, content: trimmedContent });
            lastSavedRef.current = { title: nextTitle, content: trimmedContent };
        } catch (err) {
            console.error("Save failed", err);
        }
    }, [note, canEdit, content, title, noteId, updateNote]);

    // Rolling save on every change (debounced slightly)
    useEffect(() => {
        if (!note || !canEdit) return;
        const t = setTimeout(() => {
            persist();
        }, 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, content, canEdit, noteId]);

    // Save once when leaving the screen
    useFocusEffect(
        useCallback(() => {
            return () => {
                persist();
            };
        }, [persist])
    );

    if (!note) {
        return <View style={[styles.flex, { backgroundColor: colors.bg }]} />;
    }

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
                        paddingBottom: insets.bottom + 80 // Plass til FAB
                    }
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
                    owner: {ownerLabel}
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
                    editable={canEdit}
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
                    editable={canEdit}
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
