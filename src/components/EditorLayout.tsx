import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PanelLeft, PanelRight, Smartphone, Monitor, Save, FolderOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumeForm } from "./ResumeForm";
import { ResumePreview } from "./ResumePreview";
import { ThemeSelector } from "./ThemeSelector";
import { LayoutSelector } from "./LayoutSelector";
import { PDFExportButton } from "./PDFExport";
import { useAutoSave } from "@/hooks/useAutoSave";
import { mergeResumePayload, useResumeStore } from "@/store/resumeStore";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createCloudResume, getResumeById, updateCloudResume } from "@/lib/supabase";
import { RESUME_THEMES, DEFAULT_THEME } from "@/lib/themes";

interface SavedSession {
    id: string;
    name: string;
    data: ReturnType<typeof useResumeStore.getState>["resume"];
    themeId: string;
    template: string;
    layout: string;
    savedAt: string;
}

export function EditorLayout({ isDemo = false }: { isDemo?: boolean }) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const resumeId = searchParams.get("resumeId");
    const viewOnly = searchParams.get("view") === "1";
    const isNew = searchParams.get("new") === "1";
    const loadedRemoteRef = useRef<string | null>(null);
    const { user, loading: authLoading } = useAuth();

    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
    const [loadDialogOpen, setLoadDialogOpen] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    const lastSaved = useResumeStore((s) => s.lastSaved);
    const isDirty = useResumeStore((s) => s.isDirty);
    const resume = useResumeStore((s) => s.resume);
    const theme = useResumeStore((s) => s.theme);
    const template = useResumeStore((s) => s.template);
    const layout = useResumeStore((s) => s.layout);
    const loadResume = useResumeStore((s) => s.loadResume);
    const reset = useResumeStore((s) => s.reset);
    const setTheme = useResumeStore((s) => s.setTheme);
    const setTemplate = useResumeStore((s) => s.setTemplate);
    const setLayout = useResumeStore((s) => s.setLayout);
    const setLastSaved = useResumeStore((s) => s.setLastSaved);
    const setDirty = useResumeStore((s) => s.setDirty);

    useAutoSave(1500, { enabled: !isDemo });

    useEffect(() => {
        if (!isNew) return;
        // Open a blank resume when user clicks "New resume".
        reset();
        loadedRemoteRef.current = null;
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.delete("new");
                next.delete("resumeId");
                next.delete("view");
                return next;
            },
            { replace: true }
        );
    }, [isNew, reset, setSearchParams]);

    useEffect(() => {
        if (!resumeId) loadedRemoteRef.current = null;
    }, [resumeId]);

    useEffect(() => {
        if (isDemo) return;
        if (viewOnly && !resumeId) return;
        if (authLoading) return;
        if (resumeId && !user) {
            toast.info("Sign in to load this resume from the cloud");
            navigate("/auth", { replace: false, state: { from: `/builder?resumeId=${encodeURIComponent(resumeId)}` } });
            return;
        }
        if (!resumeId || !user) return;
        if (loadedRemoteRef.current === resumeId) return;

        let cancelled = false;

        void (async () => {
            try {
                const row = await getResumeById(resumeId);
                if (cancelled) return;
                if (!row || row.user_id !== user.id) {
                    toast.error("That resume could not be loaded.");
                    setSearchParams(
                        (prev) => {
                            const next = new URLSearchParams(prev);
                            next.delete("resumeId");
                            return next;
                        },
                        { replace: true }
                    );
                    return;
                }

                loadedRemoteRef.current = resumeId;
                loadResume(mergeResumePayload(row.data as Record<string, unknown>));

                const t = RESUME_THEMES.find((x) => x.id === row.theme_id) ?? DEFAULT_THEME;
                setTheme(t);

                const layoutVal = row.layout || "modern";
                setTemplate(row.template || "modern");
                setLayout(layoutVal as ReturnType<typeof useResumeStore.getState>["layout"]);

                toast.success(`Editing “${row.title}”`);
            } catch (e) {
                console.error(e);
                toast.error("Cloud load failed. Check Supabase configuration.");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isDemo, viewOnly, resumeId, user, authLoading, loadResume, navigate, setLayout, setSearchParams, setTheme, setTemplate]);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const refreshSessions = useCallback(() => {
        try {
            const raw = localStorage.getItem("resumeflow-sessions");
            if (raw) setSavedSessions(JSON.parse(raw));
        } catch {
            setSavedSessions([]);
        }
    }, []);

    const handleManualSave = useCallback(async () => {
        if (isDemo) return;
        try {
            if (user) {
                const title = resume.fullName.trim() || "Untitled resume";
                const dataPayload = { ...resume } as unknown as Record<string, unknown>;
                try {
                    if (resumeId) {
                        await updateCloudResume(resumeId, {
                            title,
                            data: dataPayload,
                            theme_id: theme.id,
                            template,
                            layout,
                        });
                    } else {
                        const row = await createCloudResume(user.id, title, dataPayload, theme.id, template, layout);
                        setSearchParams(
                            (prev) => {
                                const next = new URLSearchParams(prev);
                                next.set("resumeId", row.id);
                                return next;
                            },
                            { replace: true }
                        );
                    }
                    setLastSaved(new Date().toLocaleTimeString());
                    setDirty(false);
                    setJustSaved(true);
                    setTimeout(() => setJustSaved(false), 2000);
                    toast.success(resumeId ? "Saved to My Resumes" : "Saved to cloud — resume linked!");
                    return;
                } catch (e) {
                    console.error(e);
                    toast.error("Cloud save failed.");
                }
                return;
            }

            const sessions: SavedSession[] = JSON.parse(localStorage.getItem("resumeflow-sessions") || "[]");
            const newSession: SavedSession = {
                id: crypto.randomUUID(),
                name: resume.fullName ? `${resume.fullName} Resume` : `Resume ${sessions.length + 1}`,
                data: resume,
                themeId: theme.id,
                template,
                layout,
                savedAt: new Date().toISOString(),
            };
            const updated = [newSession, ...sessions].slice(0, 20);
            localStorage.setItem("resumeflow-sessions", JSON.stringify(updated));
            setLastSaved(new Date().toLocaleTimeString());
            setDirty(false);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
            toast.success("Progress saved!");
        } catch {
            toast.error("Failed to save progress");
        }
    }, [isDemo, user, resumeId, resume, theme.id, template, layout, setLastSaved, setDirty, setSearchParams]);

    const handleLoad = useCallback(
        (session: SavedSession) => {
            loadResume(session.data);
            if (session.template) setTemplate(session.template);
            if (session.layout) setLayout(session.layout as ReturnType<typeof useResumeStore.getState>["layout"]);
            setLoadDialogOpen(false);
            toast.success("Resume loaded!");
        },
        [loadResume, setTemplate, setLayout]
    );

    const handleDeleteSession = useCallback((id: string) => {
        try {
            const sessions: SavedSession[] = JSON.parse(localStorage.getItem("resumeflow-sessions") || "[]");
            const updated = sessions.filter((s) => s.id !== id);
            localStorage.setItem("resumeflow-sessions", JSON.stringify(updated));
            setSavedSessions(updated);
        } catch {
            /* ignore */
        }
    }, []);

    const SaveButton = (
        <Button
            onClick={() => void handleManualSave()}
            variant="ghost"
            size="sm"
            className={`gap-1.5 h-8 text-xs ${justSaved ? "text-neon-green bg-neon-green/10" : "text-white/70 hover:text-white hover:bg-white/10"}`}
        >
            {justSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {justSaved ? "Saved" : "Save"}
        </Button>
    );

    const LoadDialog = (
        <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 h-8 text-xs"
                    onClick={() => {
                        refreshSessions();
                        setLoadDialogOpen(true);
                    }}
                >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Load
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-sm font-semibold">Saved Resumes</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[320px]">
                    <div className="space-y-2 mt-2">
                        {savedSessions.length === 0 && (
                            <p className="text-xs text-white/40 text-center py-6">No saved sessions yet. Click Save to create one.</p>
                        )}
                        {savedSessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-neon-green/30 transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="text-xs font-medium truncate">{session.name}</p>
                                    <p className="text-[10px] text-white/40">
                                        {new Date(session.savedAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 ml-3 shrink-0">
                                    <Button
                                        size="sm"
                                        className="h-7 text-[10px] bg-neon-green text-black hover:bg-neon-green/90"
                                        onClick={() => handleLoad(session)}
                                    >
                                        Load
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[10px] text-red-400 hover:text-red-400 hover:bg-red-400/10"
                                        onClick={() => handleDeleteSession(session.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );

    const saveLoadToolbar = !isDemo && !viewOnly ? (
        <>
            {SaveButton}
            {LoadDialog}
        </>
    ) : null;

    if (isMobile) {
        return (
            <div className="h-[calc(100vh-64px)] flex flex-col bg-black">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/50 backdrop-blur-sm">
                    <Tabs
                        value={viewOnly ? "preview" : activeTab}
                        onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
                    >
                        <TabsList className="bg-white/5 border border-white/10">
                            <TabsTrigger value="edit" className="gap-1.5 data-[state=active]:bg-neon-green data-[state=active]:text-black">
                                <PanelLeft className="w-3.5 h-3.5" />
                                Edit
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="gap-1.5 data-[state=active]:bg-neon-green data-[state=active]:text-black">
                                <PanelRight className="w-3.5 h-3.5" />
                                Preview
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-1">
                        {saveLoadToolbar}
                        <PDFExportButton disabled={isDemo} />
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    {activeTab === "edit" && !viewOnly ? (
                        <div className="h-full bg-black">
                            <ResumeForm />
                        </div>
                    ) : (
                        <div className="h-full overflow-auto p-4 bg-[#0a0a0a]">
                            <div className="max-w-[600px] mx-auto">
                                <ResumePreview />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex bg-black">
            {/* Left Panel - Editor */}
            {!viewOnly && (
            <div className="w-[45%] min-w-[380px] max-w-[520px] flex flex-col border-r border-white/10 bg-black">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Editor</span>
                        {isDemo ? (
                            <span className="text-amber-400/95 text-[10px] font-medium">Demo — sign in for save/export</span>
                        ) : (
                            <>
                                {isDirty && <span className="text-neon-green animate-pulse">• Unsaved</span>}
                                {lastSaved && !isDirty && <span className="text-white/30">Saved {lastSaved}</span>}
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {saveLoadToolbar}
                        <ThemeSelector />
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ResumeForm />
                </div>
            </div>
            )}

            {/* Right Panel - Preview */}
            <div className="flex-1 flex flex-col bg-[#0a0a0a]">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>{viewOnly ? "Resume Preview" : "Live Preview"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LayoutSelector />
                        <PDFExportButton disabled={isDemo} />
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-6">
                    <div className={`mx-auto ${viewOnly ? "max-w-[900px]" : "max-w-[700px]"}`}>
                        <ResumePreview />
                    </div>
                </div>
            </div>
        </div>
    );
}
