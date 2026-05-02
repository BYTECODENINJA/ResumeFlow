import { useMemo, useState } from "react";
import { MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { submitBugReport } from "@/lib/supabase";
import { toast } from "sonner";

export function ReportBugDialogButton({ className = "" }: { className?: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className={`text-white/70 hover:text-white hover:bg-white/10 gap-2 h-8 text-xs ${className}`}
                onClick={() => setOpen(true)}
            >
                <MessageSquareWarning className="w-4 h-4" />
                Report bug
            </Button>
            <ReportBugDialog open={open} onOpenChange={setOpen} />
        </>
    );
}

export function ReportBugDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
    const { user } = useAuth();
    const [kind, setKind] = useState<"bug" | "suggestion">("bug");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "";
    const page = useMemo(() => {
        try {
            return window.location.pathname + window.location.search;
        } catch {
            return "";
        }
    }, []);

    const effectiveEmail = user?.email || email.trim();

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.error("Please add details.");
            return;
        }

        // Authenticated: store in Supabase for tracking.
        if (user) {
            setBusy(true);
            try {
                await submitBugReport({
                    user_id: user.id,
                    email: user.email ?? null,
                    kind,
                    page,
                    message: message.trim(),
                });
                toast.success("Thanks — submitted!");
                setMessage("");
                onOpenChange(false);
                return;
            } catch (e) {
                console.error(e);
                toast.error("Submit failed. Try email instead.");
            } finally {
                setBusy(false);
            }
        }

        // Guest/demo: fallback to email.
        if (!supportEmail) {
            toast.error("Support email not configured.");
            return;
        }
        const subject = encodeURIComponent(kind === "bug" ? "ResumeFlow bug report" : "ResumeFlow suggestion");
        const body = encodeURIComponent(
            `From: ${effectiveEmail || "(not provided)"}\nPage: ${page}\n\n${message.trim()}\n`
        );
        window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black border-white/10 text-white max-w-lg">
                <DialogHeader>
                    <DialogTitle>Report a bug / Suggest a change</DialogTitle>
                    <DialogDescription className="text-white/50">
                        Include what you expected, what happened, and steps to reproduce.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-white/60">Type</Label>
                        <Tabs value={kind} onValueChange={(v) => setKind(v as "bug" | "suggestion")}>
                            <TabsList className="bg-white/5 border border-white/10">
                                <TabsTrigger value="bug" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
                                    Bug
                                </TabsTrigger>
                                <TabsTrigger value="suggestion" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
                                    Suggestion
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {!user && (
                        <div className="space-y-2">
                            <Label className="text-xs text-white/60">Your email (optional)</Label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs text-white/60">Message</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Steps to reproduce…"
                            rows={5}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                        />
                        <p className="text-[10px] text-white/35">Page: {page || "-"}</p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" className="text-white/70" onClick={() => onOpenChange(false)} disabled={busy}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => void handleSubmit()}
                        disabled={busy}
                        className="bg-neon-green text-black hover:bg-neon-green/90 font-semibold"
                    >
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

