import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});

export interface SavedResume {
    id: string;
    user_id: string;
    title: string;
    data: Record<string, unknown>;
    theme_id: string;
    template: string;
    layout: string;
    created_at: string;
    updated_at: string;
}

export async function getResumeById(id: string) {
    const { data, error } = await supabase.from("resumes").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as SavedResume | null;
}

export async function createCloudResume(
    userId: string,
    title: string,
    data: Record<string, unknown>,
    themeId: string,
    template: string,
    layout: string
) {
    const now = new Date().toISOString();
    const { data: row, error } = await supabase
        .from("resumes")
        .insert({
            user_id: userId,
            title,
            data,
            theme_id: themeId,
            template,
            layout,
            updated_at: now,
        })
        .select()
        .single();

    if (error) throw error;
    return row as SavedResume;
}

export async function updateCloudResume(
    id: string,
    payload: {
        title?: string;
        data?: Record<string, unknown>;
        theme_id?: string;
        template?: string;
        layout?: string;
    }
) {
    const { error } = await supabase
        .from("resumes")
        .update({
            ...payload,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) throw error;
}

export async function getUserResumes(userId: string) {
    const { data, error } = await supabase.from("resumes").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
    if (error) throw error;
    return data as SavedResume[];
}

export async function deleteResume(id: string) {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) throw error;
}
