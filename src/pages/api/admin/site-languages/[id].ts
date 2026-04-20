import type { APIRoute } from "astro";
import { verifyAdminRequest } from "../../../../lib/apiAuth";
import sql from "../../../../lib/db";

export const PUT: APIRoute = async ({ request, cookies, params }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    const { id } = params;
    if (!id) return new Response(JSON.stringify({ message: "Missing language ID" }), { status: 400 });

    try {
        const body = await request.json() as any;

        if (body.is_default) {
            await sql`UPDATE site_languages SET is_default = false WHERE id != ${id}`;
        }

        const [lang] = await sql`
            UPDATE site_languages SET
                language_code = ${body.language_code},
                language_name = ${body.language_name},
                is_active = ${body.is_active},
                is_default = ${body.is_default ?? false},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        if (!lang) return new Response(JSON.stringify({ message: "Language not found" }), { status: 404 });
        return new Response(JSON.stringify(lang), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    const { id } = params;
    if (!id) return new Response(JSON.stringify({ message: "Missing language ID" }), { status: 400 });

    try {
        await sql`DELETE FROM site_languages WHERE id = ${id}`;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};
