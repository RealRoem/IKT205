// src/notes/NotesContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/hooks/auth-context";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { decode as decodeBase64 } from "base64-arraybuffer";

export type Note = {
    id: string;
    title: string;
    content: string;
    author_id: string | null;
    author_email?: string | null;
    created_at: string;
    updated_at: string | null;
};

export type NoteImage = {
    id: string;
    note_id: string;
    image_url: string;
    public_url: string;
};

export type UploadNoteImageInput = {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
    base64?: string | null;
};

const TABLE = "Note";
const IMAGE_TABLE = "Image";
const NOTE_IMAGES_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_IMAGE_BUCKET ?? "Images";
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type NotesContextType = {
    notes: Note[];
    imagesByNoteId: Record<string, NoteImage[]>;
    isLoading: boolean;
    error?: string | null;
    statusMessage: string | null;
    clearStatus: () => void;
    refreshNotes: () => Promise<void>;
    createNote: (payload?: { title?: string; content?: string }) => Promise<Note>;
    deleteNote: (id: string) => Promise<void>;
    updateNote: (id: string, patch: Partial<Pick<Note, "title" | "content">>) => Promise<void>;
    getNoteById: (id: string) => Note | undefined;
    getNoteImages: (noteId: string) => NoteImage[];
    getNoteCoverUrl: (noteId: string) => string | null;
    uploadNoteImage: (noteId: string, payload: UploadNoteImageInput) => Promise<NoteImage>;
};

const NotesContext = createContext<NotesContextType | null>(null);

const normalizeNote = (n: any): Note => ({
    ...n,
    id: String(n.id),
});

const inferMimeTypeFromUri = (uri: string) => {
    const lower = uri.toLowerCase();
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".webp")) return "image/webp";
    return null;
};

const extensionFromMimeType = (mimeType: string) => {
    if (mimeType === "image/jpeg") return "jpg";
    if (mimeType === "image/png") return "png";
    if (mimeType === "image/webp") return "webp";
    return null;
};

const normalizeMimeType = (mimeType: string | null | undefined) => {
    const normalized = mimeType?.toLowerCase() ?? null;
    if (!normalized) return null;
    if (normalized === "image/jpg") return "image/jpeg";
    return normalized;
};

const estimateByteSizeFromBase64 = (base64: string) => {
    if (!base64) return 0;
    const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
    return Math.floor((base64.length * 3) / 4) - padding;
};

const publicUrlFromStoredPath = (value: string) => {
    if (!value) return value;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return supabase.storage.from(NOTE_IMAGES_BUCKET).getPublicUrl(value).data.publicUrl;
};

const uniqueStrings = (items: string[]) => [...new Set(items.filter(Boolean))];

const getBucketCandidates = () =>
    uniqueStrings([
        NOTE_IMAGES_BUCKET,
        NOTE_IMAGES_BUCKET.toLowerCase(),
        "Image",
        "image",
        "Images",
        "images",
    ]);

const resolvePublicUrl = (bucket: string, objectPath: string) =>
    supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;

const normalizeImage = (img: any): NoteImage => ({
    id: String(img.id),
    note_id: String(img.note_id),
    image_url: img.image_url,
    public_url: publicUrlFromStoredPath(img.image_url),
});

const uniqueObjectName = () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const generateUuid = () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const random = Math.floor(Math.random() * 16);
        const value = char === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
};

