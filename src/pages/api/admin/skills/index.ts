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

        const [category] = await sql`
            INSERT INTO skill_categories (name, description, parent_category_id, sort_order, is_active)
            VALUES (${body.name}, ${body.description || null}, ${body.parent_category_id || null},
                    ${body.sort_order ?? 0}, true)
            RETURNING *
        `;

        const categoryId = category.id;
        const languages = body.languages as string[] || [];

        // Create subcategories with their skills
        if (body.subcategories?.length) {
            for (const subcat of body.subcategories) {
                const [subcatRow] = await sql`
                    INSERT INTO skill_categories (name, parent_category_id, is_active)
                    VALUES (${subcat.name}, ${categoryId}, true)
                    RETURNING *
                `;

                for (const skillName of (subcat.skills || [])) {
                    const [skill] = await sql`
                        INSERT INTO skills (skill_category_id, is_active)
                        VALUES (${subcatRow.id}, true)
                        RETURNING *
                    `;
                    for (const lang of languages) {
                        await sql`
                            INSERT INTO skill_translations (skill_id, language_code, name)
                            VALUES (${skill.id}, ${lang}, ${skillName})
                        `;
                    }
                }
            }
        }

        // Create direct skills (no subcategory)
        if (body.skills?.length) {
            for (const skillName of body.skills) {
                const [skill] = await sql`
                    INSERT INTO skills (skill_category_id, is_active)
                    VALUES (${categoryId}, true)
                    RETURNING *
                `;
                for (const lang of languages) {
                    await sql`
                        INSERT INTO skill_translations (skill_id, language_code, name)
                        VALUES (${skill.id}, ${lang}, ${skillName})
                    `;
                }
            }
        }

        return new Response(JSON.stringify(category), { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};
