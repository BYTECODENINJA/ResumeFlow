import { useLayoutEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EditorLayout } from "@/components/EditorLayout";
import { SESSION_DEMO_FLAG, useResumeStore } from "@/store/resumeStore";

export interface BuilderPageProps {
    /** Public try-out: no autosave, Save/Load, PDF export, or cloud writes. */
    isDemo?: boolean;
}

export default function Builder({ isDemo = false }: BuilderPageProps) {
    const reset = useResumeStore((s) => s.reset);

    useLayoutEffect(() => {
        if (!isDemo) return undefined;
        try {
            sessionStorage.setItem(SESSION_DEMO_FLAG, "1");
        } catch {
            /* empty */
        }
        reset();
        return () => {
            try {
                sessionStorage.removeItem(SESSION_DEMO_FLAG);
            } catch {
                /* empty */
            }
            void useResumeStore.persist.rehydrate();
        };
    }, [isDemo, reset]);

    return (
        <div className="h-screen flex flex-col bg-black">
            <header className="h-16 border-b border-white/10 flex items-center px-4 justify-between bg-black/80 backdrop-blur-md gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10 shrink-0">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-neon-green flex items-center justify-center shrink-0">
                            <span className="text-black font-bold text-xs">RF</span>
                        </div>
                        <span className="font-semibold text-white text-sm tracking-tight truncate">ResumeFlow</span>
                        {isDemo && (
                            <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wide text-amber-400 shrink-0">
                                Demo
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {!isDemo && <span className="text-xs text-white/40 hidden md:inline whitespace-nowrap">AI-Powered Resume Builder</span>}
                    {isDemo ? (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-white/15 text-white/90 hover:bg-white/5 h-8 text-xs"
                        >
                            <Link to="/auth" state={{ from: "/builder" }}>
                                Sign in to save & export
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild variant="outline" size="sm" className="border-white/15 text-white/80 hover:bg-white/5 h-8 text-xs">
                            <Link to="/resumes">My resumes</Link>
                        </Button>
                    )}
                </div>
            </header>
            <EditorLayout isDemo={isDemo} />
        </div>
    );
}
