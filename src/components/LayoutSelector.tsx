import { useState } from "react";
import { LayoutTemplate, Columns3, Minimize2, Grid3X3, Crown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResumeStore, type ResumeLayout } from "@/store/resumeStore";

const layouts: { id: ResumeLayout; name: string; icon: React.ReactNode; description: string }[] = [
    {
        id: "modern",
        name: "Modern",
        icon: <LayoutTemplate className="w-4 h-4" />,
        description: "Clean single-column layout",
    },
    {
        id: "two-column",
        name: "Two Column",
        icon: <Columns3 className="w-4 h-4" />,
        description: "Sidebar + main content",
    },
    {
        id: "minimal",
        name: "Minimal",
        icon: <Minimize2 className="w-4 h-4" />,
        description: "Airy, centered, elegant",
    },
    {
        id: "compact",
        name: "Compact",
        icon: <Grid3X3 className="w-4 h-4" />,
        description: "Dense, space-efficient",
    },
    {
        id: "executive",
        name: "Executive",
        icon: <Crown className="w-4 h-4" />,
        description: "Classic professional",
    },
];

export function LayoutSelector() {
    const layout = useResumeStore((s) => s.layout);
    const setLayout = useResumeStore((s) => s.setLayout);
    const [open, setOpen] = useState(false);

    const current = layouts.find((l) => l.id === layout) ?? layouts[0];

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 h-8 text-xs"
                >
                    {current.icon}
                    <span className="hidden sm:inline">{current.name}</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-black border-white/10">
                {layouts.map((l) => (
                    <DropdownMenuItem
                        key={l.id}
                        onClick={() => {
                            setLayout(l.id);
                            setOpen(false);
                        }}
                        className={`flex items-center gap-2.5 cursor-pointer text-xs ${
                            l.id === layout ? "bg-neon-green/10 text-neon-green" : "text-white/80 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <span className={l.id === layout ? "text-neon-green" : "text-white/50"}>{l.icon}</span>
                        <div className="flex flex-col">
                            <span className="font-medium">{l.name}</span>
                            <span className="text-[10px] text-white/40">{l.description}</span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
