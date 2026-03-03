import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { MenuIcon, SignOutIcon, ThemeIcon } from "@/components/ui/svg-icons";
import { Radius, Shadow, Spacing, type ThemeColors } from "@/constants/theme";

type Props = {
    colors: ThemeColors;
    mode: "light" | "dark";
    isOpen: boolean;
    bottomOffset: number;
    onToggle: () => void;
    onClose: () => void;
    onThemeToggle: () => void;
    onSignOut: () => void;
};

export default function FloatingMenu({
    colors,
    mode,
    isOpen,
    bottomOffset,
    onToggle,
    onClose,
    onThemeToggle,
    onSignOut,
}: Props) {
    return (
        <>
            <Pressable
                onPress={onToggle}
                style={[
                    styles.menuButton,
                    {
                        backgroundColor: colors.s2,
                        borderColor: colors.border,
                        bottom: bottomOffset,
                    },
                    Shadow.near,
                ]}
            >
                <MenuIcon color={colors.text} />
            </Pressable>

            {isOpen && (
                <>
                    <Pressable onPress={onClose} style={styles.menuBackdrop} />
                    <View
                        style={[
                            styles.menuPanel,
                            {
                                backgroundColor: colors.s2,
                                borderColor: colors.border,
                                bottom: bottomOffset + 62,
                            },
                            Shadow.far,
                        ]}
                    >
                        <Pressable onPress={onThemeToggle} style={styles.menuRow}>
                            <ThemeIcon mode={mode} color={colors.text} />
                            <View style={styles.menuText}>
                                <ThemedText style={styles.menuTitle}>Theme</ThemedText>
                                <ThemedText style={[styles.menuSubtitle, { color: colors.textMuted }]}>
                                    {mode === "light" ? "Light" : "Dark"}
                                </ThemedText>
                            </View>
                        </Pressable>

                        <Pressable onPress={onSignOut} style={styles.menuRow}>
                            <SignOutIcon color={colors.text} />
                            <View style={styles.menuText}>
                                <ThemedText style={styles.menuTitle}>Sign out</ThemedText>
                            </View>
                        </Pressable>
                    </View>
                </>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    menuButton: {
        position: "absolute",
        left: Spacing.S,
        padding: 14,
        borderWidth: 1,
        borderRadius: Radius.input,
        zIndex: 10,
    },
    menuBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9,
    },
    menuPanel: {
        position: "absolute",
        left: Spacing.S,
        width: 240,
        borderWidth: 1,
        borderRadius: Radius.card,
        padding: Spacing.S,
        gap: Spacing.S,
        zIndex: 11,
    },
    menuRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.S,
        paddingVertical: 6,
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
});
