import { Redirect, Stack } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/src/theme/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/hooks/auth-context";

export default function LoginScreen() {
    const { colors } = useTheme();
    const { isLoggedIn, isLoading } = useAuthContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);

    const isErrorStatus = !!(
        status?.toLowerCase().includes("required") || status?.toLowerCase().includes("error")
    );
    const statusColor = isErrorStatus ? colors.danger : colors.textMuted;

    const onSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            setStatus("Email and password are required.");
            return;
        }

        setIsBusy(true);
        setStatus(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setStatus(error.message);
        setIsBusy(false);
    };

    const onSignUp = async () => {
        if (!email.trim() || !password.trim()) {
            setStatus("Email and password are required.");
            return;
        }

        setIsBusy(true);
        setStatus(null);
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            setStatus(error.message);
        } else if (data?.user && !data?.session) {
            setStatus("Check your email to confirm your account.");
        } else {
            setStatus("Account created.");
        }

        setIsBusy(false);
    };

    if (isLoading) return null;
    if (isLoggedIn) return <Redirect href="/" />;

    return (
        <>
            <Stack.Screen options={{ title: "Login", headerShown: false }} />

            <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="interactive"
                    >
                        <View
                            style={[
                                styles.card,
                                { backgroundColor: colors.s1 },
                                Shadow.far,
                            ]}
                        >
                            <Text style={[Typography.h2, { color: colors.text }]}>Sign in</Text>

                            <TextInput
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                placeholder="Email"
                                placeholderTextColor={colors.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                selectionColor={colors.primary}
                                style={[
                                    styles.input,
                                    {
                                        borderColor: colors.border,
                                        color: colors.text,
                                        backgroundColor: colors.bg,
                                    },
                                ]}
                            />

                            <TextInput
                                autoCapitalize="none"
                                autoCorrect={false}
                                secureTextEntry
                                placeholder="Password"
                                placeholderTextColor={colors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                selectionColor={colors.primary}
                                style={[
                                    styles.input,
                                    {
                                        borderColor: colors.border,
                                        color: colors.text,
                                        backgroundColor: colors.bg,
                                    },
                                ]}
                            />

                            <Pressable
                                onPress={onSignIn}
                                disabled={isBusy}
                                style={({ pressed }) => [
                                    styles.primaryButton,
                                    {
                                        backgroundColor: colors.primary,
                                        opacity: isBusy || pressed ? 0.88 : 1,
                                    },
                                ]}
                            >
                                <Text style={styles.primaryButtonText}>Sign in</Text>
                            </Pressable>

                            <Pressable
                                onPress={onSignUp}
                                disabled={isBusy}
                                style={({ pressed }) => [
                                    styles.secondaryButton,
                                    {
                                        borderColor: colors.border,
                                        opacity: isBusy || pressed ? 0.88 : 1,
                                    },
                                ]}
                            >
                                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                                    Create account
                                </Text>
                            </Pressable>

                            {status ? (
                                <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
                            ) : null}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    screen: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: Spacing.M,
        paddingVertical: Spacing.L,
    },
    card: {
        borderRadius: Radius.card,
        padding: Spacing.M,
        gap: Spacing.S,
    },
    input: {
        borderWidth: 1,
        borderRadius: Radius.input,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    primaryButton: {
        marginTop: 2,
        borderRadius: Radius.input,
        paddingVertical: 13,
        alignItems: "center",
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    secondaryButton: {
        borderWidth: 1,
        borderRadius: Radius.input,
        paddingVertical: 13,
        alignItems: "center",
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "700",
    },
    status: {
        fontSize: 13,
        lineHeight: 18,
    },
});
