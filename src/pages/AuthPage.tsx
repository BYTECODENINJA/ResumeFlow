import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AuthPage() {
    const { user, loading, signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string })?.from || "/builder";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);

    if (!loading && user) {
        return <Navigate to={from} replace />;
    }

    const onSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        const { error } = await signIn(email, password);
        setBusy(false);
        if (error) {
            toast.error(error.message);
            return;
        }
        toast.success("Signed in");
        navigate(from, { replace: true });
    };

    const onSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setBusy(true);
        const { error } = await signUp(email, password);
        setBusy(false);
        if (error) {
            toast.error(error.message);
            return;
        }
        toast.success("Check your email to confirm your account, then sign in.");
    };

    const inputCls =
        "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon-green/50";

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <header className="h-16 border-b border-white/10 flex items-center px-4 gap-4">
                <Link to="/">
                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <span className="font-semibold tracking-tight">ResumeFlow — Sign in</span>
            </header>
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-neon-green flex items-center justify-center mx-auto">
                            <span className="text-black font-bold">RF</span>
                        </div>
                        <h1 className="text-2xl font-bold">Your resumes, everywhere</h1>
                        <p className="text-sm text-white/45">Save to the cloud and open them anytime from My Resumes.</p>
                    </div>

                    <Tabs defaultValue="signin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                            <TabsTrigger value="signin" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
                                Sign in
                            </TabsTrigger>
                            <TabsTrigger value="signup" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
                                Sign up
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="signin" className="mt-6">
                            <form onSubmit={onSignIn} className="space-y-4">
                                <div>
                                    <Label className="text-xs text-white/60">Email</Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className={`mt-1.5 ${inputCls}`}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-white/60">Password</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                        className={`mt-1.5 ${inputCls}`}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={busy}
                                    className="w-full bg-neon-green text-black hover:bg-neon-green/90 font-semibold"
                                >
                                    {busy ? "Signing in…" : "Sign in"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup" className="mt-6">
                            <form onSubmit={onSignUp} className="space-y-4">
                                <div>
                                    <Label className="text-xs text-white/60">Email</Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className={`mt-1.5 ${inputCls}`}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-white/60">Password</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        className={`mt-1.5 ${inputCls}`}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={busy}
                                    className="w-full bg-neon-green text-black hover:bg-neon-green/90 font-semibold"
                                >
                                    {busy ? "Creating account…" : "Create account"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
