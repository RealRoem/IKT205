import {View, StyleSheet, FlatList, Pressable} from "react-native";
import { useTheme } from "@/src/theme/ThemeContext";
import { useNotes } from "@/src/notes/NotesContext";
import { Spacing, Radius, Shadow, Typography } from "@/constants/theme";
import { Text } from "react-native";
import { router } from "expo-router";



export default function HomeScreen() {
    const { colors } = useTheme();
    const { notes } = useNotes();

    return (
        <View style={[styles.screen, { backgroundColor: colors.bg }]}>
            <FlatList
                data={notes}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ gap: Spacing.XS }}
                contentContainerStyle={{
                    padding: Spacing.S,
                    gap: Spacing.XS,
                    paddingTop: Spacing.L
                }}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => {
                            // naviger til edit med id
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
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    card: {
        flex: 1,
        borderWidth: 1,
        borderRadius: Radius.card,
        padding: Spacing.S,
        minHeight: 120,
    },
});
