import { useState, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import { ExportPaywallDialog } from "@/components/ExportPaywallDialog";
import { isExportUnlocked, isFreeExportEmail } from "@/lib/payment";
import { useAuth } from "@/contexts/AuthContext";

export function PDFExportButton({ disabled = false }: { disabled?: boolean }) {
    const [isExporting, setIsExporting] = useState(false);
    const [paywallOpen, setPaywallOpen] = useState(false);
    const resume = useResumeStore((s) => s.resume);
    const theme = useResumeStore((s) => s.theme);
    const { user } = useAuth();

    const doExport = useCallback(async () => {
        const previewEl = document.getElementById("resume-preview-canvas");
        if (!previewEl) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(previewEl, {
                scale: 2,
                useCORS: true,
                backgroundColor: theme.background,
                logging: false,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [canvas.width / 2, canvas.height / 2],
            });

            pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`${resume.fullName || "Resume"}_ResumeFlow.pdf`);
        } catch (err) {
            console.error("PDF export failed:", err);
        } finally {
            setIsExporting(false);
        }
    }, [resume.fullName, theme.background]);

    const handleClick = () => {
        if (disabled) return;
        if (isFreeExportEmail(user?.email) || isExportUnlocked()) {
            void doExport();
            return;
        }
        setPaywallOpen(true);
    };

    return (
        <>
            <ExportPaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} onPaid={() => void doExport()} />
            <Button
                onClick={handleClick}
                disabled={disabled || isExporting}
                title={disabled ? "Sign in and use the full builder to export PDFs." : undefined}
                className="bg-neon-green text-black hover:bg-neon-green/90 font-semibold gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
        </>
    );
}
