import type { APIRoute } from "astro";
import { verifyAdminRequest } from "../../../../lib/apiAuth";
import sql from "../../../../lib/db";

export const PUT: APIRoute = async ({ request, cookies, params }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    const { id } = params;
    if (!id) return new Response(JSON.stringify({ message: "Missing project ID" }), { status: 400 });

    try {
        const body = await request.json() as any;

        const [project] = await sql`
            UPDATE projects SET
                name = ${body.name},
                description = ${body.description || null},
                tags = ${body.tags || []},
                link = ${body.link || null},
                github_link = ${body.github_link || null},
                "order" = ${body.order ?? 0},
                status = ${body.status || "draft"},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        if (!project) return new Response(JSON.stringify({ message: "Project not found" }), { status: 404 });
        return new Response(JSON.stringify(project), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    const { id } = params;
    if (!id) return new Response(JSON.stringify({ message: "Missing project ID" }), { status: 400 });

    try {
        await sql`DELETE FROM projects WHERE id = ${id}`;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};
