const TOOLKIT_URL =
    import.meta.env.VITE_AI_TOOLKIT_URL || import.meta.env.EXPO_PUBLIC_TOOLKIT_URL || "";
const SECRET_KEY =
    import.meta.env.VITE_AI_TOOLKIT_SECRET_KEY || import.meta.env.EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY || "";

const MODEL_ID = "moonshotai/kimi-k2.6";

export interface AIRequest {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
}

export async function generateWithKimi(request: AIRequest): Promise<string> {
    if (!TOOLKIT_URL || !SECRET_KEY) {
        throw new Error("AI toolkit not configured");
    }

    const response = await fetch(`${TOOLKIT_URL}/v2/vercel/v1/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SECRET_KEY}`,
        },
        body: JSON.stringify({
            model: MODEL_ID,
            messages: [
                { role: "system", content: request.systemPrompt },
                { role: "user", content: request.userPrompt },
            ],
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 800,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`AI request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("Empty response from AI");
    }
    return content.trim();
}

export const RESUME_SYSTEM_PROMPT = `You are an elite professional resume writer and career strategist with 15+ years of experience helping candidates land roles at Fortune 500 companies. Your expertise includes:

- Crafting compelling professional summaries that highlight unique value propositions
- Rewriting bullet points using strong action verbs and quantifiable achievements
- Identifying high-demand skills aligned with specific industries and roles
- Optimizing content for ATS (Applicant Tracking Systems)
- Maintaining a confident, professional tone throughout

Rules:
1. Always use specific metrics and numbers when possible (%, $, time periods)
2. Start bullet points with strong action verbs (Spearheaded, Architected, Optimized, etc.)
3. Keep language concise and impactful
4. Tailor suggestions to the specific job title/industry provided
5. Return ONLY the requested content — no explanations, no markdown formatting beyond basic bullets
6. Never invent facts — if information is missing, write compelling placeholder text that the user can customize`;

export async function generateProfessionalSummary(jobTitle: string, expertise: string[]): Promise<string> {
    const expertiseText = expertise.length > 0 ? expertise.join(", ") : "various technical and business skills";
    const prompt = `Write a compelling 3-4 sentence professional summary for a ${jobTitle} with expertise in ${expertiseText}. Focus on leadership, impact, and value proposition. Return only the summary text.`;
    return generateWithKimi({
        systemPrompt: RESUME_SYSTEM_PROMPT,
        userPrompt: prompt,
        temperature: 0.8,
        maxTokens: 300,
    });
}

export async function rewriteBulletPoints(rawText: string): Promise<string> {
    const prompt = `Rewrite the following work experience description into 3-5 powerful bullet points. Use strong action verbs, include metrics where plausible, and focus on impact and results. Return only the bullet points, one per line, starting with "• "

Original text:
${rawText}`;
    return generateWithKimi({
        systemPrompt: RESUME_SYSTEM_PROMPT,
        userPrompt: prompt,
        temperature: 0.7,
        maxTokens: 400,
    });
}

export async function suggestSkills(jobTitle: string, existingSkills: string[]): Promise<string[]> {
    const existingText = existingSkills.length > 0 ? `Existing skills: ${existingSkills.join(", ")}` : "No existing skills provided.";
    const prompt = `Suggest 8-12 relevant professional skills for a ${jobTitle}. ${existingText} Include a mix of technical and soft skills. Return ONLY a comma-separated list of skill names, no other text.`;
    const result = await generateWithKimi({
        systemPrompt: RESUME_SYSTEM_PROMPT,
        userPrompt: prompt,
        temperature: 0.7,
        maxTokens: 200,
    });
    return result.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function suggestEducationHighlights(input: {
    degree?: string;
    field?: string;
    institution?: string;
}): Promise<string> {
    const degree = input.degree?.trim() || "a degree";
    const field = input.field?.trim();
    const institution = input.institution?.trim();

    const prompt = `Write 2-4 concise resume-ready bullet points about the education entry below. Include honors, coursework, projects, leadership, or GPA placeholders ONLY if unknown. Return ONLY bullet points, one per line, starting with "• ".

Degree: ${degree}
Field: ${field || "(not provided)"}
Institution: ${institution || "(not provided)"}`;

    return generateWithKimi({
        systemPrompt: RESUME_SYSTEM_PROMPT,
        userPrompt: prompt,
        temperature: 0.7,
        maxTokens: 220,
    });
}
