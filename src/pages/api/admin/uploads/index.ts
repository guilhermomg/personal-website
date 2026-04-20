import type { APIRoute } from "astro";
import { put } from "@vercel/blob";
import { verifyAdminRequest } from "../../../../lib/apiAuth";

export const POST: APIRoute = async ({ request, cookies }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return new Response(JSON.stringify({ message: "No file provided" }), { status: 400 });
        }

        if (file.size > 1 * 1024 * 1024) {
            return new Response(JSON.stringify({ message: "File must be less than 1MB" }), { status: 400 });
        }

        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!allowed.includes(file.type)) {
            return new Response(JSON.stringify({ message: "Unsupported image type" }), { status: 400 });
        }

        const ext = file.type.split("/")[1].replace("jpeg", "jpg");
        const filename = `articles/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

        const blob = await put(filename, file, {
            access: "private",
            token: import.meta.env.BLOB_READ_WRITE_TOKEN,
        });

        return new Response(JSON.stringify({ url: blob.url }), { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return new Response(JSON.stringify({ message: "Upload failed" }), { status: 500 });
    }
};
