import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/src/theme/ThemeContext";

export default function ModalScreen() {
    const { colors } = useTheme();

    return (
        <View style={[styles.screen, { backgroundColor: colors.bg }]}>
            <LinearGradient
                colors={[colors.bg, colors.s2]}
                style={styles.backdrop}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.s1,
                        borderColor: colors.border,
                    },
                    Shadow.far,
                ]}
            >
                <Text style={[Typography.h2, { color: colors.text }]}>About this app</Text>
                <Text style={[styles.body, { color: colors.textMuted }]}>
                    Your notes are synced with your account and auto-saved while editing.
                </Text>

                <Link href="/" dismissTo asChild>
                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            {
                                backgroundColor: colors.primary,
                                borderColor: colors.primary,
                                opacity: pressed ? 0.88 : 1,
                            },
                        ]}
                    >
                        <Text style={styles.buttonText}>Back to notes</Text>
                    </Pressable>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: "center",
        padding: Spacing.M,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        borderWidth: 1,
        borderRadius: Radius.card,
        padding: Spacing.M,
        gap: Spacing.S,
    },
    body: {
        fontSize: 15,
        lineHeight: 22,
    },
    button: {
        marginTop: 2,
        borderWidth: 1,
        borderRadius: Radius.input,
        paddingVertical: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
});
