import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

import { supabase } from "@/lib/supabase";
import { requestLocalNotificationPermission } from "@/src/notifications/localNotifications";

const PUSH_TOKEN_TABLE_CANDIDATES = [
    process.env.EXPO_PUBLIC_PUSH_TOKEN_TABLE,
    "PushToken",
    "push_tokens",
].filter(Boolean) as string[];

const getProjectId = () => {
    return (
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId ??
        null
    );
};

export const registerExpoPushTokenForUser = async (userId: string) => {
    if (!userId) return;

    // Expo Go (store client) on Android does not support remote push tokens.
    if (Constants.executionEnvironment === "storeClient") {
        console.log("Push token registration skipped: Expo Go detected. Use a development build for remote push.");
        return;
    }

    const granted = await requestLocalNotificationPermission();
    if (!granted) {
        console.log("Push token registration skipped: notification permission not granted.");
        return;
    }

    const projectId = getProjectId();
    if (!projectId) {
        console.warn("Push token registration skipped: missing EAS projectId.");
        return;
    }

    let token = "";
    try {
        const result = await Notifications.getExpoPushTokenAsync({ projectId });
        token = result.data;
    } catch (error) {
        console.error("Failed to fetch Expo push token:", error);
        return;
    }

    if (!token) {
        console.warn("Push token registration skipped: empty token.");
        return;
    }

    let saved = false;
    let lastError: any = null;

    for (const table of PUSH_TOKEN_TABLE_CANDIDATES) {
        const { error } = await supabase
            .from(table)
            .upsert(
                {
                    user_id: userId,
                    expo_push_token: token,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
            );

        if (!error) {
            saved = true;
            break;
        }
        lastError = error;
    }

    if (!saved) {
        console.error("Failed to upsert push token:", lastError);
    } else {
        console.log("Expo push token saved for user.");
    }
};

