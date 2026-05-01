import { useState, useEffect, useCallback } from "react";
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
import { useResumeStore } from "@/store/resumeStore";
import { toast } from "sonner";

interface SavedSession {
    id: string;
    name: string;
    data: ReturnType<typeof useResumeStore.getState>["resume"];
    themeId: string;
    template: string;
    layout: string;
    savedAt: string;
}

export function EditorLayout() {
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
    const setTheme = useResumeStore((s) => s.setTheme);
    const setTemplate = useResumeStore((s) => s.setTemplate);
    const setLayout = useResumeStore((s) => s.setLayout);
    const setLastSaved = useResumeStore((s) => s.setLastSaved);
    const setDirty = useResumeStore((s) => s.setDirty);

    useAutoSave(1500);

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

    const handleManualSave = useCallback(() => {
        try {
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
    }, [resume, theme, template, layout, setLastSaved, setDirty]);

    const handleLoad = useCallback(
        (session: SavedSession) => {
            loadResume(session.data);
            const th = useResumeStore.getState().theme;
            if (session.themeId && session.themeId !== th.id) {
                const allThemes = JSON.parse(localStorage.getItem("resumeflow-storage") || "{}");
            }
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
            onClick={handleManualSave}
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

    if (isMobile) {
        return (
            <div className="h-[calc(100vh-64px)] flex flex-col bg-black">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/50 backdrop-blur-sm">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
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
                        {SaveButton}
                        {LoadDialog}
                        <PDFExportButton />
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    {activeTab === "edit" ? (
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
            <div className="w-[45%] min-w-[380px] max-w-[520px] flex flex-col border-r border-white/10 bg-black">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Editor</span>
                        {isDirty && <span className="text-neon-green animate-pulse">• Unsaved</span>}
                        {lastSaved && !isDirty && <span className="text-white/30">Saved {lastSaved}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                        {SaveButton}
                        {LoadDialog}
                        <ThemeSelector />
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ResumeForm />
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 flex flex-col bg-[#0a0a0a]">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Live Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LayoutSelector />
                        <PDFExportButton />
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-[700px] mx-auto">
                        <ResumePreview />
                    </div>
                </div>
            </div>
        </div>
    );
}
