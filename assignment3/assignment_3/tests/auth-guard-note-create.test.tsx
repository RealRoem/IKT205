import React from "react";
import { render } from "@testing-library/react-native";

import NoteCreateScreen from "@/app/note/index";

jest.mock("expo-router", () => {
    const React = require("react");
    const { Text } = require("react-native");
    return {
        router: { replace: jest.fn() },
        Redirect: ({ href }: { href: string }) => React.createElement(Text, { testID: "redirect-target" }, href),
    };
});

jest.mock("@react-navigation/native", () => ({
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
}));

jest.mock("@/src/notes/NotesContext", () => ({
    useNotes: () => ({
        createNote: jest.fn(),
        updateNote: jest.fn(),
    }),
}));

jest.mock("@/hooks/auth-context", () => ({
    useAuthContext: () => ({
        isLoggedIn: false,
        isLoading: false,
        user: null,
    }),
}));

jest.mock("@/src/theme/ThemeContext", () => ({
    useTheme: () => ({
        colors: {
            bg: "#fff",
            text: "#111",
            textMuted: "#666",
            primary: "#0af",
            border: "#ddd",
            elevated: "#f8f8f8",
        },
    }),
}));

describe("Auth guard: protected note creation screen", () => {
    it("renders redirect/login flow instead of protected content when user is not logged in", () => {
        const { getByTestId, queryByPlaceholderText } = render(<NoteCreateScreen />);

        expect(getByTestId("redirect-target")).toHaveTextContent("/login");
        expect(queryByPlaceholderText("Title")).toBeNull();
        expect(queryByPlaceholderText("Start writing...")).toBeNull();
    });
});
