import { useState, useCallback, useRef } from "react";
import {
    User,
    Mail,
    Phone,
    Globe,
    MapPin,
    Briefcase,
    BookOpen,
    Award,
    Languages,
    UserCircle,
    Plus,
    Trash2,
    Wand2,
    Sparkles,
    Lightbulb,
    X,
    Loader2,
    Layers,
    Cpu,
    ImagePlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { fileToCompressedJpegDataUrl } from "@/lib/imageUpload";
import { useResumeStore, type Education, type WorkExperience, type Reference, type Language, type CustomSection } from "@/store/resumeStore";
import { generateProfessionalSummary, rewriteBulletPoints, suggestEducationHighlights, suggestSkills } from "@/lib/ai";
import { toast } from "sonner";

export function ResumeForm() {
    return (
        <ScrollArea className="h-full">
            <div className="p-6 space-y-8">
                <PersonalInfoSection />
                <BioSection />
                <ExpertiseSection />
                <TechStackSection />
                <WorkExperienceSection />
                <EducationSection />
                <AchievementsSection />
                <LanguagesSection />
                <ReferencesSection />
                <CustomSections />
            </div>
        </ScrollArea>
    );
}

function PersonalInfoSection() {
    const resume = useResumeStore((s) => s.resume);
    const setField = useResumeStore((s) => s.setField);
    const photoFileRef = useRef<HTMLInputElement>(null);
    const [photoBusy, setPhotoBusy] = useState(false);

    const updateContact = useCallback(
        (key: keyof typeof resume.contacts, value: string) => {
            setField("contacts", { ...resume.contacts, [key]: value });
        },
        [resume.contacts, setField]
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <User className="w-4 h-4 text-neon-green" />
                <span>Personal Information</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
                <div>
                    <Label className="text-xs text-white/60 mb-1.5 block">Full Name</Label>
                    <Input
                        value={resume.fullName}
                        onChange={(e) => setField("fullName", e.target.value)}
                        placeholder="e.g. Alexandra Chen"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50"
                    />
                </div>
                <div>
                    <Label className="text-xs text-white/60 mb-1.5 block">Profession</Label>
                    <Input
                        value={resume.profession}
                        onChange={(e) => setField("profession", e.target.value)}
                        placeholder="e.g. Senior Product Designer"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50"
                    />
                </div>
                <div>
                    <Label className="text-xs text-white/60 mb-1.5 block flex items-center gap-1">
                        <ImagePlus className="w-3 h-3" /> Profile photo
                    </Label>
                    <Input
                        value={resume.photoUrl}
                        onChange={(e) => setField("photoUrl", e.target.value)}
                        placeholder="Paste image URL, or upload a file below"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50 mb-2"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            ref={photoFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                if (!file) return;

                                void (async () => {
                                    setPhotoBusy(true);
                                    try {
                                        if (file.size > 12 * 1024 * 1024) {
                                            toast.error("Use an image under 12 MB.");
                                            return;
                                        }
                                        const dataUrl = await fileToCompressedJpegDataUrl(file, 420, 0.88);
                                        setField("photoUrl", dataUrl);
                                        toast.success("Photo added");
                                    } catch (err) {
                                        console.error(err);
                                        toast.error(err instanceof Error ? err.message : "Could not load that image.");
                                    } finally {
                                        setPhotoBusy(false);
                                    }
                                })();
                            }}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={photoBusy}
                            className="h-8 px-3 text-xs bg-white/10 text-white hover:bg-white/15 border border-white/10 shadow-none gap-2"
                            onClick={() => photoFileRef.current?.click()}
                        >
                            {photoBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                            {photoBusy ? "Processing…" : "Upload"}
                        </Button>
                        {resume.photoUrl && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] text-white/55 hover:text-white"
                                onClick={() => setField("photoUrl", "")}
                            >
                                Clear photo
                            </Button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-xs text-white/60 mb-1.5 block flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Email
                        </Label>
                        <Input
                            value={resume.contacts.email}
                            onChange={(e) => updateContact("email", e.target.value)}
                            placeholder="email@example.com"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50"
                        />
                    </div>
                    <div>
                        <Label className="text-xs text-white/60 mb-1.5 block flex items-center gap-1">
                            <Phone className="w-3 h-3" /> Phone
                        </Label>
                        <Input
                            value={resume.contacts.phone}
                            onChange={(e) => updateContact("phone", e.target.value)}
                            placeholder="+1 234 567 890"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-xs text-white/60 mb-1.5 block flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Website
                        </Label>
                        <Input
                            value={resume.contacts.website}
                            onChange={(e) => updateContact("website", e.target.value)}
                            placeholder="portfolio.com"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50"
                        />
                    </div>
                    <div>
                        <Label className="text-xs text-white/60 mb-1.5 block flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Location
                        </Label>
                        <Input
                            value={resume.contacts.location}
                            onChange={(e) => updateContact("location", e.target.value)}
                            placeholder="City, Country"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function BioSection() {
    const bio = useResumeStore((s) => s.resume.bio);
    const profession = useResumeStore((s) => s.resume.profession);
    const expertise = useResumeStore((s) => s.resume.expertise);
    const setField = useResumeStore((s) => s.setField);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!profession) {
            toast.error("Please enter your profession first");
            return;
        }
        setIsGenerating(true);
        try {
            const summary = await generateProfessionalSummary(profession, expertise);
            setField("bio", summary);
            toast.success("Professional summary generated!");
        } catch (err) {
            toast.error("Failed to generate summary");
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <UserCircle className="w-4 h-4 text-neon-green" />
                    <span>Bio / Professional Summary</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="text-neon-green hover:text-neon-green hover:bg-neon-green/10 gap-1.5 h-7 text-xs"
                >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    AI Generate
                </Button>
            </div>
            <Textarea
                value={bio}
                onChange={(e) => setField("bio", e.target.value)}
                placeholder="Write a brief professional summary or let AI generate one..."
                rows={4}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50 resize-none"
            />
        </div>
    );
}

function ExpertiseSection() {
    const expertise = useResumeStore((s) => s.resume.expertise);
    const profession = useResumeStore((s) => s.resume.profession);
    const setField = useResumeStore((s) => s.setField);
    const [input, setInput] = useState("");
    const [isSuggesting, setIsSuggesting] = useState(false);

    const addSkill = () => {
        if (!input.trim()) return;
        setField("expertise", [...expertise, input.trim()]);
        setInput("");
    };

    const removeSkill = (index: number) => {
        setField(
            "expertise",
            expertise.filter((_, i) => i !== index)
        );
    };

    const handleSuggest = async () => {
        if (!profession) {
            toast.error("Enter your profession first");
            return;
        }
        setIsSuggesting(true);
        try {
            const skills = await suggestSkills(profession, expertise);
            const newSkills = skills.filter((s) => !expertise.includes(s));
            setField("expertise", [...expertise, ...newSkills.slice(0, 5)]);
            toast.success(`Added ${newSkills.slice(0, 5).length} suggested skills`);
        } catch (err) {
            toast.error("Failed to suggest skills");
            console.error(err);
        } finally {
            setIsSuggesting(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <Lightbulb className="w-4 h-4 text-neon-green" />
                    <span>Expertise</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSuggest}
                    disabled={isSuggesting}
                    className="text-neon-green hover:text-neon-green hover:bg-neon-green/10 gap-1.5 h-7 text-xs"
                >
                    {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    AI Suggest
                </Button>
            </div>
            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill and press Enter"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50"
                />
                <Button
                    onClick={addSkill}
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/10 hover:text-white shrink-0"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {expertise.map((skill, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neon-green/10 text-neon-green border border-neon-green/30"
                    >
            {skill}
                        <button onClick={() => removeSkill(i)} className="hover:text-white transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
                ))}
            </div>
        </div>
    );
}

