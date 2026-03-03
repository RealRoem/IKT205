import { Redirect, Stack } from 'expo-router'
import { Pressable, StyleSheet, TextInput, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/src/theme/ThemeContext'
import { Radius, Shadow, Spacing } from '@/constants/theme'
import { useAuthContext } from '@/hooks/auth-context'

export default function LoginScreen() {
    const { colors } = useTheme()
    const { isLoggedIn, isLoading } = useAuthContext()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState<string | null>(null)
    const [isBusy, setIsBusy] = useState(false)
    const statusColor =
        status?.toLowerCase().includes("required") || status?.toLowerCase().includes("error")
            ? colors.danger
            : colors.textMuted

    const onSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            setStatus("Email and password are required.");
            return;
        }
        setIsBusy(true)
        setStatus(null)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setStatus(error.message)
        }

        setIsBusy(false)
    }

    const onSignUp = async () => {
        if (!email.trim() || !password.trim()) {
            setStatus("Email and password are required.");
            return;
        }
        setIsBusy(true)
        setStatus(null)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setStatus(error.message)
        } else if (data?.user && !data?.session) {
            setStatus('Check your email to confirm your account.')
        } else {
            setStatus('Signed up successfully.')
        }

        setIsBusy(false)
    }

    if (isLoading) {
        return null
    }

    if (isLoggedIn) {
        return <Redirect href="/" />
    }

    return (
        <>
            <Stack.Screen options={{ title: 'Login' }} />
            <ThemedView style={[styles.screen, { backgroundColor: colors.bg }]}>
                <LinearGradient
                    colors={[colors.s1, colors.bg]}
                    style={styles.backdrop}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 0}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="interactive"
                        showsVerticalScrollIndicator={false}
                    >
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
                            <ThemedText type="title">Welcome back</ThemedText>
                            <ThemedText style={styles.subtitle}>Sign in or create an account</ThemedText>

                            <View style={styles.form}>
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
                                            backgroundColor: colors.bg,
                                            borderColor: colors.border,
                                            color: colors.text,
                                        },
                                        Shadow.near,
                                    ]}
                                />
                                <TextInput
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    placeholder="Password"
                                    placeholderTextColor={colors.textMuted}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    selectionColor={colors.primary}
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.bg,
                                            borderColor: colors.border,
                                            color: colors.text,
                                        },
                                        Shadow.near,
                                    ]}
                                />
                            </View>

                            <View style={styles.actions}>
                                <Pressable
                                    onPress={onSignIn}
                                    disabled={isBusy}
                                    style={[
                                        styles.button,
                                        {
                                            backgroundColor: colors.primary,
                                            borderColor: colors.border,
                                            opacity: isBusy ? 0.7 : 1,
                                        },
                                        Shadow.near,
                                    ]}
                        >
                            <ThemedText style={[styles.buttonText, { color: colors.bg }]}>Sign in</ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={onSignUp}
                                    disabled={isBusy}
                                    style={[
                                        styles.buttonGhost,
                                        {
                                            borderColor: colors.border,
                                            backgroundColor: colors.s1,
                                    opacity: isBusy ? 0.7 : 1,
                                },
                                Shadow.near,
                            ]}
                        >
                            <ThemedText style={[styles.buttonTextAlt, { color: colors.text }]}>
                                Create account
                            </ThemedText>
                        </Pressable>
                            </View>

                {status ? (
                    <ThemedText style={[styles.status, { color: statusColor }]}>{status}</ThemedText>
                ) : null}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ThemedView>
        </>
    )
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    screen: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.M,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        borderWidth: 1,
        borderRadius: Radius.card,
        padding: Spacing.L,
        gap: Spacing.S,
    },
    subtitle: {
        marginBottom: Spacing.M,
        opacity: 0.9,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    form: {
        gap: Spacing.S,
    },
    input: {
        borderWidth: 1,
        borderRadius: Radius.input,
        paddingHorizontal: Spacing.S,
        paddingVertical: 12,
        fontSize: 16,
    },
    actions: {
        marginTop: Spacing.S,
        gap: Spacing.S,
    },
    button: {
        borderWidth: 1,
        borderRadius: Radius.input,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonGhost: {
        borderWidth: 1,
        borderRadius: Radius.input,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: '700',
    },
    buttonTextAlt: {
        fontWeight: '700',
    },
    status: {
        marginTop: Spacing.S,
    },
})
