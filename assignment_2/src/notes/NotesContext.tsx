// src/notes/NotesContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/hooks/auth-context";

export type Note = {
    id: string;
    title: string;
    content: string;
    author_id: string | null;
    author_email?: string | null;
    created_at: string;
    updated_at: string | null;
};

const TABLE = "Note";

type NotesContextType = {
    notes: Note[];
    isLoading: boolean;
    error?: string | null;
    statusMessage: string | null;
    clearStatus: () => void;
    refreshNotes: () => Promise<void>;
    createNote: (payload?: { title?: string; content?: string }) => Promise<Note>;
    deleteNote: (id: string) => Promise<void>;
    updateNote: (id: string, patch: Partial<Pick<Note, "title" | "content">>) => Promise<void>;
    getNoteById: (id: string) => Note | undefined;
};

const NotesContext = createContext<NotesContextType | null>(null);

const normalizeNote = (n: any): Note => ({
    ...n,
    id: String(n.id),
});

export function NotesProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoggedIn } = useAuthContext();
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const refreshNotes = async () => {
        setIsLoading(true);
        setError(null);
        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .order("updated_at", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching notes:", error);
            setError(error.message);
        } else {
            setNotes((data ?? []).map(normalizeNote));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        refreshNotes();
    }, []);

    const createNote = async ({ title, content }: { title?: string; content?: string } = {}) => {
        if (!isLoggedIn || !user?.id) {
            throw new Error("Must be logged in to create a note.");
        }
        const trimmedContent = (content ?? "").trim();
        if (trimmedContent.length === 0) {
            throw new Error("Content is required.");
        }
        const finalTitle = (title ?? "").trim() === "" ? "Untitled" : (title ?? "").trim();

        const { data, error } = await supabase
            .from(TABLE)
            .insert({
                title: finalTitle,
                content: trimmedContent, // kan være tom streng, men ikke null
                author_id: user.id,
                updated_at: new Date().toISOString(),
            })
            .select();

        if (error) {
            console.error("Error creating note:", error);
            throw error;
        }
        if (data && data[0]) {
            const inserted = normalizeNote(data[0]);
            setNotes((prev) => [inserted, ...prev]);
            setStatusMessage("Note created.");
            return inserted;
        }
        throw new Error("No note returned from insert");
    };

    const deleteNote = async (id: string) => {
        if (!isLoggedIn || !user?.id) {
            throw new Error("Must be logged in to delete a note.");
        }
        const { error } = await supabase.from(TABLE).delete().eq("id", id);
        if (error) {
            console.error("Error deleting note:", error);
            throw error;
        }
        setNotes((prev) => prev.filter((n) => n.id !== id));
    };

    const getNoteById = (id: string) => notes.find((n) => n.id === id);

    const updateNote = async (id: string, patch: Partial<Pick<Note, "title" | "content">>) => {
        if (!isLoggedIn || !user?.id) {
            throw new Error("Must be logged in to update a note.");
        }
        const nextTitle =
            patch.title !== undefined
                ? patch.title.trim() === "" ? "Untitled" : patch.title.trim()
                : undefined;

        const nextContent =
            patch.content !== undefined
                ? patch.content.trim() === "" ? null : patch.content.trim()
                : undefined;

        if (nextContent === null) {
            throw new Error("Content is required.");
        }

        const { data, error } = await supabase
            .from(TABLE)
            .update({
                ...(nextTitle !== undefined ? { title: nextTitle } : {}),
                ...(nextContent !== undefined ? { content: nextContent ?? " " } : {}),
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select();

        if (error) {
            console.error("Error updating note:", error);
            throw error;
        }

        if (data && data[0]) {
            const updated = normalizeNote(data[0]);
            setNotes((prev) =>
                prev.map((n) => (n.id === id ? updated : n))
            );
        }
    };

    const value = useMemo(
        () => ({
            notes,
            isLoading,
            error,
            statusMessage,
            clearStatus: () => setStatusMessage(null),
            refreshNotes,
            createNote,
            deleteNote,
            updateNote,
            getNoteById,
        }),
        [notes, isLoading, error, statusMessage]
    );

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
    const ctx = useContext(NotesContext);
    if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
    return ctx;
}
