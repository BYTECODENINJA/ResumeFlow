import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_THEME, type ResumeTheme } from "@/lib/themes";

/** Set synchronously before the app boots on `/demo` (see index.html) and while the demo UI is mounted. */
export const SESSION_DEMO_FLAG = "resumeflow-demo-flag";

export function isDemoPersistSuspended(): boolean {
    if (typeof window === "undefined") return false;
    try {
        return sessionStorage.getItem(SESSION_DEMO_FLAG) === "1";
    } catch {
        return false;
    }
}

const resumePersistStorage = createJSONStorage(() => ({
    getItem: (name) => {
        if (isDemoPersistSuspended()) return null;
        return localStorage.getItem(name);
    },
    setItem: (name, value) => {
        if (isDemoPersistSuspended()) return;
        localStorage.setItem(name, value);
    },
    removeItem: (name) => localStorage.removeItem(name),
}));

export interface ContactInfo {
    phone: string;
    email: string;
    website: string;
    location: string;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface WorkExperience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
}

export interface Reference {
    id: string;
    name: string;
    relation: string;
    contact: string;
}

export interface Language {
    id: string;
    name: string;
    proficiency: string;
}

export interface CustomSection {
    id: string;
    title: string;
    content: string;
}

export interface ResumeData {
    fullName: string;
    profession: string;
    /** Data URL or https URL for profile / headshot */
    photoUrl: string;
    contacts: ContactInfo;
    bio: string;
    expertise: string[];
    techStack: string[];
    education: Education[];
    workExperience: WorkExperience[];
    achievements: string[];
    references: Reference[];
    languages: Language[];
    customSections: CustomSection[];
}

export type ResumeLayout = "modern" | "two-column" | "minimal" | "compact" | "executive";

export interface ResumeState {
    resume: ResumeData;
    theme: ResumeTheme;
    template: string;
    layout: ResumeLayout;
    lastSaved: string | null;
    isDirty: boolean;
    setField: <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => void;
    setNestedField: <K extends keyof ResumeData>(field: K, index: number, item: ResumeData[K] extends Array<infer U> ? U : never) => void;
    addItem: <K extends keyof ResumeData>(field: K, item: ResumeData[K] extends Array<infer U> ? U : never) => void;
    removeItem: <K extends keyof ResumeData>(field: K, index: number) => void;
    setTheme: (theme: ResumeTheme) => void;
    setTemplate: (template: string) => void;
    setLayout: (layout: ResumeLayout) => void;
    setLastSaved: (date: string | null) => void;
    setDirty: (dirty: boolean) => void;
    reset: () => void;
    loadResume: (data: ResumeData) => void;
}

export const DEFAULT_RESUME_DATA: ResumeData = {
    fullName: "",
    profession: "",
    photoUrl: "",
    contacts: {
        phone: "",
        email: "",
        website: "",
        location: "",
    },
    bio: "",
    expertise: [],
    techStack: [],
    education: [],
    workExperience: [],
    achievements: [],
    references: [],
    languages: [],
    customSections: [],
};

/** Merge persisted JSON / Supabase rows into a full ResumeData shape */
export function mergeResumePayload(raw: Record<string, unknown>): ResumeData {
    const p = raw as Partial<ResumeData>;
    return {
        ...DEFAULT_RESUME_DATA,
        ...p,
        fullName: p.fullName ?? "",
        profession: p.profession ?? "",
        photoUrl: typeof p.photoUrl === "string" ? p.photoUrl : "",
        contacts: { ...DEFAULT_RESUME_DATA.contacts, ...(p.contacts ?? {}) },
        bio: p.bio ?? "",
        expertise: Array.isArray(p.expertise) ? p.expertise : [],
        techStack: Array.isArray(p.techStack) ? p.techStack : [],
        education: Array.isArray(p.education) ? p.education : [],
        workExperience: Array.isArray(p.workExperience) ? p.workExperience : [],
        achievements: Array.isArray(p.achievements) ? p.achievements : [],
        references: Array.isArray(p.references) ? p.references : [],
        languages: Array.isArray(p.languages) ? p.languages : [],
        customSections: Array.isArray(p.customSections) ? p.customSections : [],
    };
}

export const useResumeStore = create<ResumeState>()(
    persist(
        (set) => ({
            resume: DEFAULT_RESUME_DATA,
            theme: DEFAULT_THEME,
            template: "modern",
            layout: "modern" as ResumeLayout,
            lastSaved: null,
            isDirty: false,
            setField: (field, value) =>
                set((state) => ({
                    resume: { ...state.resume, [field]: value },
                    isDirty: true,
                })),
            setNestedField: (field, index, item) =>
                set((state) => {
                    const arr = [...(state.resume[field] as unknown as Array<typeof item>)];
                    arr[index] = item;
                    return { resume: { ...state.resume, [field]: arr }, isDirty: true };
                }),
            addItem: (field, item) =>
                set((state) => {
                    const arr = [...(state.resume[field] as unknown as Array<typeof item>), item];
                    return { resume: { ...state.resume, [field]: arr }, isDirty: true };
                }),
            removeItem: (field, index) =>
                set((state) => {
                    const arr = [...(state.resume[field] as unknown as Array<unknown>)];
                    arr.splice(index, 1);
                    return { resume: { ...state.resume, [field]: arr }, isDirty: true };
                }),
            setTheme: (theme) => set({ theme }),
            setTemplate: (template) => set({ template }),
            setLayout: (layout) => set({ layout }),
            setLastSaved: (lastSaved) => set({ lastSaved }),
            setDirty: (isDirty) => set({ isDirty }),
            reset: () => set({ resume: DEFAULT_RESUME_DATA, isDirty: false, lastSaved: null }),
            loadResume: (data) => set({ resume: data, isDirty: false }),
        }),
        {
            name: "resumeflow-storage",
            storage: resumePersistStorage,
            partialize: (state) => ({
                resume: state.resume,
                theme: state.theme,
                template: state.template,
                layout: state.layout,
            }),
        }
    )
);
