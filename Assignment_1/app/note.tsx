import {
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from "react-native";
import {useRef, useState} from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/src/theme/ThemeContext";

import { useNotes } from "@/src/notes/NotesContext";


export default function NoteScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const contentRef = useRef<TextInput>(null);

    const { draft, setDraftTitle, setDraftContent } = useNotes();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={insets.top} // viktig: safe-area korrekt
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={[
                        styles.container,
                        {
                            paddingHorizontal: Spacing.M,
                            paddingBottom: Spacing.L,
                        },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    <Pressable onPress={() => contentRef.current?.focus()}>
                        <TextInput
                            placeholder="New title"
                            value={draft.title}
                            onChangeText={setDraftTitle}
                            placeholderTextColor={colors.textMuted}
                            style={[styles.title, { color: colors.text }]}
                            returnKeyType="next"
                            onSubmitEditing={() => contentRef.current?.focus()}
                        />

                        <TextInput
                            ref={contentRef}
                            value={draft.content}
                            onChangeText={setDraftContent}
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
    container: {
        flexGrow: 1,
        // NB: Ingen paddingTop her – SafeAreaView tar toppen
    },
    title: {
        ...Typography.h1,
        marginTop: Spacing.L, // fast “luft” under notch som aldri scroller under
        marginBottom: Spacing.S,
    },
    content: {
        minHeight: 300,
        ...Typography.p,
    },
});
