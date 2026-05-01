import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Palette, Download, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import { useEffect, useState } from "react";

export default function Index() {
    const navigate = useNavigate();
    const reset = useResumeStore((s) => s.reset);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const startBuilding = () => {
        reset();
        navigate("/builder");
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            {/* Navigation */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-neon-green flex items-center justify-center">
                            <span className="text-black font-bold text-sm">RF</span>
                        </div>
                        <span className="font-bold text-lg tracking-tight">ResumeFlow</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:inline-flex"
                            onClick={() => navigate("/builder")}
                        >
                            My Resumes
                        </Button>
                        <Button
                            onClick={startBuilding}
                            className="bg-neon-green text-black hover:bg-neon-green/90 font-semibold gap-2"
                        >
                            Start Building
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-red/5 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-5xl mx-auto text-center relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 mb-6 animate-float">
                        <Sparkles className="w-3.5 h-3.5 text-neon-green" />
                        Powered by Moonshot AI (Kimi K2.6)
                    </div>
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                        Build Resumes That
                        <br />
                        <span className="text-neon-green neon-text">Get You Hired</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
                        AI-powered resume builder with real-time preview, smart content generation, and stunning themes.
                        Craft your perfect resume in minutes, not hours.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            onClick={startBuilding}
                            size="lg"
                            className="bg-neon-green text-black hover:bg-neon-green/90 font-bold text-base px-8 py-6 gap-2 w-full sm:w-auto"
                        >
                            Create Your Resume
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate("/builder")}
                            className="border-white/20 text-white hover:bg-white/5 hover:text-white font-semibold text-base px-8 py-6 w-full sm:w-auto"
                        >
                            View Demo
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything You Need</h2>
                        <p className="text-white/40">A complete toolkit for modern professionals</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FeatureCard
                            icon={<Sparkles className="w-5 h-5" />}
                            title="AI Content Generation"
                            description="Generate professional summaries, rewrite bullet points with impact, and discover relevant skills with Kimi AI."
                        />
                        <FeatureCard
                            icon={<Zap className="w-5 h-5" />}
                            title="Real-Time Preview"
                            description="See your resume update instantly as you type. Split-screen editor with pixel-perfect live preview."
                        />
                        <FeatureCard
                            icon={<Palette className="w-5 h-5" />}
                            title="Dynamic Themes"
                            description="Choose from 9 vibrant color themes. Automatic contrast calculation ensures perfect readability."
                        />
                        <FeatureCard
                            icon={<Download className="w-5 h-5" />}
                            title="PDF Export"
                            description="Export print-ready PDFs that match your selected theme with high-fidelity rendering."
                        />
                        <FeatureCard
                            icon={<Shield className="w-5 h-5" />}
                            title="Auto-Save"
                            description="Never lose your progress. Every keystroke is saved automatically to local storage."
                        />
                        <FeatureCard
                            icon={<Globe className="w-5 h-5" />}
                            title="Fully Responsive"
                            description="Build and preview your resume on any device. Mobile-optimized editor with touch-friendly controls."
                        />
                    </div>
                </div>
            </section>

            {/* Theme Preview */}
            <section className="py-20 px-4 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Vibrant Themes</h2>
                        <p className="text-white/40">Stand out with bold, high-contrast color combinations</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                            { name: "Deep Ocean", bg: "#0d1b2a", accent: "#00ffff" },
                            { name: "Cyber Pink", bg: "#011936", accent: "#ff36ab" },
                            { name: "Lavender Night", bg: "#2e2a4a", accent: "#c8c0e8" },
                            { name: "Royal Gold", bg: "#200a5e", accent: "#ffe566" },
                            { name: "Berry Pop", bg: "#a02463", accent: "#ff5733" },
                            { name: "Dark Mode Pro", bg: "#0d1117", accent: "#ff6b35" },
                            { name: "Vintage", bg: "#111111", accent: "#c8a96e" },
                            { name: "Gold & Slate", bg: "#3a4a5c", accent: "#f5e6a3" },
                            { name: "Midnight Blue", bg: "#0a0f1e", accent: "#e4f0f6" },
                        ].map((theme) => (
                            <div
                                key={theme.name}
                                className="rounded-xl p-4 border border-white/10 transition-transform hover:scale-[1.02] cursor-pointer"
                                style={{ backgroundColor: theme.bg }}
                                onClick={startBuilding}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                                    <span className="text-xs font-medium text-white/90">{theme.name}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: theme.accent, opacity: 0.4 }} />
                                    <div className="h-1.5 rounded-full w-1/2" style={{ backgroundColor: theme.accent, opacity: 0.25 }} />
                                    <div className="h-1.5 rounded-full w-5/6" style={{ backgroundColor: theme.accent, opacity: 0.35 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 border-t border-white/5">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Build Your Resume?</h2>
                    <p className="text-white/40 mb-8">
                        Join thousands of professionals who landed their dream jobs with ResumeFlow.
                    </p>
                    <Button
                        onClick={startBuilding}
                        size="lg"
                        className="bg-neon-green text-black hover:bg-neon-green/90 font-bold text-base px-8 py-6 gap-2"
                    >
                        Get Started Free
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-neon-green flex items-center justify-center">
                            <span className="text-black font-bold text-[10px]">RF</span>
                        </div>
                        <span className="text-sm font-medium text-white/60">ResumeFlow</span>
                    </div>
                    <p className="text-xs text-white/30">
                        Built with Moonshot AI • Vite • React • Tailwind CSS
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
                         icon,
                         title,
                         description,
                     }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="group p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-neon-green/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center text-neon-green mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="font-semibold text-sm mb-2">{title}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{description}</p>
        </div>
    );
}
