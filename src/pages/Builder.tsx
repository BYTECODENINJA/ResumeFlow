import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EditorLayout } from "@/components/EditorLayout";

export default function Builder() {
    return (
        <div className="h-screen flex flex-col bg-black">
            <header className="h-16 border-b border-white/10 flex items-center px-4 justify-between bg-black/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-neon-green flex items-center justify-center">
                            <span className="text-black font-bold text-xs">RF</span>
                        </div>
                        <span className="font-semibold text-white text-sm tracking-tight">ResumeFlow</span>
                    </div>
                </div>
                <div className="text-xs text-white/40">AI-Powered Resume Builder</div>
            </header>
            <EditorLayout />
        </div>
    );
}
