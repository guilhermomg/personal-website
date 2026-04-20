import type { APIRoute } from "astro";
import { verifyAdminRequest } from "../../../../lib/apiAuth";
import sql from "../../../../lib/db";

export const POST: APIRoute = async ({ request, cookies }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    try {
        const body = await request.json() as any;

        if (!body.name) {
            return new Response(JSON.stringify({ message: "Missing required field: name" }), { status: 400 });
        }

        const [project] = await sql`
            INSERT INTO projects (name, description, tags, link, github_link, "order", status)
            VALUES (
                ${body.name},
                ${body.description || null},
                ${body.tags || []},
                ${body.link || null},
                ${body.github_link || null},
                ${body.order ?? 0},
                ${body.status || "draft"}
            )
            RETURNING *
        `;

        return new Response(JSON.stringify(project), { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};
