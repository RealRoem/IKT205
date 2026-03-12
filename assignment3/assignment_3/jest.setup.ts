import "@testing-library/jest-native/extend-expect";

jest.mock("expo-image", () => {
    const React = require("react");
    const { Image } = require("react-native");
    return {
        Image: (props: any) => React.createElement(Image, props),
    };
});

jest.mock("expo-image-picker", () => ({
    UIImagePickerPreferredAssetRepresentationMode: { Compatible: "compatible" },
    MediaTypeOptions: { Images: "images" },
    requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
    requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
    launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
    launchCameraAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
}));

jest.mock("react-native-safe-area-context", () => {
    const actual = jest.requireActual("react-native-safe-area-context");
    return {
        ...actual,
        useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    };
});
