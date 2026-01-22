// app/note/[id].tsx
import {
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation } from "expo-router";

import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/src/theme/ThemeContext";
import { useNotes } from "@/src/notes/NotesContext";

export default function NoteScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const contentRef = useRef<TextInput>(null);

    const { id } = useLocalSearchParams<{ id: string }>();
    const { getNoteById, updateNote, deleteNote } = useNotes();

    const note = id ? getNoteById(id) : undefined;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const navigation = useNavigation();

    // Init local state når note endres
    useEffect(() => {
        if (!note) return;
        setTitle(note.title);
        setContent(note.content);
    }, [note?.id]);

    // Auto-save (debounce)
    useEffect(() => {
        if (!id) return;
        if (!note) return;

        const t = setTimeout(() => {
            // Skriv kun hvis det faktisk er endring
            if (title !== note.title || content !== note.content) {
                updateNote(id, { title, content });
            }
        }, 300);

        return () => clearTimeout(t);
    }, [id, note, title, content, updateNote]);

    // Auto-delete hvis helt tomt når du forlater skjermen
    useEffect(() => {
        const unsub = navigation.addListener("beforeRemove", () => {
            const empty = !title.trim() && !content.trim();
            if (empty && id) deleteNote(id);
        });

        return unsub;
    }, [navigation, id, title, content, deleteNote]);

    // Hvis route id er ugyldig / note mangler (slettet)
    if (!id || !note) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]} />
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={insets.top}
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={[
                        styles.container,
                        { paddingHorizontal: Spacing.M, paddingBottom: Spacing.L },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    <Pressable onPress={() => contentRef.current?.focus()}>
                        <TextInput
                            placeholder="New title"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor={colors.textMuted}
                            style={[styles.title, { color: colors.text }]}
                            returnKeyType="next"
                            onSubmitEditing={() => contentRef.current?.focus()}
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
                        />
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    safe: { flex: 1 },
    container: { flexGrow: 1 },
    title: { ...Typography.h1, marginTop: Spacing.L },
    content: { minHeight: 300, ...Typography.p },
});