export function NotesProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoggedIn } = useAuthContext();
    const [notes, setNotes] = useState<Note[]>([]);
    const [imagesByNoteId, setImagesByNoteId] = useState<Record<string, NoteImage[]>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const refreshImagesForNotes = async (noteIds: string[]) => {
        if (noteIds.length === 0) {
            setImagesByNoteId({});
            return;
        }

        const { data, error: imageError } = await supabase
            .from(IMAGE_TABLE)
            .select("*")
            .in("note_id", noteIds);

        if (imageError) {
            console.error("Error fetching note images:", imageError);
            return;
        }

        const grouped: Record<string, NoteImage[]> = {};
        for (const row of data ?? []) {
            const normalized = normalizeImage(row);
            if (!grouped[normalized.note_id]) grouped[normalized.note_id] = [];
            grouped[normalized.note_id].push(normalized);
        }

        setImagesByNoteId(grouped);
    };

    const refreshNotes = async () => {
        setIsLoading(true);
        setError(null);

        const { data, error: noteError } = await supabase
            .from(TABLE)
            .select("*")
            .order("updated_at", { ascending: false })
            .order("created_at", { ascending: false });

        if (noteError) {
            console.error("Error fetching notes:", noteError);
            setError(noteError.message);
        } else {
            const nextNotes = (data ?? []).map(normalizeNote);
            setNotes(nextNotes);
            await refreshImagesForNotes(nextNotes.map((note) => note.id));
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
        const finalTitle = (title ?? "").trim() === "" ? "Untitled" : (title ?? "").trim();
        const finalContent = trimmedContent.length === 0 ? " " : trimmedContent;
        const noteId = generateUuid();

        const { data, error: createError } = await supabase
            .from(TABLE)
            .insert({
                id: noteId,
                title: finalTitle,
                content: finalContent,
                author_id: user.id,
                updated_at: new Date().toISOString(),
            })
            .select();

        if (createError) {
            console.error("Error creating note:", createError);
            throw createError;
        }

        if (data && data[0]) {
            const inserted = normalizeNote(data[0]);
            setNotes((prev) => [inserted, ...prev]);
            setImagesByNoteId((prev) => ({ ...prev, [inserted.id]: [] }));
            setStatusMessage("Note created.");
            return inserted;
        }

        throw new Error("No note returned from insert");
    };

    const deleteNote = async (id: string) => {
        if (!isLoggedIn || !user?.id) {
            throw new Error("Must be logged in to delete a note.");
        }

        const { error: deleteError } = await supabase.from(TABLE).delete().eq("id", id);
        if (deleteError) {
            console.error("Error deleting note:", deleteError);
            throw deleteError;
        }

        setNotes((prev) => prev.filter((note) => note.id !== id));
        setImagesByNoteId((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const getNoteById = (id: string) => notes.find((note) => note.id === id);

    const updateNote = async (id: string, patch: Partial<Pick<Note, "title" | "content">>) => {
        if (!isLoggedIn || !user?.id) {
            return;
        }

        const nextTitle =
            patch.title !== undefined ? (patch.title.trim() === "" ? "Untitled" : patch.title.trim()) : undefined;

        const nextContent =
            patch.content !== undefined ? patch.content.trim() : undefined;

        const { data, error: updateError } = await supabase
            .from(TABLE)
            .update({
                ...(nextTitle !== undefined ? { title: nextTitle } : {}),
                ...(nextContent !== undefined ? { content: nextContent === "" ? " " : nextContent } : {}),
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select();

        if (updateError) {
            console.error("Error updating note:", updateError);
            throw updateError;
        }

        if (data && data[0]) {
            const updated = normalizeNote(data[0]);
            setNotes((prev) => prev.map((note) => (note.id === id ? updated : note)));
        }
    };

    const getNoteImages = (noteId: string) => imagesByNoteId[noteId] ?? [];

    const getNoteCoverUrl = (noteId: string) => {
        const firstImage = imagesByNoteId[noteId]?.[0];
        return firstImage?.public_url ?? null;
    };

    const uploadNoteImage = async (noteId: string, payload: UploadNoteImageInput) => {
        if (!isLoggedIn || !user?.id) {
            throw new Error("Must be logged in to upload an image.");
        }

        if (!payload.uri) {
            throw new Error("No image selected.");
        }

        const providedMime = normalizeMimeType(payload.mimeType);
        const inferredMime = inferMimeTypeFromUri(payload.fileName ?? payload.uri);
        const mimeType = providedMime || inferredMime;

        if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
            throw new Error("Unsupported format. Use JPG, PNG, or WebP.");
        }

        const extension = extensionFromMimeType(mimeType);
        if (!extension) {
            throw new Error("Unsupported format. Use JPG, PNG, or WebP.");
        }

        let base64 = payload.base64 ?? "";
        if (!base64) {
            try {
                base64 = await FileSystemLegacy.readAsStringAsync(payload.uri, {
                    encoding: FileSystemLegacy.EncodingType.Base64,
                });
            } catch (readError) {
                console.error("Error reading selected image:", readError);
                throw new Error("Failed to read selected image.");
            }
        }

        const imageBuffer = decodeBase64(base64);
        const imageSize = payload.fileSize ?? estimateByteSizeFromBase64(base64);

        if (imageSize > MAX_IMAGE_SIZE_BYTES) {
            throw new Error("Image is too large. Maximum size is 15MB.");
        }

        const objectName = `${uniqueObjectName()}.${extension}`;
        const pathCandidates = [
            `${user.id}/${noteId}/${objectName}`,
            `${user.id}/${objectName}`,
            objectName,
        ];

        let uploadedBucket: string | null = null;
        let uploadedPath: string | null = null;
        let lastUploadError: any = null;

        for (const bucket of getBucketCandidates()) {
            for (const objectPath of pathCandidates) {
                const { error } = await supabase.storage.from(bucket).upload(objectPath, imageBuffer, {
                    contentType: mimeType,
                    upsert: false,
                });

                if (!error) {
                    uploadedBucket = bucket;
                    uploadedPath = objectPath;
                    lastUploadError = null;
                    break;
                }

                lastUploadError = error;
                const message = String(error.message ?? "").toLowerCase();
                const tryNextPath =
                    message.includes("row-level security") ||
                    message.includes("policy") ||
                    message.includes("already exists") ||
                    message.includes("bucket");
                if (!tryNextPath) break;
            }

            if (uploadedBucket && uploadedPath) break;
        }

        if (!uploadedBucket || !uploadedPath) {
            console.error("Error uploading image:", lastUploadError);
            throw new Error("Image upload failed due to bucket or policy restrictions.");
        }

        const publicUrl = resolvePublicUrl(uploadedBucket, uploadedPath);

        const { data, error: insertError } = await supabase
            .from(IMAGE_TABLE)
            .insert({
                id: generateUuid(),
                note_id: noteId,
                image_url: publicUrl,
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error linking image to note:", insertError);
            throw new Error("Image was uploaded, but linking failed.");
        }

        const inserted = normalizeImage(data);
        setImagesByNoteId((prev) => ({
            ...prev,
            [noteId]: [...(prev[noteId] ?? []), inserted],
        }));

        return inserted;
    };

    const value = useMemo(
        () => ({
            notes,
            imagesByNoteId,
            isLoading,
            error,
            statusMessage,
            clearStatus: () => setStatusMessage(null),
            refreshNotes,
            createNote,
            deleteNote,
            updateNote,
            getNoteById,
            getNoteImages,
            getNoteCoverUrl,
            uploadNoteImage,
        }),
        [notes, imagesByNoteId, isLoading, error, statusMessage]
    );

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
    const ctx = useContext(NotesContext);
    if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
    return ctx;
}
