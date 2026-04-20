import type { APIRoute } from "astro";
import { verifyAdminRequest } from "../../../../lib/apiAuth";
import sql from "../../../../lib/db";

export const POST: APIRoute = async ({ request, cookies }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    try {
        const body = await request.json() as any;

        if (!body.language_code || !body.language_name) {
            return new Response(JSON.stringify({ message: "Missing required fields (language_code, language_name)" }), { status: 400 });
        }

        if (body.is_default) {
            await sql`UPDATE site_languages SET is_default = false`;
        }

        const [lang] = await sql`
            INSERT INTO site_languages (language_code, language_name, is_active, is_default)
            VALUES (${body.language_code}, ${body.language_name}, ${body.is_active !== false}, ${body.is_default === true})
            RETURNING *
        `;

        return new Response(JSON.stringify(lang), { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};
