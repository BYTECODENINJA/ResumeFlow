const UNLOCK_KEY = "resumeflow_export_mpesa_until";
const HARDCODED_FREE_EMAILS = ["josephmulwa8055@gmail.com", "dawinson435@gmail.com"];

export function exportPriceKes(): number {
    const raw = import.meta.env.VITE_EXPORT_PRICE_KES;
    const n = raw ? Number(raw) : 50;
    return Number.isFinite(n) && n > 0 ? n : 50;
}

export function isExportSkipPayment(): boolean {
    return import.meta.env.VITE_EXPORT_SKIP_PAYMENT === "true";
}

export function isFreeExportEmail(email?: string | null): boolean {
    const e = (email || "").trim().toLowerCase();
    if (!e) return false;
    if (HARDCODED_FREE_EMAILS.includes(e)) return true;
    const raw = (import.meta.env.VITE_EXPORT_FREE_EMAILS || "") as string;
    const extra = raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    return extra.includes(e);
}

export function isExportUnlocked(): boolean {
    if (isExportSkipPayment()) return true;
    const raw = sessionStorage.getItem(UNLOCK_KEY);
    if (!raw) return false;
    const until = Number(raw);
    return Number.isFinite(until) && until > Date.now();
}

export function setExportUnlocked(durationMs: number): void {
    sessionStorage.setItem(UNLOCK_KEY, String(Date.now() + durationMs));
}

function normalizeKenyaMsisdn(raw: string): string | null {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("254") && digits.length === 12) return digits;
    if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
    if (digits.length === 9 && digits.startsWith("7")) return `254${digits}`;
    return null;
}

export interface StkPushResult {
    ok: boolean;
    checkoutRequestId?: string;
    customerMessage?: string;
    error?: string;
}

export async function requestMpesaStkPush(phone: string, amount: number): Promise<StkPushResult> {
    const msisdn = normalizeKenyaMsisdn(phone);
    if (!msisdn) {
        return { ok: false, error: "Enter a valid Kenya number (e.g. 07XX XXX XXX)." };
    }

    const base = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const fnName = import.meta.env.VITE_MPESA_FUNCTION_NAME || "mpesa-daraja";

    if (!base || !anon) {
        return { ok: false, error: "Supabase URL or anon key missing for payment function." };
    }

    const res = await fetch(`${base}/functions/v1/${fnName}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${anon}`,
            apikey: anon,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "stk-push", phone: msisdn, amount }),
    });

    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
        return { ok: false, error: (json.error as string) || res.statusText || "STK push failed" };
    }

    const checkoutRequestId = json.checkoutRequestId as string | undefined;
    const responseCode = String(json.responseCode ?? "");
    if (responseCode && responseCode !== "0") {
        return { ok: false, error: (json.responseDescription as string) || "M-Pesa rejected the request" };
    }

    return {
        ok: true,
        checkoutRequestId,
        customerMessage: json.customerMessage as string | undefined,
    };
}

export interface StkQueryResult {
    paid: boolean;
    pending?: boolean;
    message?: string;
}

export async function queryMpesaStkStatus(checkoutRequestId: string): Promise<StkQueryResult> {
    const base = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const fnName = import.meta.env.VITE_MPESA_FUNCTION_NAME || "mpesa-daraja";

    if (!base || !anon) {
        return { paid: false, message: "Missing Supabase env" };
    }

    const res = await fetch(`${base}/functions/v1/${fnName}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${anon}`,
            apikey: anon,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "stk-query", checkoutRequestId }),
    });

    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
        return { paid: false, message: (json.error as string) || "Query failed" };
    }

    const resultCodeRaw = json.resultCode ?? json.ResultCode;
    const resultCode = resultCodeRaw !== undefined ? String(resultCodeRaw) : "";
    if (resultCode === "0") {
        return { paid: true };
    }

    /**
     * 1032 = Request cancelled by user; 1037 = Timeout; 4999 = Pending / unclear — treat pending
     */
    if (["4999", ""].includes(resultCode) || !resultCode) {
        return { paid: false, pending: true, message: (json.resultDesc as string) || "Awaiting confirmation" };
    }

    return { paid: false, message: (json.resultDesc as string) || "Not completed yet" };
}

export async function waitForMpesaPayment(
    checkoutRequestId: string,
    opts: { maxAttempts?: number; intervalMs?: number } = {}
): Promise<boolean> {
    const maxAttempts = opts.maxAttempts ?? 20;
    const intervalMs = opts.intervalMs ?? 3000;

    for (let i = 0; i < maxAttempts; i++) {
        const q = await queryMpesaStkStatus(checkoutRequestId);
        if (q.paid) return true;
        if (!q.pending && q.message?.toLowerCase().includes("cancel")) return false;
        await new Promise((r) => setTimeout(r, intervalMs));
    }
    return false;
}
