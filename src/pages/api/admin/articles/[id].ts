import type { APIRoute } from "astro";
import { verifyAdminRequest } from "../../../../lib/apiAuth";
import sql from "../../../../lib/db";

export const PUT: APIRoute = async ({ request, cookies, params }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    const { id } = params;
    if (!id) return new Response(JSON.stringify({ message: "Missing article ID" }), { status: 400 });

    try {
        const body = await request.json() as any;

        const [article] = await sql`
            UPDATE articles SET
                title = ${body.title},
                slug = ${body.slug},
                content = ${body.content},
                status = ${body.status || "draft"},
                description = ${body.description || null},
                featured_image = ${body.featured_image || null},
                keywords = ${body.keywords || null},
                excerpt = ${body.excerpt || null},
                read_time = ${body.read_time || null},
                published_at = ${body.status === "published" ? (body.published_at || new Date().toISOString()) : null},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        if (!article) return new Response(JSON.stringify({ message: "Article not found" }), { status: 404 });
        return new Response(JSON.stringify(article), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    const { id } = params;
    if (!id) return new Response(JSON.stringify({ message: "Missing article ID" }), { status: 400 });

    try {
        await sql`DELETE FROM articles WHERE id = ${id}`;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};
