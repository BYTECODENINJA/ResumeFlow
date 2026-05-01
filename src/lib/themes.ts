export interface ResumeTheme {
    id: string;
    name: string;
    background: string;
    accent: string;
    textColor: string;
}

export const RESUME_THEMES: ResumeTheme[] = [
    { id: "deep-ocean", name: "Deep Ocean", background: "#0d1b2a", accent: "#00ffff", textColor: "#ffffff" },
    { id: "cyber-pink", name: "Cyber Pink", background: "#011936", accent: "#ff36ab", textColor: "#ffffff" },
    { id: "lavender-night", name: "Lavender Night", background: "#2e2a4a", accent: "#c8c0e8", textColor: "#ffffff" },
    { id: "gold-slate", name: "Gold & Slate", background: "#3a4a5c", accent: "#f5e6a3", textColor: "#ffffff" },
    { id: "royal-gold", name: "Royal Gold", background: "#200a5e", accent: "#ffe566", textColor: "#ffffff" },
    { id: "berry-pop", name: "Berry Pop", background: "#a02463", accent: "#ff5733", textColor: "#ffffff" },
    { id: "dark-mode-pro", name: "Dark Mode Pro", background: "#0d1117", accent: "#ff6b35", textColor: "#ffffff" },
    { id: "vintage", name: "Vintage", background: "#111111", accent: "#c8a96e", textColor: "#ffffff" },
    { id: "midnight-blue", name: "Midnight Blue", background: "#0a0f1e", accent: "#e4f0f6", textColor: "#ffffff" },
];

function getLuminance(hex: string): number {
    const rgb = hex.replace("#", "").match(/.{2}/g)?.map((x) => parseInt(x, 16) / 255) ?? [0, 0, 0];
    const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastColor(backgroundHex: string): "#000000" | "#ffffff" {
    const bgLum = getLuminance(backgroundHex);
    const whiteContrast = (1 + 0.05) / (bgLum + 0.05);
    const blackContrast = (bgLum + 0.05) / (0 + 0.05);
    return whiteContrast >= blackContrast ? "#ffffff" : "#000000";
}

export function computeThemeColors(background: string): { text: string; mutedText: string } {
    const text = getContrastColor(background);
    const mutedText = text === "#ffffff" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)";
    return { text, mutedText };
}

export const DEFAULT_THEME = RESUME_THEMES[0];
