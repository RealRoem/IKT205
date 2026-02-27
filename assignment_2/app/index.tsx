import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import { useTheme } from "@/src/theme/ThemeContext";
import { useNotes } from "@/src/notes/NotesContext";
import { Spacing, Radius, Shadow, Typography } from "@/constants/theme";
import { router } from "expo-router";
// Importer SafeAreaView
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    const { colors } = useTheme();
    const { notes } = useNotes();

    return (
        // edges={["top"]} sørger for at vi ikke får dobbelt spacing i bunnen pga layouten
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]} edges={["top"]}>
            <FlatList
                data={notes}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingTop: Spacing.L } // Gir litt luft under statusbaren
                ]}
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
                            {item.title || "Untitled"}
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