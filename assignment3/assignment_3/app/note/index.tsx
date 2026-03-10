import { useCallback, useEffect, useRef, useState } from "react";
import { Redirect, router } from "expo-router";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Shadow, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/src/theme/ThemeContext";
import { useNotes } from "@/src/notes/NotesContext";
import { useAuthContext } from "@/hooks/auth-context";

export default function NoteCreateScreen() {
    const { colors } = useTheme();
    const { isLoggedIn, isLoading } = useAuthContext();
    const { createNote, updateNote } = useNotes();
    const insets = useSafeAreaInsets();
    const contentRef = useRef<TextInput>(null);
    const createdRef = useRef(false);
    const creatingRef = useRef(false);
    const createdNoteIdRef = useRef<string | null>(null);
    const lastSavedRef = useRef({ title: "", content: "" });
    const latestDraftRef = useRef({ title: "", content: "" });
    const isFocused = useIsFocused();
    const aliveRef = useRef(true);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        latestDraftRef.current = { title, content };
    }, [title, content]);

    const maybeCreateNote = useCallback(async () => {
        if (!isLoggedIn || isLoading) return;
        if (createdRef.current || creatingRef.current || !isFocused || !aliveRef.current) return;

        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();
        if (trimmedTitle.length === 0 && trimmedContent.length === 0) return;

        creatingRef.current = true;
        try {
            const note = await createNote({ title: trimmedTitle, content: trimmedContent });
            createdRef.current = true;
            createdNoteIdRef.current = note.id;
            lastSavedRef.current = { title: trimmedTitle, content: trimmedContent };

            // If user typed more while create request was in-flight, persist the latest draft immediately.
            const latestTitle = latestDraftRef.current.title.trim();
            const latestContent = latestDraftRef.current.content.trim();
            if (latestTitle !== trimmedTitle || latestContent !== trimmedContent) {
                await updateNote(note.id, { title: latestTitle, content: latestContent });
                lastSavedRef.current = { title: latestTitle, content: latestContent };
            }
        } catch (err: any) {
            console.error("Create note failed", err);
        } finally {
            creatingRef.current = false;
        }
    }, [content, createNote, isFocused, isLoading, isLoggedIn, title, updateNote]);

    const ensureNoteForImages = useCallback(async () => {
        if (!isLoggedIn || isLoading || creatingRef.current) return null;

        if (createdRef.current && createdNoteIdRef.current) return createdNoteIdRef.current;

        const initialTitle = latestDraftRef.current.title.trim();
        const initialContent = latestDraftRef.current.content.trim();

        creatingRef.current = true;
        try {
            const note = await createNote({ title: initialTitle, content: initialContent });
            createdRef.current = true;
            createdNoteIdRef.current = note.id;
            lastSavedRef.current = { title: initialTitle, content: initialContent };

            const latestTitle = latestDraftRef.current.title.trim();
            const latestContent = latestDraftRef.current.content.trim();
            if (latestTitle !== initialTitle || latestContent !== initialContent) {
                await updateNote(note.id, { title: latestTitle, content: latestContent });
                lastSavedRef.current = { title: latestTitle, content: latestContent };
            }

            return note.id;
        } catch (err: any) {
            console.error("Create note for image upload failed", err);
            return null;
        } finally {
            creatingRef.current = false;
        }
    }, [createNote, isLoading, isLoggedIn, updateNote]);

    const openImagesFromCreate = useCallback(async () => {
        const noteId = await ensureNoteForImages();
        if (!noteId || !aliveRef.current) return;
        router.replace({ pathname: "/note/[id]", params: { id: noteId, openImages: "1" } });
    }, [ensureNoteForImages]);

    const persistCreatedNote = useCallback(async () => {
        if (!isLoggedIn || isLoading) return;
        if (!createdRef.current || creatingRef.current) return;
        const noteId = createdNoteIdRef.current;
        if (!noteId) return;

        const nextTitle = latestDraftRef.current.title.trim();
        const nextContent = latestDraftRef.current.content.trim();
        if (nextTitle === lastSavedRef.current.title && nextContent === lastSavedRef.current.content) return;

        creatingRef.current = true;
        try {
            await updateNote(noteId, { title: nextTitle, content: nextContent });
            lastSavedRef.current = { title: nextTitle, content: nextContent };
        } catch (err: any) {
            console.error("Update note failed", err);
        } finally {
            creatingRef.current = false;
        }
    }, [isLoading, isLoggedIn, updateNote]);

    useEffect(() => {
        if (!isLoggedIn || isLoading) return;
        if (!isFocused) return;

        const t = setTimeout(async () => {
            if (!createdRef.current) {
                const trimmedTitle = latestDraftRef.current.title.trim();
                const trimmedContent = latestDraftRef.current.content.trim();
                if (trimmedTitle.length === 0 && trimmedContent.length === 0) return;
                await maybeCreateNote();
                return;
            }
            await persistCreatedNote();
        }, createdRef.current ? 280 : 400);

        return () => clearTimeout(t);
    }, [title, content, maybeCreateNote, persistCreatedNote, isFocused, isLoggedIn, isLoading]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                if (createdRef.current) {
                    void persistCreatedNote();
                    return;
                }
                void maybeCreateNote();
            };
        }, [maybeCreateNote, persistCreatedNote])
    );

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

            <View style={[styles.imagesHandleWrap, { top: insets.top + 156 }]}>
                <Pressable
                    onPress={openImagesFromCreate}
                    style={({ pressed }) => [
                        styles.imagesHandle,
                        {
                            borderColor: colors.border,
                            backgroundColor: colors.elevated,
                            opacity: pressed ? 0.9 : 1,
                        },
                        Shadow.near,
                    ]}
                >
                    <Text style={[styles.imagesHandleText, { color: colors.text }]}>image</Text>
                </Pressable>
            </View>
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
        paddingRight: Spacing.XL,
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
    imagesHandleWrap: {
        position: "absolute",
        right: 0,
        zIndex: 20,
    },
    imagesHandle: {
        width: 50,
        minHeight: 100,
        borderTopLeftRadius: 22,
        borderBottomLeftRadius: 22,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderRightWidth: 0,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 5,
    },
    imagesHandleText: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.8,
        lineHeight: 13,
        textAlign: "center",
        transform: [{ rotate: "-90deg" }],
    },
});
