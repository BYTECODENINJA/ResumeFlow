/**
 * Public HTTPS endpoint Safaricom calls after STK payment attempt.
 * Log or persist callback JSON for reconciliation; acknowledge with 200.
 * Set MPESA_CALLBACK_URL to:
 * https://YOUR_REF.supabase.co/functions/v1/mpesa-stk-callback
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const body = await req.text();
        console.log("[mpesa-stk-callback]", body.slice(0, 2000));
        // Optionally: parse Body.stkCallback and write to DB for audit.
    } catch {
        /* ignore */
    }

    return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Callback received" }),
        { headers: { "Content-Type": "application/json" } }
    );
});
