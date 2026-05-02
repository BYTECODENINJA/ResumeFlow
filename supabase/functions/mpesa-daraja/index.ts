/**
 * Supabase Edge Function: M-Pesa Daraja STK Push + Query
 *
 * Secrets (Dashboard → Functions → mpesa-daraja → Secrets):
 *   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY,
 *   MPESA_CALLBACK_URL, MPESA_ENVIRONMENT (sandbox | live)
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function kenyaCompactTimestamp(): string {
    const offsetMs = 3 * 60 * 60 * 1000;
    const d = new Date(Date.now() + offsetMs);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

function darajaPassword(shortcode: string, passkey: string, timestamp: string): string {
    const raw = `${shortcode}${passkey}${timestamp}`;
    return btoa(raw);
}

function baseUrl(): string {
    const env = (Deno.env.get("MPESA_ENVIRONMENT") || "sandbox").toLowerCase();
    return env === "live" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
}

async function getAccessToken(): Promise<string> {
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    if (!consumerKey || !consumerSecret) {
        throw new Error("Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET");
    }
    const res = await fetch(`${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
            Authorization: `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`,
        },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.access_token) {
        throw new Error(`OAuth failed: ${JSON.stringify(json)}`);
    }
    return json.access_token as string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const action = body.action as string;

        const shortcode = Deno.env.get("MPESA_SHORTCODE");
        const passkey = Deno.env.get("MPESA_PASSKEY");
        const callback = Deno.env.get("MPESA_CALLBACK_URL");
        if (!shortcode || !passkey || !callback) {
            return new Response(JSON.stringify({ error: "Server missing MPESA_SHORTCODE, MPESA_PASSKEY, or MPESA_CALLBACK_URL" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const token = await getAccessToken();

        if (action === "stk-push") {
            const phone = String(body.phone || "");
            const amount = Number(body.amount);
            if (!phone || !Number.isFinite(amount) || amount < 1) {
                return new Response(JSON.stringify({ error: "phone and positive amount required" }), {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            const timestamp = kenyaCompactTimestamp();
            const password = darajaPassword(shortcode, passkey, timestamp);

            const stkRes = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    BusinessShortCode: Number(shortcode),
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: Math.round(amount),
                    PartyA: phone,
                    PartyB: Number(shortcode),
                    PhoneNumber: phone,
                    CallBackURL: callback,
                    AccountReference: "ResumeFlowExport",
                    TransactionDesc: "Resume PDF export",
                }),
            });

            const stkJson = await stkRes.json().catch(() => ({}));
            const merchantRequestId = stkJson.MerchantRequestID ?? stkJson.merchantRequestId;
            const checkoutRequestId = stkJson.CheckoutRequestID ?? stkJson.checkoutRequestId;
            const responseCode = String(stkJson.ResponseCode ?? stkJson.responseCode ?? "");
            const responseDescription = stkJson.ResponseDescription ?? stkJson.responseDescription ?? "";

            return new Response(
                JSON.stringify({
                    merchantRequestId,
                    checkoutRequestId,
                    responseCode,
                    responseDescription,
                    customerMessage: stkJson.CustomerMessage ?? stkJson.customerMessage,
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (action === "stk-query") {
            const checkoutRequestId = String(body.checkoutRequestId || "");
            if (!checkoutRequestId) {
                return new Response(JSON.stringify({ error: "checkoutRequestId required" }), {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            const timestamp = kenyaCompactTimestamp();
            const password = darajaPassword(shortcode, passkey, timestamp);

            const qRes = await fetch(`${baseUrl()}/mpesa/stkpushquery/v1/query`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    BusinessShortCode: Number(shortcode),
                    Password: password,
                    Timestamp: timestamp,
                    CheckoutRequestID: checkoutRequestId,
                }),
            });

            const qJson = await qRes.json().catch(() => ({}));
            const resultCode = qJson.ResultCode ?? qJson.resultCode;
            const resultDesc = qJson.ResultDesc ?? qJson.resultDesc ?? "";

            return new Response(
                JSON.stringify({
                    resultCode: resultCode !== undefined ? String(resultCode) : "",
                    resultDesc,
                    raw: qJson,
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(JSON.stringify({ error: "Unknown action — use stk-push or stk-query" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Internal error";
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
