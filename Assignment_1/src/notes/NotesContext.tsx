import React, { createContext, useContext, useMemo, useState } from "react";

export type Note = {
    id: string;
    title: string;
    content: string;
    createdAt: number;
};

type Draft = { title: string; content: string };

type NotesContextType = {
    notes: Note[];
    addNote: (note: Omit<Note, "id" | "createdAt">) => void;

    draft: Draft;
    setDraftTitle: (v: string) => void;
    setDraftContent: (v: string) => void;
    resetDraft: () => void;
    saveDraft: () => boolean; // true hvis lagret, false hvis tomt
};

const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [draft, setDraft] = useState<Draft>({ title: "", content: "" });

    const addNote = (note: Omit<Note, "id" | "createdAt">) => {
        const newNote: Note = {
            id: Date.now().toString(),
            createdAt: Date.now(),
            title: note.title.trim(),
            content: note.content.trim(),
        };
        setNotes((prev) => [newNote, ...prev]);
    };

    const setDraftTitle = (v: string) => setDraft((d) => ({ ...d, title: v }));
    const setDraftContent = (v: string) => setDraft((d) => ({ ...d, content: v }));
    const resetDraft = () => setDraft({ title: "", content: "" });

    const saveDraft = () => {
        const title = draft.title.trim();
        const content = draft.content.trim();

        // Ikke lagre helt tomme notater
        if (!title && !content) return false;

        addNote({ title, content });
        resetDraft();
        return true;
    };

    const value = useMemo(
        () => ({ notes, addNote, draft, setDraftTitle, setDraftContent, resetDraft, saveDraft }),
        [notes, draft]
    );

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
    const ctx = useContext(NotesContext);
    if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
    return ctx;
}
