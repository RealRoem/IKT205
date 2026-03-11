import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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

    const granted = await requestLocalNotificationPermission();
    if (!granted) {
        console.log("Push token registration skipped: notification permission not granted.");
        return;
    }

    const projectId = getProjectId();
    if (!projectId) {
        console.warn(
            "Push token registration warning: missing EAS projectId, attempting token fetch without explicit projectId."
        );
    }

    let token = "";
    try {
        const result = projectId
            ? await Notifications.getExpoPushTokenAsync({ projectId })
            : await Notifications.getExpoPushTokenAsync();
        token = result.data;
    } catch (error) {
        if (Constants.executionEnvironment === "storeClient" && Platform.OS === "android") {
            console.warn(
                "Failed to fetch Expo push token on Android Expo Go. Use a development build for reliable remote push.",
                error
            );
            return;
        }
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
        const payload = {
            user_id: userId,
            expo_push_token: token,
            updated_at: new Date().toISOString(),
        };

        const composite = await supabase.from(table).upsert(payload, { onConflict: "user_id,expo_push_token" });
        if (!composite.error) {
            saved = true;
            break;
        }

        const byUser = await supabase.from(table).upsert(payload, { onConflict: "user_id" });
        if (!byUser.error) {
            saved = true;
            break;
        }

        lastError = byUser.error ?? composite.error;
    }

    if (!saved) {
        console.error("Failed to upsert push token:", lastError);
    } else {
        console.log("Expo push token saved for user.");
    }
};
