import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import NoteCreateScreen from "@/app/note/index";

const mockReplace = jest.fn();
const mockCreateNote = jest.fn();
const mockUpdateNote = jest.fn();

jest.mock("expo-router", () => {
    const React = require("react");
    const { Text } = require("react-native");
    return {
        router: {
            replace: (...args: unknown[]) => mockReplace(...args),
        },
        Redirect: ({ href }: { href: string }) => React.createElement(Text, { testID: "redirect-target" }, href),
    };
});

jest.mock("@react-navigation/native", () => ({
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
}));

jest.mock("@/hooks/auth-context", () => ({
    useAuthContext: () => ({
        isLoggedIn: true,
        isLoading: false,
        user: { id: "user-1" },
    }),
}));

jest.mock("@/src/notes/NotesContext", () => ({
    useNotes: () => ({
        createNote: mockCreateNote,
        updateNote: mockUpdateNote,
    }),
}));

jest.mock("@/src/theme/ThemeContext", () => ({
    useTheme: () => ({
        colors: {
            bg: "#000",
            text: "#fff",
            textMuted: "#aaa",
            primary: "#0af",
            border: "#444",
            elevated: "#111",
        },
    }),
}));

describe("Unit: note creation + navigation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCreateNote.mockResolvedValue({ id: "note-123" });
        mockUpdateNote.mockResolvedValue(undefined);
    });

    it("creates a note from valid input and navigates to note screen", async () => {
        const { getByPlaceholderText, getByText } = render(<NoteCreateScreen />);

        fireEvent.changeText(getByPlaceholderText("Title"), "  Mote  ");
        fireEvent.changeText(getByPlaceholderText("Start writing..."), "  Agenda  ");
        fireEvent.press(getByText("image"));

        await waitFor(() => {
            expect(mockCreateNote).toHaveBeenCalledWith({ title: "Mote", content: "Agenda" });
        });

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith({
                pathname: "/note/[id]",
                params: { id: "note-123", openImages: "1" },
            });
        });
    });
});
