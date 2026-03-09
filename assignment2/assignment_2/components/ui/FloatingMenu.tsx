import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { MenuIcon, SignOutIcon, ThemeIcon } from "@/components/ui/svg-icons";
import { Radius, Shadow, Spacing, type ThemeColors } from "@/constants/theme";

type Props = {
    colors: ThemeColors;
    mode: "light" | "dark";
    isLoggedIn: boolean;
    isOpen: boolean;
    bottomOffset: number;
    onToggle: () => void;
    onClose: () => void;
    onThemeToggle: () => void;
    onAuthPress: () => void;
};

export default function FloatingMenu({
    colors,
    mode,
    isLoggedIn,
    isOpen,
    bottomOffset,
    onToggle,
    onClose,
    onThemeToggle,
    onAuthPress,
}: Props) {
    return (
        <>
            <Pressable
                onPress={onToggle}
                style={({ pressed }) => [
                    styles.menuButton,
                    {
                        backgroundColor: colors.s1,
                        borderColor: colors.border,
                        bottom: bottomOffset,
                        opacity: pressed ? 0.86 : 1,
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
                                backgroundColor: colors.elevated,
                                borderColor: colors.border,
                                bottom: bottomOffset + 70,
                            },
                            Shadow.far,
                        ]}
                    >
                        <Pressable
                            onPress={onThemeToggle}
                            style={({ pressed }) => [
                                styles.menuRow,
                                {
                                    opacity: pressed ? 0.72 : 1,
                                },
                            ]}
                        >
                            <ThemeIcon mode={mode} color={colors.text} />
                            <View style={styles.menuText}>
                                <ThemedText style={styles.menuTitle}>Appearance</ThemedText>
                                <ThemedText style={[styles.menuSubtitle, { color: colors.textMuted }]}>
                                    {mode === "light" ? "Light" : "Dark"}
                                </ThemedText>
                            </View>
                        </Pressable>

                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

                        <Pressable
                            onPress={onAuthPress}
                            style={({ pressed }) => [
                                styles.menuRow,
                                {
                                    opacity: pressed ? 0.72 : 1,
                                },
                            ]}
                        >
                            <SignOutIcon color={colors.text} />
                            <View style={styles.menuText}>
                                <ThemedText style={styles.menuTitle}>{isLoggedIn ? "Sign out" : "Sign in"}</ThemedText>
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
        width: 52,
        height: 52,
        borderWidth: 1,
        borderRadius: Radius.input,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    menuBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.08)",
        zIndex: 9,
    },
    menuPanel: {
        position: "absolute",
        left: Spacing.S,
        width: 258,
        borderWidth: 1,
        borderRadius: Radius.card,
        padding: 10,
        gap: 10,
        zIndex: 11,
    },
    menuRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.S,
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    menuDivider: {
        height: 1,
        opacity: 0.5,
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    menuSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
});
