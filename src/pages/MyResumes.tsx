import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { deleteResume, getUserResumes, type SavedResume } from "@/lib/supabase";
import { toast } from "sonner";

export default function MyResumes() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState<SavedResume[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const list = await getUserResumes(user.id);
            setItems(list);
        } catch (e) {
            console.error(e);
            toast.error("Could not load resumes. Check Supabase table and RLS policies.");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this resume from the cloud?")) return;
        try {
            await deleteResume(id);
            setItems((prev) => prev.filter((r) => r.id !== id));
            toast.success("Resume deleted");
        } catch {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link to="/">
                            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white shrink-0">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="min-w-0">
                            <h1 className="font-semibold text-sm sm:text-base truncate">My resumes</h1>
                            <p className="text-[10px] sm:text-xs text-white/45 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" size="sm" className="text-white/70 hidden sm:inline-flex" onClick={() => signOut()}>
                            Sign out
                        </Button>
                        <Button
                            size="sm"
                            className="bg-neon-green text-black hover:bg-neon-green/90 font-semibold gap-1"
                            onClick={() => navigate("/builder")}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New resume</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-10">
                {loading ? (
                    <div className="flex justify-center py-20 text-white/50">
                        <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16 space-y-4 border border-white/10 rounded-2xl bg-white/[0.02]">
                        <FileText className="w-12 h-12 mx-auto text-white/25" />
                        <p className="text-white/50 text-sm max-w-sm mx-auto">
                            No cloud resumes yet. Open the builder and click Save while signed in to store one here.
                        </p>
                        <Button className="bg-neon-green text-black hover:bg-neon-green/90" onClick={() => navigate("/builder")}>
                            Start building
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {items.map((r) => (
                            <li
                                key={r.id}
                                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-neon-green/35 transition-colors"
                            >
                                <div className="w-11 h-11 rounded-lg bg-neon-green/15 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-neon-green" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{r.title}</p>
                                    <p className="text-xs text-white/40">
                                        Updated {new Date(r.updated_at).toLocaleString()} · {(r.template as string) || "modern"}
                                        {` · ${r.layout || "modern"}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        className="bg-neon-green text-black hover:bg-neon-green/90 gap-1 h-8 text-xs"
                                        onClick={() => navigate(`/builder?resumeId=${r.id}`)}
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        onClick={() => handleDelete(r.id)}
                                        aria-label="Delete resume"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <p className="text-center text-[11px] text-white/35 mt-10">
                    Tip: drafts also stay in your browser via auto-save until you Save to cloud from the builder.
                </p>
            </main>
        </div>
    );
}
