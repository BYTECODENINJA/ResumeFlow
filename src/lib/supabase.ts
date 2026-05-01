import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseKey = import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

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
    created_at: string;
    updated_at: string;
}

export async function saveResume(userId: string, title: string, data: Record<string, unknown>, themeId: string, template: string) {
    const { data: result, error } = await supabase
        .from("resumes")
        .upsert(
            { user_id: userId, title, data, theme_id: themeId, template, updated_at: new Date().toISOString() },
            { onConflict: "user_id,title" }
        )
        .select()
        .single();

    if (error) throw error;
    return result;
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
