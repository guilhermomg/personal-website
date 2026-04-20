import type { APIRoute } from "astro";
import { verifyAdminRequest } from "../../../../lib/apiAuth";
import sql from "../../../../lib/db";

export const PUT: APIRoute = async ({ request, cookies }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    try {
        const body = await request.json() as any;

        if (body.type === "basic") {
            if (!body.id || !body.full_name) {
                return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
            }

            const [info] = await sql`
                UPDATE personal_info SET
                    full_name = ${body.full_name},
                    github_username = ${body.github_username || null},
                    email = ${body.email || null},
                    location = ${body.location || null},
                    linkedin_url = ${body.linkedin_url || null},
                    seo_description = ${body.seo_description || null},
                    seo_keywords = ${body.seo_keywords || null},
                    updated_at = NOW()
                WHERE id = ${body.id}
                RETURNING *
            `;
            return new Response(JSON.stringify(info), { status: 200 });
        }

        if (body.type === "translation") {
            if (!body.personal_info_id || !body.language_code) {
                return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
            }

            if (body.translation_id) {
                await sql`
                    UPDATE personal_info_translations SET
                        title = ${body.title},
                        subtitle = ${body.subtitle},
                        about_title = ${body.about_title},
                        about_description = ${body.about_description},
                        updated_at = NOW()
                    WHERE id = ${body.translation_id}
                `;
            } else {
                await sql`
                    INSERT INTO personal_info_translations
                        (personal_info_id, language_code, title, subtitle, about_title, about_description)
                    VALUES (${body.personal_info_id}, ${body.language_code}, ${body.title},
                            ${body.subtitle}, ${body.about_title}, ${body.about_description})
                `;
            }
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        if (body.type === "languages_spoken") {
            const personalInfoId = body.personal_info_id;
            if (!personalInfoId) {
                return new Response(JSON.stringify({ message: "Missing personal_info_id" }), { status: 400 });
            }

            await sql`DELETE FROM languages_spoken WHERE personal_info_id = ${personalInfoId}`;

            const langs = body.languages as Array<{
                flag_emoji: string;
                language_name: string;
                proficiency_level: string;
                order_index: number;
            }>;

            for (const lang of langs) {
                await sql`
                    INSERT INTO languages_spoken
                        (personal_info_id, flag_emoji, language_name, proficiency_level, order_index)
                    VALUES (${personalInfoId}, ${lang.flag_emoji || null}, ${lang.language_name},
                            ${lang.proficiency_level}, ${lang.order_index})
                `;
            }
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return new Response(JSON.stringify({ message: "Invalid type" }), { status: 400 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};
