import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";

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
    const openAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(openAnim, {
            toValue: isOpen ? 1 : 0,
            duration: isOpen ? 360 : 280,
            easing: isOpen ? Easing.bezier(0.22, 1, 0.36, 1) : Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
        }).start();
    }, [isOpen, openAnim]);

    const panelTranslateY = openAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 0],
    });
    const panelScale = openAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.94, 1],
    });
    const backdropOpacity = openAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });
    const triggerScale = openAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.015],
    });

    return (
        <>
            <Animated.View
                style={[
                    styles.menuButtonWrap,
                    {
                        bottom: bottomOffset,
                        transform: [{ scale: triggerScale }],
                    },
                ]}
            >
                <Pressable
                    onPress={onToggle}
                    style={({ pressed }) => [
                        styles.menuButton,
                        {
                            backgroundColor: colors.s1,
                            opacity: pressed ? 0.92 : 1,
                            transform: [{ scale: pressed ? 0.975 : 1 }],
                        },
                        styles.menuButtonDepth,
                        Shadow.near,
                    ]}
                >
                    <MenuIcon color={colors.text} />
                </Pressable>
            </Animated.View>

            <Animated.View
                pointerEvents={isOpen ? "auto" : "none"}
                style={[
                    styles.menuBackdrop,
                    {
                        opacity: backdropOpacity,
                    },
                ]}
            >
                <Pressable onPress={onClose} style={styles.menuBackdropPressable} />
            </Animated.View>

            <Animated.View
                pointerEvents={isOpen ? "auto" : "none"}
                style={[
                    styles.menuPanelWrap,
                    {
                        bottom: bottomOffset + 70,
                        opacity: openAnim,
                        transform: [{ translateY: panelTranslateY }, { scale: panelScale }],
                    },
                ]}
            >
                <View
                    style={[
                        styles.menuPanel,
                        {
                            backgroundColor: colors.elevated,
                        },
                        styles.menuPanelDepth,
                        Shadow.far,
                    ]}
                >
                    <Pressable
                        onPress={onThemeToggle}
                        style={({ pressed }) => [
                            styles.menuRow,
                            {
                                opacity: pressed ? 0.8 : 1,
                                transform: [{ scale: pressed ? 0.985 : 1 }],
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
                                opacity: pressed ? 0.8 : 1,
                                transform: [{ scale: pressed ? 0.985 : 1 }],
                            },
                        ]}
                    >
                        <SignOutIcon color={colors.text} />
                        <View style={styles.menuText}>
                            <ThemedText style={styles.menuTitle}>{isLoggedIn ? "Sign out" : "Sign in"}</ThemedText>
                        </View>
                    </Pressable>
                </View>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    menuButtonWrap: {
        position: "absolute",
        left: Spacing.S,
        zIndex: 60,
    },
    menuButton: {
        width: 52,
        height: 52,
        borderRadius: Radius.input,
        alignItems: "center",
        justifyContent: "center",
    },
    menuButtonDepth: {
        shadowColor: "#0A1220",
        shadowOpacity: 0.28,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
    },
    menuBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.22)",
        zIndex: 58,
    },
    menuBackdropPressable: {
        ...StyleSheet.absoluteFillObject,
    },
    menuPanelWrap: {
        position: "absolute",
        left: Spacing.S,
        zIndex: 61,
    },
    menuPanel: {
        width: 258,
        borderRadius: Radius.card,
        padding: 10,
        gap: 10,
    },
    menuPanelDepth: {
        shadowColor: "#070D17",
        shadowOpacity: 0.3,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 18 },
        elevation: 16,
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
