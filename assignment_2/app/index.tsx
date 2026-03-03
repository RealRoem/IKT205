import { StyleSheet, FlatList, Pressable, Text, RefreshControl, View } from "react-native";
import { useTheme } from "@/src/theme/ThemeContext";
import { useNotes } from "@/src/notes/NotesContext";
import { Spacing, Radius, Shadow, Typography } from "@/constants/theme";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import TopFade from "@/components/ui/TopFade";

export default function HomeScreen() {
    const { colors } = useTheme();
    const { notes, refreshNotes, isLoading, statusMessage, clearStatus } = useNotes();

    useEffect(() => {
        if (!statusMessage) return;
        const t = setTimeout(() => clearStatus(), 2000);
        return () => clearTimeout(t);
    }, [statusMessage, clearStatus]);

    return (
        // edges={["top"]} sørger for at vi ikke får dobbelt spacing i bunnen pga layouten
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]} edges={["top"]}>
            <TopFade />
            <View style={styles.header}>
                <Text style={[Typography.h1, { color: colors.text }]}>Blodroed's Notes</Text>
                {statusMessage ? (
                    <Text style={[Typography.meta, { color: colors.primary }]}>
                        {statusMessage}
                    </Text>
                ) : null}
            </View>
            <FlatList
                data={notes}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingTop: Spacing.L } // Gir litt luft under statusbaren
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={refreshNotes}
                        tintColor={colors.text}
                    />
                }
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => {
                            router.push({ pathname: "/note/[id]", params: { id: item.id } });
                        }}
                        style={[
                            styles.card,
                            { backgroundColor: colors.s1, borderColor: colors.border },
                            Shadow.far,
                        ]}
                    >
                        <Text
                            style={[Typography.h2, { color: colors.text }]}
                            numberOfLines={1}
                        >
                            {item.title?.trim() || "Untitled"}
                        </Text>

                        <Text
                            style={[Typography.meta, { color: colors.textMuted }]}
                            numberOfLines={8}
                        >
                            {item.content}
                        </Text>
                    </Pressable>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        position: "relative",
    },
    header: {
        paddingHorizontal: Spacing.M,
        paddingTop: Spacing.L,
        paddingBottom: Spacing.S,
        gap: 4,
    },
    listContent: {
        padding: Spacing.S,
        paddingBottom: 100, // Gir plass til FAB-en i bunnen
    },
    columnWrapper: {
        gap: Spacing.XS,
        justifyContent: "space-between",
    },
    card: {
        flex: 0.48, // Litt mindre enn 0.5 for å sikre at gap fungerer på alle skjermer
        borderWidth: 1,
        borderRadius: Radius.card,
        padding: Spacing.S,
        minHeight: 120,
        marginBottom: Spacing.XS,
    },
});
