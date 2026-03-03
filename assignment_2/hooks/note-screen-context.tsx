import { createContext, useContext, useState, type PropsWithChildren } from "react";

type NoteMeta = {
    noteId: string;
    canEdit: boolean;
};

type NoteScreenContextValue = {
    meta: NoteMeta | null;
    setMeta: (meta: NoteMeta | null) => void;
};

const NoteScreenContext = createContext<NoteScreenContextValue | null>(null);

export function NoteScreenProvider({ children }: PropsWithChildren) {
    const [meta, setMeta] = useState<NoteMeta | null>(null);

    return (
        <NoteScreenContext.Provider
            value={{
                meta,
                setMeta,
            }}
        >
            {children}
        </NoteScreenContext.Provider>
    );
}

export function useNoteScreenContext() {
    const ctx = useContext(NoteScreenContext);
    if (!ctx) {
        throw new Error("useNoteScreenContext must be used inside NoteScreenProvider");
    }
    return ctx;
}