function TechStackSection() {
    const techStack = useResumeStore((s) => s.resume.techStack);
    const setField = useResumeStore((s) => s.setField);
    const [input, setInput] = useState("");

    const addTech = () => {
        if (!input.trim()) return;
        setField("techStack", [...techStack, input.trim()]);
        setInput("");
    };

    const removeTech = (index: number) => {
        setField("techStack", techStack.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <Cpu className="w-4 h-4 text-neon-green" />
                <span>Tech Stack</span>
            </div>
            <p className="text-[11px] text-white/40 -mt-1">Add programming languages, frameworks, tools, and technologies you work with.</p>
            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                    placeholder="e.g. React, TypeScript, Node.js"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50"
                />
                <Button
                    onClick={addTech}
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/10 hover:text-white shrink-0"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {techStack.map((tech, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/5 text-white/80 border border-white/15"
                    >
            {tech}
                        <button onClick={() => removeTech(i)} className="hover:text-red-400 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
                ))}
            </div>
        </div>
    );
}

function WorkExperienceSection() {
    const experiences = useResumeStore((s) => s.resume.workExperience);
    const addItem = useResumeStore((s) => s.addItem);
    const removeItem = useResumeStore((s) => s.removeItem);
    const setNestedField = useResumeStore((s) => s.setNestedField);
    const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);

    const addExperience = () => {
        const newExp: WorkExperience = {
            id: crypto.randomUUID(),
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            description: "",
            achievements: [],
        };
        addItem("workExperience", newExp);
    };

    const updateExperience = (index: number, field: keyof WorkExperience, value: unknown) => {
        const item = { ...experiences[index], [field]: value };
        setNestedField("workExperience", index, item);
    };

    const handleAIRewrite = async (index: number) => {
        const exp = experiences[index];
        if (!exp.description) {
            toast.error("Add a description first");
            return;
        }
        setAiLoadingId(exp.id);
        try {
            const rewritten = await rewriteBulletPoints(exp.description);
            const bullets = rewritten
                .split("\n")
                .map((l) => l.replace(/^•\s*/, "").trim())
                .filter(Boolean);
            updateExperience(index, "achievements", bullets);
            toast.success("Bullet points rewritten!");
        } catch (err) {
            toast.error("AI rewrite failed");
            console.error(err);
        } finally {
            setAiLoadingId(null);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <Briefcase className="w-4 h-4 text-neon-green" />
                <span>Work Experience</span>
            </div>
            <Accordion type="multiple" className="space-y-2">
                {experiences.map((exp, index) => (
                    <AccordionItem key={exp.id} value={exp.id} className="border-white/10 rounded-lg bg-white/[0.02] px-3">
                        <AccordionTrigger className="text-xs hover:no-underline py-3">
              <span className="truncate text-left">
                {exp.position || "New Position"} {exp.company && `at ${exp.company}`}
              </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    value={exp.position}
                                    onChange={(e) => updateExperience(index, "position", e.target.value)}
                                    placeholder="Position"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                                />
                                <Input
                                    value={exp.company}
                                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                                    placeholder="Company"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                                />
                                <Input
                                    value={exp.startDate}
                                    onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                                    placeholder="Start (e.g. Jan 2020)"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                                />
                                <Input
                                    value={exp.endDate}
                                    onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                                    placeholder="End (e.g. Dec 2023)"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                                />
                            </div>
                            <Textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(index, "description", e.target.value)}
                                placeholder="Describe your role and responsibilities..."
                                rows={3}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs resize-none"
                            />
                            {exp.achievements.length > 0 && (
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-white/50 uppercase tracking-wider">Key Achievements</Label>
                                    {exp.achievements.map((ach, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-neon-green text-xs">•</span>
                                            <span className="text-xs text-white/70 flex-1">{ach}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAIRewrite(index)}
                                    disabled={aiLoadingId === exp.id}
                                    className="text-neon-green hover:text-neon-green hover:bg-neon-green/10 gap-1.5 h-7 text-xs"
                                >
                                    {aiLoadingId === exp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                    AI Rewrite Bullets
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem("workExperience", index)}
                                    className="text-red-400 hover:text-red-400 hover:bg-red-400/10 gap-1.5 h-7 text-xs ml-auto"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Remove
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <Button
                onClick={addExperience}
                variant="outline"
                className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 gap-2 text-xs"
            >
                <Plus className="w-3.5 h-3.5" />
                Add Experience
            </Button>
        </div>
    );
}

function EducationSection() {
    const education = useResumeStore((s) => s.resume.education);
    const addItem = useResumeStore((s) => s.addItem);
    const removeItem = useResumeStore((s) => s.removeItem);
    const setNestedField = useResumeStore((s) => s.setNestedField);
    const [aiEduLoadingId, setAiEduLoadingId] = useState<string | null>(null);

    const addEducation = () => {
        const newEdu: Education = {
            id: crypto.randomUUID(),
            institution: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            description: "",
        };
        addItem("education", newEdu);
    };

    const updateEducation = (index: number, field: keyof Education, value: string) => {
        const item = { ...education[index], [field]: value };
        setNestedField("education", index, item);
    };

    const handleEduAISuggest = async (index: number) => {
        const edu = education[index];
        if (!edu) return;
        setAiEduLoadingId(edu.id);
        try {
            const bullets = await suggestEducationHighlights({
                degree: edu.degree,
                field: edu.field,
                institution: edu.institution,
            });
            updateEducation(index, "description", bullets);
            toast.success("Education highlights added");
        } catch (e) {
            console.error(e);
            toast.error(e instanceof Error ? e.message : "AI request failed");
        } finally {
            setAiEduLoadingId(null);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <BookOpen className="w-4 h-4 text-neon-green" />
                <span>Education</span>
            </div>
            <Accordion type="multiple" className="space-y-2">
                {education.map((edu, index) => (
                    <AccordionItem key={edu.id} value={edu.id} className="border-white/10 rounded-lg bg-white/[0.02] px-3">
                        <AccordionTrigger className="text-xs hover:no-underline py-3">
              <span className="truncate text-left">
                {edu.degree || "New Degree"} {edu.institution && `— ${edu.institution}`}
              </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(index, "institution", e.target.value)}
                                    placeholder="Institution"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                                />
                                <Input
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                    placeholder="Degree"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                                />
                                <Input
                                    value={edu.field}
                                    onChange={(e) => updateEducation(index, "field", e.target.value)}
                                    placeholder="Field of Study"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                                />
                                <Input
                                    value={edu.startDate}
                                    onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                                    placeholder="Start"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                                />
                            </div>
                            <Input
                                value={edu.endDate}
                                onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                                placeholder="End Date"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                            />
                            <Textarea
                                value={edu.description}
                                onChange={(e) => updateEducation(index, "description", e.target.value)}
                                placeholder="Description, honors, GPA..."
                                rows={2}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs resize-none"
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => void handleEduAISuggest(index)}
                                    disabled={aiEduLoadingId === edu.id}
                                    className="text-neon-green hover:text-neon-green hover:bg-neon-green/10 gap-1.5 h-7 text-xs"
                                >
                                    {aiEduLoadingId === edu.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                    AI Suggest
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem("education", index)}
                                    className="text-red-400 hover:text-red-400 hover:bg-red-400/10 gap-1.5 h-7 text-xs ml-auto"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Remove
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <Button
                onClick={addEducation}
                variant="outline"
                className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 gap-2 text-xs"
            >
                <Plus className="w-3.5 h-3.5" />
                Add Education
            </Button>
        </div>
    );
}

function AchievementsSection() {
    const achievements = useResumeStore((s) => s.resume.achievements);
    const setField = useResumeStore((s) => s.setField);
    const [input, setInput] = useState("");

    const add = () => {
        if (!input.trim()) return;
        setField("achievements", [...achievements, input.trim()]);
        setInput("");
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <Award className="w-4 h-4 text-neon-green" />
                <span>Achievements</span>
            </div>
            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
                    placeholder="Add an achievement"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50"
                />
                <Button
                    onClick={add}
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/10 hover:text-white shrink-0"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="space-y-1.5">
                {achievements.map((ach, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <Award className="w-3 h-3 text-neon-green shrink-0" />
                        <span className="text-white/70 flex-1">{ach}</span>
                        <button onClick={() => setField("achievements", achievements.filter((_, idx) => idx !== i))}>
                            <X className="w-3 h-3 text-white/40 hover:text-red-400" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LanguagesSection() {
    const languages = useResumeStore((s) => s.resume.languages);
    const addItem = useResumeStore((s) => s.addItem);
    const removeItem = useResumeStore((s) => s.removeItem);

    const addLanguage = () => {
        const newLang: Language = {
            id: crypto.randomUUID(),
            name: "",
            proficiency: "Fluent",
        };
        addItem("languages", newLang);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <Languages className="w-4 h-4 text-neon-green" />
                <span>Languages</span>
            </div>
            <div className="space-y-2">
                {languages.map((lang, index) => (
                    <div key={lang.id} className="flex gap-2 items-center">
                        <Input
                            value={lang.name}
                            onChange={(e) => {
                                const updated = [...languages];
                                updated[index] = { ...lang, name: e.target.value };
                                useResumeStore.getState().setField("languages", updated);
                            }}
                            placeholder="Language"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8 flex-1"
                        />
                        <Input
                            value={lang.proficiency}
                            onChange={(e) => {
                                const updated = [...languages];
                                updated[index] = { ...lang, proficiency: e.target.value };
                                useResumeStore.getState().setField("languages", updated);
                            }}
                            placeholder="Proficiency"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8 w-28"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem("languages", index)}
                            className="text-white/40 hover:text-red-400 h-8 w-8"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                ))}
            </div>
            <Button
                onClick={addLanguage}
                variant="outline"
                className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 gap-2 text-xs"
            >
                <Plus className="w-3.5 h-3.5" />
                Add Language
            </Button>
        </div>
    );
}

function ReferencesSection() {
    const references = useResumeStore((s) => s.resume.references);
    const addItem = useResumeStore((s) => s.addItem);
    const removeItem = useResumeStore((s) => s.removeItem);

    const addReference = () => {
        const newRef: Reference = {
            id: crypto.randomUUID(),
            name: "",
            relation: "",
            contact: "",
        };
        addItem("references", newRef);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <UserCircle className="w-4 h-4 text-neon-green" />
                <span>References</span>
            </div>
            <div className="space-y-2">
                {references.map((ref, index) => (
                    <div key={ref.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                        <Input
                            value={ref.name}
                            onChange={(e) => {
                                const updated = [...references];
                                updated[index] = { ...ref, name: e.target.value };
                                useResumeStore.getState().setField("references", updated);
                            }}
                            placeholder="Name"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                        />
                        <Input
                            value={ref.relation}
                            onChange={(e) => {
                                const updated = [...references];
                                updated[index] = { ...ref, relation: e.target.value };
                                useResumeStore.getState().setField("references", updated);
                            }}
                            placeholder="Relation"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem("references", index)}
                            className="text-white/40 hover:text-red-400 h-8 w-8"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                ))}
                {references.length > 0 && (
                    <div className="space-y-2">
                        {references.map((ref, index) => (
                            <Input
                                key={`contact-${ref.id}`}
                                value={ref.contact}
                                onChange={(e) => {
                                    const updated = [...references];
                                    updated[index] = { ...ref, contact: e.target.value };
                                    useResumeStore.getState().setField("references", updated);
                                }}
                                placeholder="Contact info"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                            />
                        ))}
                    </div>
                )}
            </div>
            <Button
                onClick={addReference}
                variant="outline"
                className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 gap-2 text-xs"
            >
                <Plus className="w-3.5 h-3.5" />
                Add Reference
            </Button>
        </div>
    );
}

function CustomSections() {
    const sections = useResumeStore((s) => s.resume.customSections);
    const addItem = useResumeStore((s) => s.addItem);
    const removeItem = useResumeStore((s) => s.removeItem);

    const addSection = () => {
        const newSection: CustomSection = {
            id: crypto.randomUUID(),
            title: "",
            content: "",
        };
        addItem("customSections", newSection);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <Layers className="w-4 h-4 text-neon-green" />
                <span>Custom Sections</span>
            </div>
            <Accordion type="multiple" className="space-y-2">
                {sections.map((section, index) => (
                    <AccordionItem key={section.id} value={section.id} className="border-white/10 rounded-lg bg-white/[0.02] px-3">
                        <AccordionTrigger className="text-xs hover:no-underline py-3">
                            <span className="truncate text-left">{section.title || "New Section"}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 space-y-2">
                            <Input
                                value={section.title}
                                onChange={(e) => {
                                    const updated = [...sections];
                                    updated[index] = { ...section, title: e.target.value };
                                    useResumeStore.getState().setField("customSections", updated);
                                }}
                                placeholder="Section Title"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                            />
                            <Textarea
                                value={section.content}
                                onChange={(e) => {
                                    const updated = [...sections];
                                    updated[index] = { ...section, content: e.target.value };
                                    useResumeStore.getState().setField("customSections", updated);
                                }}
                                placeholder="Section content..."
                                rows={3}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs resize-none"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem("customSections", index)}
                                className="text-red-400 hover:text-red-400 hover:bg-red-400/10 gap-1.5 h-7 text-xs"
                            >
                                <Trash2 className="w-3 h-3" />
                                Remove
                            </Button>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <Button
                onClick={addSection}
                variant="outline"
                className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 gap-2 text-xs"
            >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Section
            </Button>
        </div>
    );
}
