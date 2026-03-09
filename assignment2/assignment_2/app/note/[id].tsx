import { useCallback, useEffect, useRef, useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/src/theme/ThemeContext";
import { useNotes } from "@/src/notes/NotesContext";
import { useAuthContext } from "@/hooks/auth-context";
import { useNoteScreenContext } from "@/hooks/note-screen-context";

const pad2 = (value: number) => String(value).padStart(2, "0");

const formatLastEdited = (updatedAt: string | null, createdAt: string) => {
    const source = updatedAt ?? createdAt;
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return "--:--";

    const now = new Date();
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) {
        return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    }

    return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${pad2(date.getFullYear() % 100)}`;
};

export default function NoteScreen() {
    const { colors } = useTheme();
    const { isLoading } = useAuthContext();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getNoteById, refreshNotes } = useNotes();
    const note = id ? getNoteById(id) : undefined;
    const requestedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!id || note) return;
        if (requestedRef.current === id) return;
        requestedRef.current = id;
        refreshNotes();
    }, [id, note, refreshNotes]);

    if (isLoading) return null;
    if (!id) return <Redirect href="/" />;
    if (!note) return <View style={[styles.screen, { backgroundColor: colors.bg }]} />;

    return <NoteScreenContent noteId={id} />;
}

function NoteScreenContent({ noteId }: { noteId: string }) {
    const { colors } = useTheme();
    const { user, isLoggedIn } = useAuthContext();
    const { getNoteById, updateNote } = useNotes();
    const { setMeta } = useNoteScreenContext();
    const insets = useSafeAreaInsets();
    const contentRef = useRef<TextInput>(null);

    const note = getNoteById(noteId);
    const [title, setTitle] = useState(note?.title ?? "");
    const [content, setContent] = useState(note?.content ?? "");
    const syncedNoteIdRef = useRef<string | null>(null);
    const lastSavedRef = useRef({
        title: (note?.title ?? "").trim(),
        content: (note?.content ?? "").trim(),
    });

    useEffect(() => {
        if (!note) return;
        if (syncedNoteIdRef.current === note.id) return;
        syncedNoteIdRef.current = note.id;

        setTitle(note.title ?? "");
        setContent(note.content ?? "");
        lastSavedRef.current = {
            title: (note.title ?? "").trim(),
            content: (note.content ?? "").trim(),
        };
    }, [note]);

    const canEdit = !!(note && isLoggedIn && user?.id && (note.author_id ? note.author_id === user.id : true));

    useEffect(() => {
        setMeta((prev) => {
            if (prev?.noteId === noteId && prev.canEdit === canEdit) return prev;
            return { noteId, canEdit };
        });

        return () =>
            setMeta((prev) => {
                if (!prev || prev.noteId !== noteId) return prev;
                return null;
            });
    }, [setMeta, noteId, canEdit]);

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

    useEffect(() => {
        if (!note || !canEdit) return;
        const t = setTimeout(() => persist(), 250);
        return () => clearTimeout(t);
    }, [title, content, canEdit, note, persist]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                persist();
            };
        }, [persist])
    );

    if (!note) return <View style={[styles.screen, { backgroundColor: colors.bg }]} />;

    const ownerLabel = canEdit ? "owner: you" : "owner: other";
    const lastEditedLabel = `sist endret ${formatLastEdited(note.updated_at, note.created_at)}`;

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
                <View style={styles.metaRow}>
                    <Text style={[styles.ownerText, { color: colors.textMuted }]}>{ownerLabel}</Text>
                    <Text style={[styles.ownerText, styles.lastEditedText, { color: colors.textMuted }]}>
                        {lastEditedLabel}
                    </Text>
                </View>

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
                    style={[styles.contentInput, { color: colors.text }]}
                    scrollEnabled={false}
                    selectionColor={colors.primary}
                    editable={canEdit}
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
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.S,
    },
    lastEditedText: {
        textAlign: "right",
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
