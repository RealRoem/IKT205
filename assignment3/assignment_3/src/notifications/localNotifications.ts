import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

let androidChannelReady = false;

const ensureAndroidChannel = async () => {
    if (Platform.OS !== "android" || androidChannelReady) return;

    await Notifications.setNotificationChannelAsync("notes", {
        name: "Notes",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 180, 120, 180],
        lightColor: "#2F80ED",
    });
    androidChannelReady = true;
};

export const requestLocalNotificationPermission = async () => {
    if (Platform.OS === "web") return false;

    await ensureAndroidChannel();

    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
        return true;
    }

    const requested = await Notifications.requestPermissionsAsync({
        ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
        },
    });

    return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
};

export const sendLocalNoteCreatedNotification = async () => {
    if (Platform.OS === "web") return;

    const granted = await requestLocalNotificationPermission();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Nytt notat",
            body: "Bruker har opprettet notat.",
            sound: true,
        },
        trigger: null,
    });
};
