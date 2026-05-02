import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white/60">
                <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
            </div>
        );
    }

    if (!user) {
        const from = `${location.pathname}${location.search}`;
        return <Navigate to="/auth" state={{ from }} replace />;
    }

    return <>{children}</>;
}
