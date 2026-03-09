import { createContext, useContext, useMemo, useState, type Dispatch, type PropsWithChildren, type SetStateAction } from "react";

type NoteMeta = {
    noteId: string;
    canEdit: boolean;
};

type NoteScreenContextValue = {
    meta: NoteMeta | null;
    setMeta: Dispatch<SetStateAction<NoteMeta | null>>;
};

const NoteScreenContext = createContext<NoteScreenContextValue | null>(null);

export function NoteScreenProvider({ children }: PropsWithChildren) {
    const [meta, setMeta] = useState<NoteMeta | null>(null);
    const value = useMemo(
        () => ({
            meta,
            setMeta,
        }),
        [meta]
    );

    return (
        <NoteScreenContext.Provider value={value}>
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
