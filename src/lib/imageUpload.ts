function loadBitmapFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not read image."));
        img.src = url;
    });
}

/** Resize and encode as JPEG to keep payloads small for storage and PDF canvas. */
export async function fileToCompressedJpegDataUrl(file: File, maxEdgePx = 400, quality = 0.88): Promise<string> {
    if (!file.type.startsWith("image/")) {
        throw new Error("Pick an image file.");
    }

    const url = URL.createObjectURL(file);
    try {
        const img = await loadBitmapFromUrl(url);
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) throw new Error("Invalid image dimensions.");

        const scale = Math.min(1, maxEdgePx / Math.max(w, h));
        const cw = Math.max(1, Math.round(w * scale));
        const ch = Math.max(1, Math.round(h * scale));

        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unsupported.");
        ctx.drawImage(img, 0, 0, cw, ch);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        if (dataUrl.length > 700_000) {
            throw new Error("Compressed image is still too large; try another photo.");
        }
        return dataUrl;
    } catch (e) {
        if (e instanceof Error && e.message.startsWith("Compressed")) throw e;
        throw e instanceof Error ? e : new Error("Processing failed.");
    } finally {
        URL.revokeObjectURL(url);
    }
}
