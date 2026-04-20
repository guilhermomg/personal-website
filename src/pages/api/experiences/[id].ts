import type { APIRoute } from "astro";
import { verifyAdminRequest } from "../../../lib/apiAuth";
import sql from "../../../lib/db";

export const PUT: APIRoute = async ({ request, cookies, params }) => {
    try {
        const authErr = await verifyAdminRequest(cookies);
        if (authErr) return authErr;

        const { id } = params;

        if (!id) {
            return new Response(
                JSON.stringify({ message: "Missing experience ID" }),
                { status: 400 }
            );
        }

        const body = await request.json() as any;

        // Validate required fields
        if (!body.company || !body.start_month || !body.start_year) {
            return new Response(
                JSON.stringify({
                    message: "Missing required fields (company, start_month, start_year)",
                }),
                { status: 400 }
            );
        }

        // Validate translations
        if (!body.translations || Object.keys(body.translations).length === 0) {
            return new Response(
                JSON.stringify({
                    message: "At least one language translation is required",
                }),
                { status: 400 }
            );
        }

        const [experience] = await sql`
            UPDATE experiences SET
                company = ${body.company},
                start_month = ${body.start_month},
                start_year = ${body.start_year},
                end_month = ${body.end_month || null},
                end_year = ${body.end_year || null},
                is_published = ${body.is_published !== false}
            WHERE id = ${id}
            RETURNING *
        `;

        await sql`DELETE FROM experience_translations WHERE experience_id = ${id}`;

        const translationsToInsert = Object.entries(body.translations).map(
            ([lang, translation]: [string, any]) => ({
                experience_id: id,
                language_code: lang,
                title: translation.title,
                location: translation.location || null,
                description: translation.description || [],
                skills: translation.skills || [],
            })
        );

        for (const t of translationsToInsert) {
            await sql`
                INSERT INTO experience_translations
                    (experience_id, language_code, title, location, description, skills)
                VALUES (${t.experience_id}, ${t.language_code}, ${t.title},
                        ${t.location}, ${t.description}, ${t.skills})
            `;
        }

        return new Response(JSON.stringify(experience), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ message: "Internal server error" }),
            { status: 500 }
        );
    }
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
    try {
        const authErr = await verifyAdminRequest(cookies);
        if (authErr) return authErr;

        const { id } = params;

        if (!id) {
            return new Response(
                JSON.stringify({ message: "Missing experience ID" }),
                { status: 400 }
            );
        }

        await sql`DELETE FROM experiences WHERE id = ${id}`;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ message: "Internal server error" }),
            { status: 500 }
        );
    }
};
