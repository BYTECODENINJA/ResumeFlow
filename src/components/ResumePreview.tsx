import { memo } from "react";
import { Mail, Phone, Globe, MapPin, Award, BookOpen, Briefcase, User, Languages, Star, Layers, Cpu } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { computeThemeColors } from "@/lib/themes";

export const ResumePreview = memo(function ResumePreview() {
    const resume = useResumeStore((s) => s.resume);
    const theme = useResumeStore((s) => s.theme);
    const layout = useResumeStore((s) => s.layout);
    const { text, mutedText } = computeThemeColors(theme.background);

    const hasContent =
        resume.fullName ||
        resume.profession ||
        resume.bio ||
        resume.education.length > 0 ||
        resume.workExperience.length > 0;

    if (!hasContent) {
        return (
            <div
                id="resume-preview-canvas"
                className="w-full h-full flex items-center justify-center rounded-xl"
                style={{ backgroundColor: theme.background }}
            >
                <div className="text-center space-y-3 px-8">
                    <div
                        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                        style={{ backgroundColor: `${theme.accent}20` }}
                    >
                        <Briefcase className="w-8 h-8" style={{ color: theme.accent }} />
                    </div>
                    <p style={{ color: mutedText }} className="text-sm">
                        Start filling in your details to see your resume come to life
                    </p>
                </div>
            </div>
        );
    }

    const commonProps = { resume, theme, text, mutedText };

    switch (layout) {
        case "two-column":
            return <TwoColumnLayout {...commonProps} />;
        case "minimal":
            return <MinimalLayout {...commonProps} />;
        case "compact":
            return <CompactLayout {...commonProps} />;
        case "executive":
            return <ExecutiveLayout {...commonProps} />;
        case "modern":
        default:
            return <ModernLayout {...commonProps} />;
    }
});

/* ---------- Shared Section Header ---------- */
function SectionHeader({
                           icon,
                           title,
                           accent,
                           text,
                       }: {
    icon: React.ReactNode;
    title: string;
    accent: string;
    text: string;
}) {
    return (
        <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: `1px solid ${accent}25` }}>
            <span style={{ color: accent, display: "inline-flex", alignItems: "center" }}>{icon}</span>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: text }}>
                {title}
            </h3>
        </div>
    );
}

/* ---------- Contact Items ---------- */
function ContactItems({
                          resume,
                          theme,
                          mutedText,
                          className = "",
                      }: {
    resume: ReturnType<typeof useResumeStore.getState>["resume"];
    theme: ReturnType<typeof useResumeStore.getState>["theme"];
    mutedText: string;
    className?: string;
}) {
    const items = [
        resume.contacts.email && { icon: <Mail className="w-3.5 h-3.5" />, text: resume.contacts.email },
        resume.contacts.phone && { icon: <Phone className="w-3.5 h-3.5" />, text: resume.contacts.phone },
        resume.contacts.website && { icon: <Globe className="w-3.5 h-3.5" />, text: resume.contacts.website },
        resume.contacts.location && { icon: <MapPin className="w-3.5 h-3.5" />, text: resume.contacts.location },
    ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

    return (
        <div className={`flex flex-wrap gap-x-4 gap-y-1.5 text-sm ${className}`} style={{ color: mutedText }}>
            {items.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1.5" style={{ lineHeight: 1.4 }}>
          <span className="inline-flex items-center justify-center" style={{ color: theme.accent, height: 16, width: 16 }}>
            {item.icon}
          </span>
          <span style={{ verticalAlign: "middle" }}>{item.text}</span>
        </span>
            ))}
        </div>
    );
}

/* ---------- Expertise Badges ---------- */
function ExpertiseBadges({
                             expertise,
                             theme,
                             centered = false,
                         }: {
    expertise: string[];
    theme: ReturnType<typeof useResumeStore.getState>["theme"];
    centered?: boolean;
}) {
    if (expertise.length === 0) return null;
    return (
        <div className={`flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}>
            {expertise.map((skill, i) => (
                <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                        backgroundColor: `${theme.accent}20`,
                        color: theme.accent,
                        border: `1px solid ${theme.accent}40`,
                    }}
                >
          {skill}
        </span>
            ))}
        </div>
    );
}

/* ---------- Tech Stack Badges ---------- */
function TechStackBadges({
                             techStack,
                             theme,
                             centered = false,
                         }: {
    techStack: string[];
    theme: ReturnType<typeof useResumeStore.getState>["theme"];
    centered?: boolean;
}) {
    if (techStack.length === 0) return null;
    return (
        <div className={`flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}>
            {techStack.map((tech, i) => (
                <span
                    key={i}
                    className="px-2.5 py-0.5 rounded text-[11px] font-medium"
                    style={{
                        backgroundColor: `${theme.accent}15`,
                        color: theme.accent,
                        border: `1px solid ${theme.accent}30`,
                    }}
                >
          {tech}
        </span>
            ))}
        </div>
    );
}

