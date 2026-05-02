import { useState } from "react";
import { Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    exportPriceKes,
    isExportSkipPayment,
    requestMpesaStkPush,
    setExportUnlocked,
    waitForMpesaPayment,
} from "@/lib/payment";
import { toast } from "sonner";

interface ExportPaywallDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPaid: () => void;
}

export function ExportPaywallDialog({ open, onOpenChange, onPaid }: ExportPaywallDialogProps) {
    const [phone, setPhone] = useState("");
    const [busy, setBusy] = useState(false);
    const price = exportPriceKes();

    const runExportAfterPay = () => {
        setExportUnlocked(24 * 60 * 60 * 1000);
        onPaid();
        onOpenChange(false);
        toast.success("Export unlocked for this browsing session.");
    };

    const handlePay = async () => {
        if (isExportSkipPayment()) {
            runExportAfterPay();
            return;
        }
        setBusy(true);
        try {
            const stk = await requestMpesaStkPush(phone, price);
            if (!stk.ok || !stk.checkoutRequestId) {
                toast.error(stk.error || "Could not start M-Pesa prompt");
                return;
            }
            toast.message("Check your phone", { description: stk.customerMessage || "Complete the STK push on your handset." });

            const ok = await waitForMpesaPayment(stk.checkoutRequestId);
            if (ok) {
                runExportAfterPay();
                toast.success("Payment confirmed");
            } else {
                toast.error("Payment not confirmed in time. Try again after completing STK.");
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Smartphone className="w-5 h-5 text-neon-green" />
                        Unlock PDF export
                    </DialogTitle>
                    <DialogDescription className="text-white/50 text-sm">
                        Export is a one-time fee of <span className="text-white font-medium">KES {price}</span> per session (24h) via M-Pesa STK
                        Push. Enter the Safaricom number that should receive the prompt.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-2">
                    <Label className="text-xs text-white/60">M-Pesa phone</Label>
                    <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XX XXX XXX"
                        disabled={busy}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" className="text-white/70" onClick={() => onOpenChange(false)} disabled={busy}>
                        Cancel
                    </Button>
                    <Button className="bg-neon-green text-black hover:bg-neon-green/90 font-semibold gap-2" disabled={busy} onClick={handlePay}>
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {busy ? "Processing…" : `Pay KES ${price} & export`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
