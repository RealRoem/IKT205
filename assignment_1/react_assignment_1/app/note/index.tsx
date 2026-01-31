// app/note/index.tsx
import { useEffect } from "react";
import { router } from "expo-router";
import { useNotes } from "@/src/notes/NotesContext";

export default function NoteCreateRedirect() {
    const { createNote } = useNotes();

    useEffect(() => {
        const note = createNote();
        router.replace({ pathname: "/note/[id]", params: { id: note.id } });
    }, [createNote]);

    return null;
}