/* ============================================
   MODERN LAYOUT (default single column)
   ============================================ */
function ModernLayout({
                          resume,
                          theme,
                          text,
                          mutedText,
                      }: {
    resume: ReturnType<typeof useResumeStore.getState>["resume"];
    theme: ReturnType<typeof useResumeStore.getState>["theme"];
    text: string;
    mutedText: string;
}) {
    return (
        <div
            id="resume-preview-canvas"
            className="w-full min-h-[800px] rounded-xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: theme.background, color: text }}
        >
            {/* Header */}
            <div className="p-8 pb-6" style={{ borderBottom: `2px solid ${theme.accent}40` }}>
                <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: theme.accent }}>
                    {resume.fullName || "Your Name"}
                </h1>
                <p className="text-lg font-medium mb-4" style={{ color: text }}>
                    {resume.profession || "Professional Title"}
                </p>
                <ContactItems resume={resume} theme={theme} mutedText={mutedText} />
            </div>

            <div className="p-8 space-y-6">
                {resume.bio && (
                    <div>
                        <SectionHeader icon={<User className="w-4 h-4" />} title="Profile" accent={theme.accent} text={text} />
                        <p className="text-sm leading-relaxed" style={{ color: mutedText }}>
                            {resume.bio}
                        </p>
                    </div>
                )}

                {resume.expertise.length > 0 && (
                    <div>
                        <SectionHeader icon={<Star className="w-4 h-4" />} title="Expertise" accent={theme.accent} text={text} />
                        <ExpertiseBadges expertise={resume.expertise} theme={theme} centered />
                    </div>
                )}

                {resume.techStack.length > 0 && (
                    <div>
                        <SectionHeader icon={<Cpu className="w-4 h-4" />} title="Tech Stack" accent={theme.accent} text={text} />
                        <TechStackBadges techStack={resume.techStack} theme={theme} centered />
                    </div>
                )}

                {resume.workExperience.length > 0 && (
                    <div>
                        <SectionHeader icon={<Briefcase className="w-4 h-4" />} title="Experience" accent={theme.accent} text={text} />
                        <div className="space-y-4">
                            {resume.workExperience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-sm" style={{ color: text }}>{exp.position}</h4>
                                        <span className="text-xs" style={{ color: mutedText }}>
                      {exp.startDate} — {exp.endDate || "Present"}
                    </span>
                                    </div>
                                    <p className="text-xs font-medium mb-1.5" style={{ color: theme.accent }}>{exp.company}</p>
                                    {exp.description && (
                                        <p className="text-xs leading-relaxed mb-1.5" style={{ color: mutedText }}>{exp.description}</p>
                                    )}
                                    {exp.achievements.length > 0 && (
                                        <ul className="space-y-0.5">
                                            {exp.achievements.map((ach, i) => (
                                                <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: mutedText }}>
                                                    <span style={{ color: theme.accent }}>•</span>
                                                    {ach}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.education.length > 0 && (
                    <div>
                        <SectionHeader icon={<BookOpen className="w-4 h-4" />} title="Education" accent={theme.accent} text={text} />
                        <div className="space-y-3">
                            {resume.education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h4 className="font-semibold text-sm" style={{ color: text }}>
                                            {edu.degree} {edu.field && `— ${edu.field}`}
                                        </h4>
                                        <span className="text-xs" style={{ color: mutedText }}>
                      {edu.startDate} — {edu.endDate || "Present"}
                    </span>
                                    </div>
                                    <p className="text-xs font-medium" style={{ color: theme.accent }}>{edu.institution}</p>
                                    {edu.description && <p className="text-xs mt-1" style={{ color: mutedText }}>{edu.description}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.achievements.length > 0 && (
                    <div>
                        <SectionHeader icon={<Award className="w-4 h-4" />} title="Achievements" accent={theme.accent} text={text} />
                        <ul className="space-y-1">
                            {resume.achievements.map((ach, i) => (
                                <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: mutedText }}>
                                    <span style={{ color: theme.accent }}>▸</span>
                                    {ach}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {resume.languages.length > 0 && (
                    <div>
                        <SectionHeader icon={<Languages className="w-4 h-4" />} title="Languages" accent={theme.accent} text={text} />
                        <div className="flex flex-wrap gap-3">
                            {resume.languages.map((lang) => (
                                <div key={lang.id} className="text-xs">
                                    <span className="font-medium" style={{ color: text }}>{lang.name}</span>
                                    <span style={{ color: mutedText }}> — {lang.proficiency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.references.length > 0 && (
                    <div>
                        <SectionHeader icon={<User className="w-4 h-4" />} title="References" accent={theme.accent} text={text} />
                        <div className="space-y-2">
                            {resume.references.map((ref) => (
                                <div key={ref.id} className="text-xs">
                                    <span className="font-medium" style={{ color: text }}>{ref.name}</span>
                                    <span style={{ color: mutedText }}> — {ref.relation}</span>
                                    {ref.contact && <span style={{ color: mutedText }}> • {ref.contact}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.customSections.length > 0 && (
                    <div>
                        <SectionHeader icon={<Layers className="w-4 h-4" />} title="Additional" accent={theme.accent} text={text} />
                        <div className="space-y-3">
                            {resume.customSections.map((section) => (
                                <div key={section.id}>
                                    <h4 className="font-semibold text-xs mb-1" style={{ color: theme.accent }}>{section.title}</h4>
                                    <p className="text-xs whitespace-pre-wrap" style={{ color: mutedText }}>{section.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ============================================
   TWO-COLUMN LAYOUT
   ============================================ */
function TwoColumnLayout({
                             resume,
                             theme,
                             text,
                             mutedText,
                         }: {
    resume: ReturnType<typeof useResumeStore.getState>["resume"];
    theme: ReturnType<typeof useResumeStore.getState>["theme"];
    text: string;
    mutedText: string;
}) {
    return (
        <div
            id="resume-preview-canvas"
            className="w-full min-h-[800px] rounded-xl shadow-2xl overflow-hidden flex"
            style={{ backgroundColor: theme.background, color: text }}
        >
            {/* Left Sidebar */}
            <div className="w-[32%] p-6 space-y-6" style={{ backgroundColor: `${theme.accent}08` }}>
                <div className="space-y-1">
                    <h1 className="text-xl font-bold leading-tight" style={{ color: theme.accent }}>
                        {resume.fullName || "Your Name"}
                    </h1>
                    <p className="text-xs font-medium" style={{ color: mutedText }}>{resume.profession || "Professional Title"}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>Contact</h3>
                    <div className="space-y-1.5">
                        {resume.contacts.email && (
                            <span className="text-[11px] flex items-center gap-1.5" style={{ color: mutedText }}>
                <Mail className="w-3 h-3 shrink-0" style={{ color: theme.accent }} />
                                {resume.contacts.email}
              </span>
                        )}
                        {resume.contacts.phone && (
                            <span className="text-[11px] flex items-center gap-1.5" style={{ color: mutedText }}>
                <Phone className="w-3 h-3 shrink-0" style={{ color: theme.accent }} />
                                {resume.contacts.phone}
              </span>
                        )}
                        {resume.contacts.website && (
                            <span className="text-[11px] flex items-center gap-1.5" style={{ color: mutedText }}>
                <Globe className="w-3 h-3 shrink-0" style={{ color: theme.accent }} />
                                {resume.contacts.website}
              </span>
                        )}
                        {resume.contacts.location && (
                            <span className="text-[11px] flex items-center gap-1.5" style={{ color: mutedText }}>
                <MapPin className="w-3 h-3 shrink-0" style={{ color: theme.accent }} />
                                {resume.contacts.location}
              </span>
                        )}
                    </div>
                </div>

                {resume.expertise.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>Expertise</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {resume.expertise.map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent, border: `1px solid ${theme.accent}30` }}>
                  {skill}
                </span>
                            ))}
                        </div>
                    </div>
                )}

                {resume.techStack.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>Tech Stack</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {resume.techStack.map((tech, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: `${theme.accent}15`, color: theme.accent, border: `1px solid ${theme.accent}25` }}>
                  {tech}
                </span>
                            ))}
                        </div>
                    </div>
                )}

                {resume.languages.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>Languages</h3>
                        <div className="space-y-1">
                            {resume.languages.map((lang) => (
                                <div key={lang.id} className="text-[11px]">
                                    <span className="font-medium" style={{ color: text }}>{lang.name}</span>
                                    <span style={{ color: mutedText }}> — {lang.proficiency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.references.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>References</h3>
                        <div className="space-y-1.5">
                            {resume.references.map((ref) => (
                                <div key={ref.id} className="text-[11px]">
                                    <span className="font-medium" style={{ color: text }}>{ref.name}</span>
                                    <div style={{ color: mutedText }}>{ref.relation}</div>
                                    {ref.contact && <div style={{ color: mutedText }}>{ref.contact}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Main */}
            <div className="flex-1 p-6 space-y-5">
                {resume.bio && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 pb-1" style={{ color: theme.accent, borderBottom: `1px solid ${theme.accent}25` }}>Profile</h3>
                        <p className="text-xs leading-relaxed" style={{ color: mutedText }}>{resume.bio}</p>
                    </div>
                )}

                {resume.workExperience.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 pb-1" style={{ color: theme.accent, borderBottom: `1px solid ${theme.accent}25` }}>Experience</h3>
                        <div className="space-y-3">
                            {resume.workExperience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h4 className="font-semibold text-xs" style={{ color: text }}>{exp.position}</h4>
                                        <span className="text-[10px]" style={{ color: mutedText }}>{exp.startDate} — {exp.endDate || "Present"}</span>
                                    </div>
                                    <p className="text-[11px] font-medium mb-1" style={{ color: theme.accent }}>{exp.company}</p>
                                    {exp.description && <p className="text-[11px] leading-relaxed mb-1" style={{ color: mutedText }}>{exp.description}</p>}
                                    {exp.achievements.length > 0 && (
                                        <ul className="space-y-0.5">
                                            {exp.achievements.map((ach, i) => (
                                                <li key={i} className="text-[11px] flex items-start gap-1" style={{ color: mutedText }}>
                                                    <span style={{ color: theme.accent }}>•</span>{ach}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.education.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 pb-1" style={{ color: theme.accent, borderBottom: `1px solid ${theme.accent}25` }}>Education</h3>
                        <div className="space-y-2">
                            {resume.education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-xs" style={{ color: text }}>{edu.degree} {edu.field && `— ${edu.field}`}</h4>
                                        <span className="text-[10px]" style={{ color: mutedText }}>{edu.startDate} — {edu.endDate || "Present"}</span>
                                    </div>
                                    <p className="text-[11px] font-medium" style={{ color: theme.accent }}>{edu.institution}</p>
                                    {edu.description && <p className="text-[11px] mt-0.5" style={{ color: mutedText }}>{edu.description}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.achievements.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 pb-1" style={{ color: theme.accent, borderBottom: `1px solid ${theme.accent}25` }}>Achievements</h3>
                        <ul className="space-y-0.5">
                            {resume.achievements.map((ach, i) => (
                                <li key={i} className="text-[11px] flex items-start gap-1" style={{ color: mutedText }}>
                                    <span style={{ color: theme.accent }}>▸</span>{ach}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {resume.customSections.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 pb-1" style={{ color: theme.accent, borderBottom: `1px solid ${theme.accent}25` }}>Additional</h3>
                        <div className="space-y-2">
                            {resume.customSections.map((section) => (
                                <div key={section.id}>
                                    <h4 className="font-semibold text-[11px] mb-0.5" style={{ color: theme.accent }}>{section.title}</h4>
                                    <p className="text-[11px] whitespace-pre-wrap" style={{ color: mutedText }}>{section.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ============================================
   MINIMAL LAYOUT
   ============================================ */
function MinimalLayout({
                           resume,
                           theme,
                           text,
                           mutedText,
                       }: {
    resume: ReturnType<typeof useResumeStore.getState>["resume"];
    theme: ReturnType<typeof useResumeStore.getState>["theme"];
    text: string;
    mutedText: string;
}) {
    return (
        <div
            id="resume-preview-canvas"
            className="w-full min-h-[800px] rounded-xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: theme.background, color: text }}
        >
            <div className="p-10 text-center space-y-3" style={{ borderBottom: `1px solid ${theme.accent}20` }}>
                <h1 className="text-3xl font-light tracking-wide" style={{ color: theme.accent }}>
                    {resume.fullName || "Your Name"}
                </h1>
                <p className="text-sm font-medium tracking-widest uppercase" style={{ color: mutedText }}>
                    {resume.profession || "Professional Title"}
                </p>
                <ContactItems resume={resume} theme={theme} mutedText={mutedText} className="justify-center text-xs" />
            </div>

            <div className="p-10 space-y-8 max-w-[600px] mx-auto">
                {resume.bio && (
                    <div className="text-center">
                        <p className="text-sm leading-relaxed" style={{ color: mutedText }}>{resume.bio}</p>
                    </div>
                )}

                {resume.expertise.length > 0 && (
                    <div className="text-center">
                        <ExpertiseBadges expertise={resume.expertise} theme={theme} centered />
                    </div>
                )}

                {resume.techStack.length > 0 && (
                    <div className="text-center">
                        <TechStackBadges techStack={resume.techStack} theme={theme} centered />
                    </div>
                )}

                {resume.workExperience.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-center mb-4" style={{ color: theme.accent }}>Experience</h3>
                        {resume.workExperience.map((exp) => (
                            <div key={exp.id} className="text-center space-y-1">
                                <h4 className="font-semibold text-sm" style={{ color: text }}>{exp.position}</h4>
                                <p className="text-xs font-medium" style={{ color: theme.accent }}>{exp.company}</p>
                                <p className="text-[11px]" style={{ color: mutedText }}>{exp.startDate} — {exp.endDate || "Present"}</p>
                                {exp.description && <p className="text-xs leading-relaxed mt-1" style={{ color: mutedText }}>{exp.description}</p>}
                                {exp.achievements.length > 0 && (
                                    <ul className="space-y-0.5 mt-1 inline-block text-left">
                                        {exp.achievements.map((ach, i) => (
                                            <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: mutedText }}>
                                                <span style={{ color: theme.accent }}>•</span>{ach}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {resume.education.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-center mb-4" style={{ color: theme.accent }}>Education</h3>
                        {resume.education.map((edu) => (
                            <div key={edu.id} className="text-center space-y-0.5">
                                <h4 className="font-semibold text-sm" style={{ color: text }}>{edu.degree}</h4>
                                <p className="text-xs" style={{ color: theme.accent }}>{edu.institution}</p>
                                <p className="text-[11px]" style={{ color: mutedText }}>{edu.startDate} — {edu.endDate || "Present"}</p>
                            </div>
                        ))}
                    </div>
                )}

                {resume.achievements.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-center mb-3" style={{ color: theme.accent }}>Achievements</h3>
                        <ul className="space-y-1 inline-block text-left">
                            {resume.achievements.map((ach, i) => (
                                <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: mutedText }}>
                                    <span style={{ color: theme.accent }}>▸</span>{ach}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {resume.languages.length > 0 && (
                    <div className="text-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: theme.accent }}>Languages</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {resume.languages.map((lang) => (
                                <div key={lang.id} className="text-xs">
                                    <span className="font-medium" style={{ color: text }}>{lang.name}</span>
                                    <span style={{ color: mutedText }}> — {lang.proficiency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.references.length > 0 && (
                    <div className="text-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: theme.accent }}>References</h3>
                        <div className="space-y-1">
                            {resume.references.map((ref) => (
                                <div key={ref.id} className="text-xs">
                                    <span className="font-medium" style={{ color: text }}>{ref.name}</span>
                                    <span style={{ color: mutedText }}> — {ref.relation}</span>
                                    {ref.contact && <span style={{ color: mutedText }}> • {ref.contact}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.customSections.length > 0 && (
                    <div className="space-y-4">
                        {resume.customSections.map((section) => (
                            <div key={section.id} className="text-center">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: theme.accent }}>{section.title}</h4>
                                <p className="text-xs whitespace-pre-wrap" style={{ color: mutedText }}>{section.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ============================================
   COMPACT LAYOUT
   ============================================ */
function CompactLayout({
                           resume,
                           theme,
                           text,
                           mutedText,
                       }: {
    resume: ReturnType<typeof useResumeStore.getState>["resume"];
    theme: ReturnType<typeof useResumeStore.getState>["theme"];
    text: string;
    mutedText: string;
}) {
    return (
        <div
            id="resume-preview-canvas"
            className="w-full min-h-[800px] rounded-xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: theme.background, color: text }}
        >
            <div className="p-5 pb-3" style={{ borderBottom: `1px solid ${theme.accent}30` }}>
                <h1 className="text-2xl font-bold mb-0.5" style={{ color: theme.accent }}>{resume.fullName || "Your Name"}</h1>
                <p className="text-sm mb-2" style={{ color: text }}>{resume.profession || "Professional Title"}</p>
                <ContactItems resume={resume} theme={theme} mutedText={mutedText} className="text-[11px]" />
            </div>

            <div className="p-5 space-y-4">
                {resume.bio && (
                    <div>
                        <p className="text-xs leading-snug" style={{ color: mutedText }}>{resume.bio}</p>
                    </div>
                )}

                {(resume.expertise.length > 0 || resume.techStack.length > 0) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {resume.expertise.length > 0 && (
                            <div className="flex-1 min-w-[200px]">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.accent }}>Expertise</h3>
                                <ExpertiseBadges expertise={resume.expertise} theme={theme} />
                            </div>
                        )}
                        {resume.techStack.length > 0 && (
                            <div className="flex-1 min-w-[200px]">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.accent }}>Tech Stack</h3>
                                <TechStackBadges techStack={resume.techStack} theme={theme} />
                            </div>
                        )}
                    </div>
                )}

                {resume.workExperience.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>Experience</h3>
                        <div className="space-y-2">
                            {resume.workExperience.map((exp) => (
                                <div key={exp.id} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5">
                                    <h4 className="font-semibold text-xs" style={{ color: text }}>{exp.position}</h4>
                                    <span className="text-[10px] text-right" style={{ color: mutedText }}>{exp.startDate} — {exp.endDate || "Present"}</span>
                                    <p className="text-[11px] font-medium col-span-2" style={{ color: theme.accent }}>{exp.company}</p>
                                    {exp.description && <p className="text-[11px] leading-snug col-span-2" style={{ color: mutedText }}>{exp.description}</p>}
                                    {exp.achievements.length > 0 && (
                                        <ul className="col-span-2 space-y-0">
                                            {exp.achievements.map((ach, i) => (
                                                <li key={i} className="text-[11px] flex items-start gap-1" style={{ color: mutedText }}>
                                                    <span style={{ color: theme.accent }}>•</span>{ach}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.education.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>Education</h3>
                        <div className="space-y-1.5">
                            {resume.education.map((edu) => (
                                <div key={edu.id} className="grid grid-cols-[1fr_auto]">
                                    <h4 className="font-semibold text-xs" style={{ color: text }}>{edu.degree} {edu.field && `— ${edu.field}`}</h4>
                                    <span className="text-[10px]" style={{ color: mutedText }}>{edu.startDate} — {edu.endDate || "Present"}</span>
                                    <p className="text-[11px] font-medium col-span-2" style={{ color: theme.accent }}>{edu.institution}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.achievements.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.accent }}>Achievements</h3>
                        <ul className="space-y-0">
                            {resume.achievements.map((ach, i) => (
                                <li key={i} className="text-[11px] flex items-start gap-1" style={{ color: mutedText }}>
                                    <span style={{ color: theme.accent }}>▸</span>{ach}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {resume.languages.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.accent }}>Languages</h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                            {resume.languages.map((lang) => (
                                <div key={lang.id} className="text-[11px]">
                                    <span className="font-medium" style={{ color: text }}>{lang.name}</span>
                                    <span style={{ color: mutedText }}> — {lang.proficiency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.references.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.accent }}>References</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                            {resume.references.map((ref) => (
                                <div key={ref.id} className="text-[11px]">
                                    <span className="font-medium" style={{ color: text }}>{ref.name}</span>
                                    <span style={{ color: mutedText }}> — {ref.relation}</span>
                                    {ref.contact && <span style={{ color: mutedText }}> • {ref.contact}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.customSections.length > 0 && (
                    <div className="space-y-2">
                        {resume.customSections.map((section) => (
                            <div key={section.id}>
                                <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: theme.accent }}>{section.title}</h4>
                                <p className="text-[11px] whitespace-pre-wrap" style={{ color: mutedText }}>{section.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ============================================
   EXECUTIVE LAYOUT
   ============================================ */
function ExecutiveLayout({
                             resume,
                             theme,
                             text,
                             mutedText,
                         }: {
    resume: ReturnType<typeof useResumeStore.getState>["resume"];
    theme: ReturnType<typeof useResumeStore.getState>["theme"];
    text: string;
    mutedText: string;
}) {
    return (
        <div
            id="resume-preview-canvas"
            className="w-full min-h-[800px] rounded-xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: theme.background, color: text }}
        >
            <div className="p-8 pb-5" style={{ backgroundColor: `${theme.accent}10`, borderBottom: `3px solid ${theme.accent}` }}>
                <h1 className="text-[28px] font-serif font-bold mb-1" style={{ color: text, letterSpacing: "0.02em" }}>
                    {resume.fullName || "Your Name"}
                </h1>
                <p className="text-sm font-medium mb-3 uppercase tracking-widest" style={{ color: theme.accent }}>
                    {resume.profession || "Professional Title"}
                </p>
                <ContactItems resume={resume} theme={theme} mutedText={mutedText} className="text-xs" />
            </div>

            <div className="p-8 space-y-5">
                {resume.bio && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: theme.accent }}>Professional Summary</h3>
                        <p className="text-xs leading-relaxed" style={{ color: mutedText }}>{resume.bio}</p>
                    </div>
                )}

                {resume.expertise.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: theme.accent }}>Core Competencies</h3>
                        <ExpertiseBadges expertise={resume.expertise} theme={theme} centered />
                    </div>
                )}

                {resume.techStack.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: theme.accent }}>Technologies</h3>
                        <TechStackBadges techStack={resume.techStack} theme={theme} centered />
                    </div>
                )}

                {resume.workExperience.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: theme.accent }}>Professional Experience</h3>
                        <div className="space-y-3">
                            {resume.workExperience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h4 className="font-semibold text-sm" style={{ color: text }}>{exp.position}</h4>
                                        <span className="text-[11px] italic" style={{ color: mutedText }}>{exp.startDate} — {exp.endDate || "Present"}</span>
                                    </div>
                                    <p className="text-xs font-medium mb-1" style={{ color: theme.accent }}>{exp.company}</p>
                                    {exp.description && <p className="text-xs leading-relaxed mb-1" style={{ color: mutedText }}>{exp.description}</p>}
                                    {exp.achievements.length > 0 && (
                                        <ul className="space-y-0.5 ml-3">
                                            {exp.achievements.map((ach, i) => (
                                                <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: mutedText }}>
                                                    <span style={{ color: theme.accent }}>—</span>{ach}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.education.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: theme.accent }}>Education</h3>
                        <div className="space-y-2">
                            {resume.education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-semibold text-sm" style={{ color: text }}>{edu.degree} {edu.field && `— ${edu.field}`}</h4>
                                        <span className="text-[11px] italic" style={{ color: mutedText }}>{edu.startDate} — {edu.endDate || "Present"}</span>
                                    </div>
                                    <p className="text-xs font-medium" style={{ color: theme.accent }}>{edu.institution}</p>
                                    {edu.description && <p className="text-xs mt-0.5" style={{ color: mutedText }}>{edu.description}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.achievements.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: theme.accent }}>Honors & Awards</h3>
                        <ul className="space-y-0.5 ml-3">
                            {resume.achievements.map((ach, i) => (
                                <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: mutedText }}>
                                    <span style={{ color: theme.accent }}>—</span>{ach}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {resume.languages.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: theme.accent }}>Languages</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {resume.languages.map((lang) => (
                                <div key={lang.id} className="text-xs">
                                    <span className="font-medium" style={{ color: text }}>{lang.name}</span>
                                    <span style={{ color: mutedText }}> — {lang.proficiency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.references.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: theme.accent }}>References</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {resume.references.map((ref) => (
                                <div key={ref.id} className="text-xs">
                                    <span className="font-medium" style={{ color: text }}>{ref.name}</span>
                                    <div style={{ color: mutedText }}>{ref.relation}</div>
                                    {ref.contact && <div style={{ color: mutedText }}>{ref.contact}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.customSections.length > 0 && (
                    <div className="space-y-3">
                        {resume.customSections.map((section) => (
                            <div key={section.id}>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: theme.accent }}>{section.title}</h4>
                                <p className="text-xs whitespace-pre-wrap" style={{ color: mutedText }}>{section.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
