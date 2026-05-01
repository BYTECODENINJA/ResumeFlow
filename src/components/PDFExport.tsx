import { useRef, useState, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import { computeThemeColors } from "@/lib/themes";

export function PDFExportButton() {
    const [isExporting, setIsExporting] = useState(false);
    const resume = useResumeStore((s) => s.resume);
    const theme = useResumeStore((s) => s.theme);

    const handleExport = useCallback(async () => {
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

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-neon-green text-black hover:bg-neon-green/90 font-semibold gap-2"
        >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? "Exporting..." : "Export PDF"}
        </Button>
    );
}
