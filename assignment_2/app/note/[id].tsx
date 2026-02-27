// app/note/[id].tsx
import {
    StyleSheet,
    TextInput,
    ScrollView,
    Platform,
    View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/src/theme/ThemeContext";
import { useNotes } from "@/src/notes/NotesContext";

export default function NoteScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const contentRef = useRef<TextInput>(null);
    const scrollRef = useRef<ScrollView>(null);

    const { id } = useLocalSearchParams<{ id: string }>();
    const { getNoteById, updateNote } = useNotes();

    const note = id ? getNoteById(id) : undefined;
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (!note) return;
        setTitle(note.title);
        setContent(note.content);
    }, [note?.id]);

    useEffect(() => {
        if (!id || !note) return;
        const t = setTimeout(() => {
            if (title !== note.title || content !== note.content) {
                updateNote(id, { title, content });
            }
        }, 300);
        return () => clearTimeout(t);
    }, [id, title, content]);

    if (!id || !note) return <View style={[styles.flex, { backgroundColor: colors.bg }]} />;

    return (
        <View style={[styles.flex, { backgroundColor: colors.bg }]}>
            {/* BRUTAL FIX: Vi fjerner KeyboardAvoidingView.
               ScrollView med automaticallyAdjustKeyboardInsets håndterer
               plassen mye bedre alene uten å "dobbel-pushe".
            */}
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
                // Dette er den eneste proppen du trenger for smooth scroll på iOS
                automaticallyAdjustKeyboardInsets={true}
                keyboardDismissMode="interactive"
                scrollEventThrottle={16}
            >
                <TextInput
                    placeholder="New title"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor={colors.textMuted}
                    style={[styles.title, { color: colors.text }]}
                    returnKeyType="next"
                    onSubmitEditing={() => contentRef.current?.focus()}
                    blurOnSubmit={false}
                    selectionColor={colors.text}
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
                    selectionColor={colors.text}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
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
});