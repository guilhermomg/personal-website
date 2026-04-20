import type { APIRoute } from "astro";
import { verifyAdminRequest } from "../../../../lib/apiAuth";
import sql from "../../../../lib/db";

export const POST: APIRoute = async ({ request, cookies }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    try {
        const body = await request.json() as any;

        if (!body.title || !body.slug || !body.content) {
            return new Response(JSON.stringify({ message: "Missing required fields (title, slug, content)" }), { status: 400 });
        }

        const [article] = await sql`
            INSERT INTO articles (title, slug, content, status, description, featured_image, keywords, excerpt, read_time, published_at)
            VALUES (
                ${body.title},
                ${body.slug},
                ${body.content},
                ${body.status || "draft"},
                ${body.description || null},
                ${body.featured_image || null},
                ${body.keywords || null},
                ${body.excerpt || null},
                ${body.read_time || null},
                ${body.status === "published" ? (body.published_at || new Date().toISOString()) : null}
            )
            RETURNING *
        `;

        return new Response(JSON.stringify(article), { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};
