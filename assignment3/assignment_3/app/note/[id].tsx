import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
    ActivityIndicator,
    Animated,
    AppState,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/src/theme/ThemeContext";
import { useNotes } from "@/src/notes/NotesContext";
import { useAuthContext } from "@/hooks/auth-context";
import { useNoteScreenContext } from "@/hooks/note-screen-context";

const pad2 = (value: number) => String(value).padStart(2, "0");

const formatLastEdited = (updatedAt: string | null, createdAt: string) => {
    const source = updatedAt ?? createdAt;
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return "--:--";

    const now = new Date();
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) {
        return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    }

    return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${pad2(date.getFullYear() % 100)}`;
};

export default function NoteScreen() {
    const { colors } = useTheme();
    const { isLoading } = useAuthContext();
    const { id, openImages } = useLocalSearchParams<{ id: string; openImages?: string }>();
    const { getNoteById, refreshNotes } = useNotes();
    const note = id ? getNoteById(id) : undefined;
    const requestedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!id || note) return;
        if (requestedRef.current === id) return;
        requestedRef.current = id;
        refreshNotes();
    }, [id, note, refreshNotes]);

    if (isLoading) return null;
    if (!id) return <Redirect href="/" />;
    if (!note) return <View style={[styles.screen, { backgroundColor: colors.bg }]} />;

    return <NoteScreenContent noteId={id} openImagesOnMount={openImages === "1"} />;
}

function NoteScreenContent({ noteId, openImagesOnMount = false }: { noteId: string; openImagesOnMount?: boolean }) {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const { user, isLoggedIn } = useAuthContext();
    const { getNoteById, updateNote, getNoteImages, uploadNoteImage } = useNotes();
    const { setMeta } = useNoteScreenContext();
    const insets = useSafeAreaInsets();
    const contentRef = useRef<TextInput>(null);

    const note = getNoteById(noteId);
    const [title, setTitle] = useState(note?.title ?? "");
    const [content, setContent] = useState(note?.content ?? "");

    const [stagedImages, setStagedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const [imagePanelMounted, setImagePanelMounted] = useState(false);
    const [imagePanelOpen, setImagePanelOpen] = useState(false);
    const openedFromParamRef = useRef(false);

    const panelAnim = useRef(new Animated.Value(0)).current;
    const panelWidth = useMemo(() => Math.min(300, Math.max(220, width * 0.7)), [width]);
    const preferredMode = ImagePicker.UIImagePickerPreferredAssetRepresentationMode?.Compatible;

    const syncedNoteIdRef = useRef<string | null>(null);
    const lastSavedRef = useRef({
        title: (note?.title ?? "").trim(),
        content: (note?.content ?? "").trim(),
    });

    useEffect(() => {
        if (!note) return;
        if (syncedNoteIdRef.current === note.id) return;
        syncedNoteIdRef.current = note.id;

        setTitle(note.title ?? "");
        setContent(note.content ?? "");
        lastSavedRef.current = {
            title: (note.title ?? "").trim(),
            content: (note.content ?? "").trim(),
        };
    }, [note]);

    const canEdit = !!(note && isLoggedIn && user?.id && (note.author_id ? note.author_id === user.id : true));
    const noteImages = getNoteImages(noteId);

    useEffect(() => {
        setMeta((prev) => {
            if (prev?.noteId === noteId && prev.canEdit === canEdit) return prev;
            return { noteId, canEdit };
        });

        return () =>
            setMeta((prev) => {
                if (!prev || prev.noteId !== noteId) return prev;
                return null;
            });
    }, [setMeta, noteId, canEdit]);

    const persist = useCallback(async () => {
        if (!note || !canEdit) return;

        const trimmedContent = content.trim();
        const trimmedTitle = title.trim();
        const nextTitle = trimmedTitle === "" ? "Untitled" : trimmedTitle;

        if (trimmedContent === lastSavedRef.current.content && nextTitle === lastSavedRef.current.title) {
            return;
        }

        try {
            await updateNote(noteId, { title: nextTitle, content: trimmedContent });
            lastSavedRef.current = { title: nextTitle, content: trimmedContent };
        } catch (err) {
            console.error("Save failed", err);
        }
    }, [note, canEdit, content, title, noteId, updateNote]);

    useEffect(() => {
        if (!note || !canEdit) return;
        const t = setTimeout(() => {
            void persist();
        }, 280);
        return () => clearTimeout(t);
    }, [title, content, canEdit, note, persist]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                void persist();
            };
        }, [persist])
    );

    useEffect(() => {
        if (!canEdit) return;
        const sub = AppState.addEventListener("change", (state) => {
            if (state !== "active") {
                void persist();
            }
        });
        return () => sub.remove();
    }, [canEdit, persist]);

    const openImagePanel = useCallback(() => {
        setImagePanelMounted(true);
        setImagePanelOpen(true);
        Animated.spring(panelAnim, {
            toValue: 1,
            damping: 18,
            stiffness: 210,
            mass: 0.9,
            useNativeDriver: true,
        }).start();
    }, [panelAnim]);

    useEffect(() => {
        if (!openImagesOnMount || openedFromParamRef.current) return;
        openedFromParamRef.current = true;
        openImagePanel();
    }, [openImagesOnMount, openImagePanel]);

    const closeImagePanel = useCallback(() => {
        if (!imagePanelMounted) return;
        Animated.timing(panelAnim, {
            toValue: 0,
            duration: 185,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (!finished) return;
            setImagePanelOpen(false);
            setImagePanelMounted(false);
        });
    }, [imagePanelMounted, panelAnim]);

    const addFromLibrary = async () => {
        if (!canEdit) return;

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            setUploadError("Gallery permission is required to pick images.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
            base64: true,
            ...(preferredMode ? { preferredAssetRepresentationMode: preferredMode } : {}),
        });

        if (result.canceled) return;
        setUploadError(null);
        setStagedImages((prev) => [...prev, ...result.assets]);
    };

    const addFromCamera = async () => {
        if (!canEdit) return;

        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            setUploadError("Camera permission is required to take photos.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            base64: true,
            ...(preferredMode ? { preferredAssetRepresentationMode: preferredMode } : {}),
        });

        if (result.canceled) return;
        setUploadError(null);
        setStagedImages((prev) => [...prev, ...result.assets]);
    };

    const removeStaged = (index: number) => {
        setStagedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadStagedImages = async () => {
        if (!canEdit || stagedImages.length === 0) return;

        setIsUploadingImages(true);
        setUploadError(null);

        try {
            let remaining = [...stagedImages];
            while (remaining.length > 0) {
                const current = remaining[0];
                await uploadNoteImage(noteId, {
                    uri: current.uri,
                    fileName: current.fileName,
                    mimeType: current.mimeType,
                    fileSize: current.fileSize,
                    base64: current.base64,
                });
                remaining = remaining.slice(1);
                setStagedImages(remaining);
            }
        } catch (err: any) {
            setUploadError(err?.message ?? "Image upload failed. Please try again.");
        } finally {
            setIsUploadingImages(false);
        }
    };

    if (!note) return <View style={[styles.screen, { backgroundColor: colors.bg }]} />;

    const ownerLabel = canEdit ? "owner: you" : "owner: other";
    const lastEditedLabel = `edited ${formatLastEdited(note.updated_at, note.created_at)}`;

    const panelTranslateX = panelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [panelWidth + 18, 0],
    });

    const dimOpacity = panelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.18],
    });

    const handleScale = panelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.97],
    });
    const handleOpacity = panelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.94],
    });

    return (
        <View style={[styles.screen, { backgroundColor: colors.bg }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    {
                        paddingTop: insets.top + Spacing.S,
                        paddingBottom: insets.bottom + 94,
                    },
                ]}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
                keyboardDismissMode="interactive"
            >
                <View style={styles.metaRow}>
                    <Text style={[styles.ownerText, { color: colors.textMuted }]}>{ownerLabel}</Text>
                    <Text style={[styles.ownerText, styles.lastEditedText, { color: colors.textMuted }]}>
                        {lastEditedLabel}
                    </Text>
                </View>

                <TextInput
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor={colors.textMuted}
                    style={[styles.titleInput, { color: colors.text }]}
                    returnKeyType="next"
                    onSubmitEditing={() => contentRef.current?.focus()}
                    blurOnSubmit={false}
                    selectionColor={colors.primary}
                    editable={canEdit}
                />

                <TextInput
                    ref={contentRef}
                    value={content}
                    onChangeText={setContent}
                    multiline
                    textAlignVertical="top"
                    placeholder="Start writing..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.contentInput, { color: colors.text }]}
                    scrollEnabled={false}
                    selectionColor={colors.primary}
                    editable={canEdit}
                />
            </ScrollView>

            <Animated.View
                style={[
                    styles.imagesHandleWrap,
                    {
                        top: insets.top + 156,
                        transform: [{ scale: handleScale }],
                        opacity: handleOpacity,
                    },
                ]}
            >
                <Pressable
                    onPress={openImagePanel}
                    style={({ pressed }) => [
                        styles.imagesHandle,
                        {
                            borderColor: colors.border,
                            backgroundColor: colors.elevated,
                            opacity: pressed ? 0.9 : 1,
                        },
                        Shadow.near,
                    ]}
                >
                    <Text style={[styles.imagesHandleText, { color: colors.text }]}>image</Text>
                </Pressable>
            </Animated.View>

            {imagePanelMounted ? (
                <Animated.View
                    style={styles.overlayLayer}
                    pointerEvents="box-none"
                >
                    <Animated.View
                        pointerEvents={imagePanelOpen ? "auto" : "none"}
                        style={[
                            styles.dimBackdrop,
                            {
                                opacity: dimOpacity,
                            },
                        ]}
                    />
                    <Pressable style={styles.dimPressable} onPress={closeImagePanel} />

                    <Animated.View
                        style={[
                            styles.imagesPanel,
                            {
                                width: panelWidth,
                                backgroundColor: colors.elevated,
                                borderColor: colors.border,
                                paddingTop: insets.top + Spacing.S,
                                transform: [{ translateX: panelTranslateX }],
                            },
                            Shadow.far,
                        ]}
                    >
                        <View style={styles.panelHeader}>
                            <Text style={[styles.panelTitle, { color: colors.text }]}>Images</Text>
                            <Pressable onPress={closeImagePanel} style={styles.panelCloseBtn}>
                                <Text style={[styles.panelCloseText, { color: colors.textMuted }]}>Close</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            contentContainerStyle={[
                                styles.panelScrollContent,
                                { paddingBottom: Math.max(insets.bottom + 10, 18) },
                            ]}
                            keyboardShouldPersistTaps="handled"
                        >
                            {canEdit ? (
                                <View style={styles.panelActions}>
                                    <Pressable
                                        onPress={addFromCamera}
                                        disabled={isUploadingImages}
                                        style={({ pressed }) => [
                                            styles.panelActionBtn,
                                            {
                                                borderColor: colors.border,
                                                backgroundColor: colors.s1,
                                                opacity: isUploadingImages || pressed ? 0.75 : 1,
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.panelActionText, { color: colors.text }]}>Take photo</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={addFromLibrary}
                                        disabled={isUploadingImages}
                                        style={({ pressed }) => [
                                            styles.panelActionBtn,
                                            {
                                                borderColor: colors.border,
                                                backgroundColor: colors.s1,
                                                opacity: isUploadingImages || pressed ? 0.75 : 1,
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.panelActionText, { color: colors.text }]}>From gallery</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <Text style={[styles.emptyImages, { color: colors.textMuted }]}>
                                    Read-only: only owner can add images.
                                </Text>
                            )}

                            {uploadError ? (
                                <Text style={[styles.errorText, { color: colors.danger }]}>{uploadError}</Text>
                            ) : null}

                            {canEdit && stagedImages.length > 0 ? (
                                <>
                                    <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>Staged</Text>
                                    <View style={styles.stagedGrid}>
                                        {stagedImages.map((asset, index) => (
                                            <Pressable
                                                key={`${asset.uri}-${index}`}
                                                onPress={() => removeStaged(index)}
                                                disabled={isUploadingImages}
                                                style={styles.stagedItem}
                                            >
                                                <Image source={{ uri: asset.uri }} style={styles.stagedImage} contentFit="cover" />
                                                <View style={styles.removeBadge}>
                                                    <Text style={styles.removeBadgeText}>x</Text>
                                                </View>
                                            </Pressable>
                                        ))}
                                    </View>

                                    <Pressable
                                        onPress={uploadStagedImages}
                                        disabled={isUploadingImages || stagedImages.length === 0}
                                        style={({ pressed }) => [
                                            styles.uploadButton,
                                            {
                                                backgroundColor: colors.primary,
                                                opacity:
                                                    isUploadingImages || stagedImages.length === 0 || pressed ? 0.75 : 1,
                                            },
                                        ]}
                                    >
                                        {isUploadingImages ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.uploadButtonText}>
                                                Upload {stagedImages.length} image(s)
                                            </Text>
                                        )}
                                    </Pressable>
                                </>
                            ) : null}

                            <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>Attached</Text>
                            {noteImages.length > 0 ? (
                                <View style={styles.uploadedList}>
                                    {noteImages.map((image) => (
                                        <Image
                                            key={image.id}
                                            source={{ uri: image.public_url }}
                                            style={styles.uploadedImage}
                                            contentFit="cover"
                                            transition={120}
                                        />
                                    ))}
                                </View>
                            ) : (
                                <Text style={[styles.emptyImages, { color: colors.textMuted }]}>No images attached yet.</Text>
                            )}
                        </ScrollView>
                    </Animated.View>
                </Animated.View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: Spacing.M + 4,
        paddingRight: Spacing.XL,
    },
    ownerText: {
        fontSize: 12,
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.S,
    },
    lastEditedText: {
        textAlign: "right",
    },
    titleInput: {
        ...Typography.h1,
        marginBottom: Spacing.XS,
        includeFontPadding: false,
    },
    contentInput: {
        minHeight: 320,
        ...Typography.p,
    },
    imagesHandleWrap: {
        position: "absolute",
        right: 0,
        zIndex: 20,
    },
    imagesHandle: {
        width: 50,
        minHeight: 100,
        borderTopLeftRadius: 22,
        borderBottomLeftRadius: 22,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderRightWidth: 0,
        borderWidth: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        paddingVertical: 5,
    },
    imagesHandleText: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.8,
        lineHeight: 13,
        textAlign: "center",
        transform: [{ rotate: "-90deg" }],
    },
    overlayLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 30,
    },
    dimBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#000000",
    },
    dimPressable: {
        ...StyleSheet.absoluteFillObject,
    },
    imagesPanel: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        borderLeftWidth: 1,
        paddingHorizontal: Spacing.S,
    },
    panelHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.S,
    },
    panelTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    panelCloseBtn: {
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    panelCloseText: {
        fontSize: 13,
        fontWeight: "600",
    },
    panelScrollContent: {
        gap: 10,
    },
    panelActions: {
        gap: 8,
    },
    panelActionBtn: {
        borderWidth: 1,
        borderRadius: Radius.input,
        minHeight: 42,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    panelActionText: {
        fontSize: 14,
        fontWeight: "600",
    },
    sectionCaption: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginTop: 4,
    },
    stagedGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    stagedItem: {
        width: "31%",
        aspectRatio: 1,
        borderRadius: 12,
        overflow: "hidden",
    },
    stagedImage: {
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(120,120,120,0.12)",
    },
    removeBadge: {
        position: "absolute",
        right: 6,
        top: 6,
        width: 20,
        height: 20,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.56)",
        alignItems: "center",
        justifyContent: "center",
    },
    removeBadgeText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 15,
    },
    uploadButton: {
        borderRadius: Radius.input,
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    uploadButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    uploadedList: {
        gap: 10,
    },
    uploadedImage: {
        width: "100%",
        height: 170,
        borderRadius: 14,
        backgroundColor: "rgba(120,120,120,0.12)",
    },
    emptyImages: {
        fontSize: 13,
    },
    errorText: {
        fontSize: 13,
        lineHeight: 18,
    },
});
