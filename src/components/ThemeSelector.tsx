import { useMemo } from "react";
import { Check, Palette } from "lucide-react";
import { RESUME_THEMES, computeThemeColors, type ResumeTheme } from "@/lib/themes";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
    const theme = useResumeStore((s) => s.theme);
    const setTheme = useResumeStore((s) => s.setTheme);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Palette className="w-4 h-4 text-neon-green" />
                <span>Theme</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {RESUME_THEMES.map((t) => (
                    <ThemeSwatch
                        key={t.id}
                        theme={t}
                        isActive={theme.id === t.id}
                        onClick={() => setTheme(t)}
                    />
                ))}
            </div>
        </div>
    );
}

function ThemeSwatch({
                         theme,
                         isActive,
                         onClick,
                     }: {
    theme: ResumeTheme;
    isActive: boolean;
    onClick: () => void;
}) {
    const { text } = useMemo(() => computeThemeColors(theme.background), [theme]);

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative rounded-lg p-2 text-left transition-all duration-200 border",
                isActive
                    ? "border-neon-green ring-1 ring-neon-green/50 scale-[1.02]"
                    : "border-white/10 hover:border-white/30 hover:scale-[1.02]"
            )}
            style={{ backgroundColor: theme.background }}
            aria-label={`Select ${theme.name} theme`}
        >
            <div className="flex items-center gap-2 mb-1.5">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                />
                <span
                    className="text-[10px] font-semibold truncate"
                    style={{ color: text }}
                >
          {theme.name}
        </span>
            </div>
            <div
                className="h-1.5 rounded-full w-full"
                style={{ backgroundColor: theme.accent, opacity: 0.6 }}
            />
            {isActive && (
                <div className="absolute top-1 right-1">
                    <Check className="w-3 h-3 text-neon-green" />
                </div>
            )}
        </button>
    );
}
