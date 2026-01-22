// src/notes/NotesContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";

export type Note = {
    id: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
};

type NotesContextType = {
    notes: Note[];
    createNote: () => Note; // lager tom note og returnerer den
    deleteNote: (id: string) => void;
    updateNote: (id: string, patch: Partial<Pick<Note, "title" | "content">>) => void;
    getNoteById: (id: string) => Note | undefined;
};

const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
    const [notes, setNotes] = useState<Note[]>([]);

    const createNote = () => {
        const now = Date.now();
        const note: Note = {
            id: now.toString(),
            createdAt: now,
            updatedAt: now,
            title: "",
            content: "",
        };
        setNotes((prev) => [note, ...prev]);
        return note;
    };

    const deleteNote = (id: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
    };

    const getNoteById = (id: string) => notes.find((n) => n.id === id);

    const updateNote = (id: string, patch: Partial<Pick<Note, "title" | "content">>) => {
        setNotes((prev) =>
            prev.map((n) =>
                n.id === id
                    ? {
                        ...n,
                        ...patch,
                        title: (patch.title ?? n.title),
                        content: (patch.content ?? n.content),
                        updatedAt: Date.now(),
                    }
                    : n
            )
        );
    };

    const value = useMemo(
        () => ({ notes, createNote, deleteNote, updateNote, getNoteById }),
        [notes]
    );

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
    const ctx = useContext(NotesContext);
    if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
    return ctx;
}
