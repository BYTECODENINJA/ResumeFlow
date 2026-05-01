import { useEffect, useRef, useCallback } from "react";
import { useResumeStore } from "@/store/resumeStore";

export function useAutoSave(delay = 2000) {
    const resume = useResumeStore((s) => s.resume);
    const theme = useResumeStore((s) => s.theme);
    const template = useResumeStore((s) => s.template);
    const layout = useResumeStore((s) => s.layout);
    const isDirty = useResumeStore((s) => s.isDirty);
    const setLastSaved = useResumeStore((s) => s.setLastSaved);
    const setDirty = useResumeStore((s) => s.setDirty);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const save = useCallback(() => {
        try {
            const payload = {
                resume,
                themeId: theme.id,
                template,
                layout,
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem("resumeflow-autosave", JSON.stringify(payload));
            setLastSaved(new Date().toLocaleTimeString());
            setDirty(false);
        } catch (err) {
            console.error("Auto-save failed:", err);
        }
    }, [resume, theme, template, layout, setLastSaved, setDirty]);

    useEffect(() => {
        if (!isDirty) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            save();
        }, delay);
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isDirty, save, delay]);

    return { save };
}

export function loadAutoSave() {
    try {
        const raw = localStorage.getItem("resumeflow-autosave");
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
