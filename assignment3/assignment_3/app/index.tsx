import { useEffect, useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import { type Note, useNotes } from "@/src/notes/NotesContext";
import { useTheme } from "@/src/theme/ThemeContext";
import { useAuthContext } from "@/hooks/auth-context";

const CARD_GAP = 12;

const getPreviewLines = (note: Note) => {
    const content = note.content ?? "";
    if (content.length === 0) return 2;

    const rows = content.split(/\r?\n/);
    const explicitRows = rows.length;

    // Add a small wrap estimate for very long lines while still prioritizing
    // user-entered line breaks (including blank/space-only rows).
    const wrappedExtraRows = rows.reduce((sum, row) => sum + Math.max(0, Math.ceil(row.length / 42) - 1), 0);
    return Math.max(2, Math.min(6, explicitRows + wrappedExtraRows));
};

const estimateCardWeight = (note: Note) => {
    const titleLen = note.title?.trim().length ?? 0;
    const previewLines = getPreviewLines(note);
    return 88 + previewLines * 28 + Math.min(24, titleLen * 0.6);
};

const pad2 = (value: number) => String(value).padStart(2, "0");

const formatNoteCardDate = (updatedAt: string | null, createdAt: string) => {
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

export default function HomeScreen() {
    const { colors } = useTheme();
    const { user } = useAuthContext();
    const { notes, refreshNotes, isLoading, statusMessage, clearStatus, getNoteCoverUrl } = useNotes();
    const [leftColumn, rightColumn] = useMemo(() => {
        const left: Note[] = [];
        const right: Note[] = [];
        let leftWeight = 0;
        let rightWeight = 0;

        for (const note of notes) {
            const weight = estimateCardWeight(note);
            if (leftWeight <= rightWeight) {
                left.push(note);
                leftWeight += weight;
            } else {
                right.push(note);
                rightWeight += weight;
            }
        }

        return [left, right];
    }, [notes]);

    useEffect(() => {
        if (!statusMessage) return;
        const t = setTimeout(() => clearStatus(), 1800);
        return () => clearTimeout(t);
    }, [statusMessage, clearStatus]);

    const renderCard = (item: Note) => {
        const isMine = !!(item.author_id && user?.id && item.author_id === user.id);
        const previewLines = getPreviewLines(item);
        const lastUpdated = formatNoteCardDate(item.updated_at, item.created_at);
        const coverUrl = getNoteCoverUrl(item.id);
        return (
            <Pressable
                key={item.id}
                onPress={() => {
                    router.push({ pathname: "/note/[id]", params: { id: item.id } });
                }}
                style={({ pressed }) => [
                    styles.card,
                    {
                        backgroundColor: colors.s1,
                        opacity: pressed ? 0.92 : 1,
                    },
                    Shadow.far,
                ]}
            >
                {coverUrl ? (
                    <Image
                        source={{ uri: coverUrl }}
                        style={styles.cardImage}
                        contentFit="cover"
                        transition={120}
                    />
                ) : null}

                <View style={styles.cardTopRow}>
                    <View style={styles.cardTopLeft}>
                        <View
                            style={[
                                styles.ownerDot,
                                {
                                    backgroundColor: isMine ? colors.primary : colors.textMuted,
                                },
                            ]}
                        />
                        <Text style={[styles.ownerText, { color: colors.textMuted }]}>
                            {isMine ? "Mine" : "Other"}
                        </Text>
                    </View>
                    <Text style={[styles.updatedText, { color: colors.textMuted }]}>{lastUpdated}</Text>
                </View>

                <Text style={[Typography.h2, styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title?.trim() || "Untitled"}
                </Text>

                <Text style={[styles.cardPreview, { color: colors.textMuted }]} numberOfLines={previewLines}>
                    {item.content?.trim() || "No content"}
                </Text>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]} edges={["top"]}>
            <View style={styles.header}>
                <Text style={[Typography.h1, { color: colors.text }]}>Jobb Notater</Text>
                {statusMessage ? (
                    <Text style={[styles.status, { color: colors.primary }]}>{statusMessage}</Text>
                ) : null}
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.listContent,
                    notes.length === 0 ? styles.emptyListContent : undefined,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={refreshNotes}
                        tintColor={colors.text}
                    />
                }
            >
                {notes.length === 0 ? (
                    <View
                        style={[
                            styles.emptyState,
                            {
                                backgroundColor: colors.s1,
                            },
                            Shadow.near,
                        ]}
                    >
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No notes</Text>
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            Tap + to create one.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.columnsWrap}>
                        <View style={styles.column}>{leftColumn.map(renderCard)}</View>
                        <View style={styles.column}>{rightColumn.map(renderCard)}</View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.M,
        paddingTop: Spacing.L,
        paddingBottom: Spacing.S,
        gap: 4,
    },
    status: {
        fontSize: 13,
        lineHeight: 18,
    },
    listContent: {
        paddingHorizontal: Spacing.M,
        paddingBottom: 100,
        gap: CARD_GAP,
    },
    columnsWrap: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: CARD_GAP,
    },
    column: {
        flex: 1,
    },
    emptyListContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
    emptyState: {
        borderRadius: Radius.card,
        padding: Spacing.M,
        gap: 6,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "700",
    },
    emptyText: {
        fontSize: 14,
        lineHeight: 20,
    },
    card: {
        borderRadius: Radius.card,
        padding: Spacing.S,
        minHeight: 108,
        marginBottom: CARD_GAP,
    },
    cardImage: {
        width: "100%",
        height: 138,
        borderRadius: 14,
        marginBottom: 10,
        backgroundColor: "rgba(120,120,120,0.12)",
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    cardTopLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    ownerDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
    },
    ownerText: {
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    updatedText: {
        fontSize: 11,
        fontWeight: "500",
    },
    cardTitle: {
        marginBottom: 6,
    },
    cardPreview: {
        fontSize: 14,
        lineHeight: 20,
    },
});
