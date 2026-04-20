import type { APIRoute } from "astro";
import { getDownloadUrl } from "@vercel/blob";

export const prerender = false;

const BLOB_HOST = "vercel-storage.com";

export const GET: APIRoute = async ({ url }) => {
    const blobUrl = url.searchParams.get("url");

    if (!blobUrl) {
        return new Response("Missing url parameter", { status: 400 });
    }

    // Only proxy URLs from our own Vercel Blob store
    let parsed: URL;
    try {
        parsed = new URL(blobUrl);
    } catch {
        return new Response("Invalid url", { status: 400 });
    }

    if (!parsed.hostname.endsWith(BLOB_HOST)) {
        return new Response("Forbidden", { status: 403 });
    }

    const downloadUrl = await getDownloadUrl(blobUrl, {
        token: import.meta.env.BLOB_READ_WRITE_TOKEN,
    });

    return new Response(null, {
        status: 302,
        headers: { Location: downloadUrl },
    });
};
