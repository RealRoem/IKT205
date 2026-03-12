import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";

import NoteScreen from "@/app/note/[id]";

const mockSetMeta = jest.fn();
const mockRefreshNotes = jest.fn();
const mockUpdateNote = jest.fn();
const mockGetNoteImages = jest.fn(() => []);
const mockUploadNoteImage = jest.fn();

let mockHasLoadedNote = false;
let mockResolveFetch: (() => void) | null = null;

const mockNote = {
    id: "1",
    title: "Loaded title",
    content: "Loaded content",
    author_id: "user-1",
    created_at: "2026-03-01T10:00:00.000Z",
    updated_at: "2026-03-02T11:00:00.000Z",
};

jest.mock("expo-router", () => {
    const React = require("react");
    const { Text } = require("react-native");
    return {
        useLocalSearchParams: () => ({ id: "1" }),
        Redirect: ({ href }: { href: string }) => React.createElement(Text, { testID: "redirect-target" }, href),
    };
});

jest.mock("@react-navigation/native", () => ({
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
}));

jest.mock("@/hooks/auth-context", () => ({
    useAuthContext: () => ({
        isLoading: false,
        isLoggedIn: true,
        user: { id: "user-1" },
    }),
}));

jest.mock("@/hooks/note-screen-context", () => ({
    useNoteScreenContext: () => ({
        setMeta: mockSetMeta,
    }),
}));

jest.mock("@/src/notes/NotesContext", () => ({
    useNotes: () => ({
        getNoteById: () => (mockHasLoadedNote ? mockNote : undefined),
        refreshNotes: mockRefreshNotes,
        updateNote: mockUpdateNote,
        getNoteImages: mockGetNoteImages,
        uploadNoteImage: mockUploadNoteImage,
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
            s1: "#f0f0f0",
            danger: "#f00",
        },
    }),
}));

describe("Integration: loader while note fetch is in progress", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHasLoadedNote = false;
        mockResolveFetch = null;
        mockRefreshNotes.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    mockResolveFetch = () => {
                        mockHasLoadedNote = true;
                        resolve();
                    };
                })
        );
    });

    it("shows loader during fetch and hides it after note is available", async () => {
        const screen = render(<NoteScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("note-loader")).toBeTruthy();
        });

        await act(async () => {
            mockResolveFetch?.();
        });

        await waitFor(() => {
            expect(screen.queryByTestId("note-loader")).toBeNull();
        });

        expect(screen.getByDisplayValue("Loaded title")).toBeTruthy();
        expect(screen.getByDisplayValue("Loaded content")).toBeTruthy();
    });
});
