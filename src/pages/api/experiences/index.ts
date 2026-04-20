import type { APIRoute } from "astro";
import { verifyAdminRequest } from "../../../lib/apiAuth";
import sql from "../../../lib/db";

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const authErr = await verifyAdminRequest(cookies);
        if (authErr) return authErr;

        const body = await request.json() as any;

        if (!body.company || !body.start_month || !body.start_year) {
            return new Response(
                JSON.stringify({ message: "Missing required fields (company, start_month, start_year)" }),
                { status: 400 }
            );
        }
        if (!body.translations || Object.keys(body.translations).length === 0) {
            return new Response(
                JSON.stringify({ message: "At least one language translation is required" }),
                { status: 400 }
            );
        }

        const [experience] = await sql`
            INSERT INTO experiences (company, start_month, start_year, end_month, end_year, is_published)
            VALUES (${body.company}, ${body.start_month}, ${body.start_year},
                    ${body.end_month || null}, ${body.end_year || null}, ${body.is_published !== false})
            RETURNING *
        `;

        const translationsToInsert = Object.entries(body.translations).map(
            ([lang, translation]: [string, any]) => ({
                experience_id: experience.id,
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

        return new Response(JSON.stringify(experience), { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};
