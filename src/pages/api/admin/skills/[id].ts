import type { APIRoute } from "astro";
import { verifyAdminRequest } from "../../../../lib/apiAuth";
import sql from "../../../../lib/db";

export const PUT: APIRoute = async ({ request, cookies, params }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    const { id } = params;
    if (!id) return new Response(JSON.stringify({ message: "Missing skill category ID" }), { status: 400 });

    try {
        const body = await request.json() as any;

        // Update main category
        await sql`
            UPDATE skill_categories SET
                name = ${body.name},
                description = ${body.description || null},
                parent_category_id = ${body.parent_category_id || null},
                sort_order = ${body.sort_order ?? 0}
            WHERE id = ${id}
        `;

        const languages = body.languages as string[] || [];

        // Handle direct skills (not in subcategories)
        const keepSkillIds = (body.skills || []).filter((s: any) => s.id).map((s: any) => s.id);
        if (keepSkillIds.length > 0) {
            await sql`DELETE FROM skills WHERE skill_category_id = ${id} AND id != ALL(${keepSkillIds})`;
        } else {
            await sql`DELETE FROM skills WHERE skill_category_id = ${id}`;
        }

        for (const skill of (body.skills || [])) {
            if (skill.id) {
                // Update existing skill translations
                for (const lang of languages) {
                    const existing = skill.translations?.find((t: any) => t.language_code === lang);
                    const name = existing?.name || skill.name || "";
                    await sql`
                        INSERT INTO skill_translations (skill_id, language_code, name)
                        VALUES (${skill.id}, ${lang}, ${name})
                        ON CONFLICT (skill_id, language_code) DO UPDATE SET name = EXCLUDED.name
                    `;
                }
            } else {
                // New skill
                const [newSkill] = await sql`INSERT INTO skills (skill_category_id, is_active) VALUES (${id}, true) RETURNING *`;
                for (const lang of languages) {
                    await sql`INSERT INTO skill_translations (skill_id, language_code, name) VALUES (${newSkill.id}, ${lang}, ${skill.name || ""})`;
                }
            }
        }

        // Handle subcategories
        const keepSubcatIds = (body.subcategories || []).filter((sc: any) => sc.id).map((sc: any) => sc.id);
        if (keepSubcatIds.length > 0) {
            await sql`DELETE FROM skill_categories WHERE parent_category_id = ${id} AND id != ALL(${keepSubcatIds})`;
        } else {
            await sql`DELETE FROM skill_categories WHERE parent_category_id = ${id}`;
        }

        for (const subcat of (body.subcategories || [])) {
            let subcatId = subcat.id;
            if (subcatId) {
                await sql`UPDATE skill_categories SET name = ${subcat.name} WHERE id = ${subcatId}`;
            } else {
                const [newSubcat] = await sql`INSERT INTO skill_categories (name, parent_category_id, is_active) VALUES (${subcat.name}, ${id}, true) RETURNING *`;
                subcatId = newSubcat.id;
            }

            const keepSkillIdsForSubcat = (subcat.skills || []).filter((s: any) => s.id).map((s: any) => s.id);
            if (keepSkillIdsForSubcat.length > 0) {
                await sql`DELETE FROM skills WHERE skill_category_id = ${subcatId} AND id != ALL(${keepSkillIdsForSubcat})`;
            } else {
                await sql`DELETE FROM skills WHERE skill_category_id = ${subcatId}`;
            }

            for (const skill of (subcat.skills || [])) {
                if (skill.id) {
                    for (const lang of languages) {
                        const existing = skill.translations?.find((t: any) => t.language_code === lang);
                        const name = existing?.name || skill.name || "";
                        await sql`
                            INSERT INTO skill_translations (skill_id, language_code, name)
                            VALUES (${skill.id}, ${lang}, ${name})
                            ON CONFLICT (skill_id, language_code) DO UPDATE SET name = EXCLUDED.name
                        `;
                    }
                } else {
                    const [newSkill] = await sql`INSERT INTO skills (skill_category_id, is_active) VALUES (${subcatId}, true) RETURNING *`;
                    for (const lang of languages) {
                        await sql`INSERT INTO skill_translations (skill_id, language_code, name) VALUES (${newSkill.id}, ${lang}, ${skill.name || ""})`;
                    }
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
    const authErr = await verifyAdminRequest(cookies);
    if (authErr) return authErr;

    const { id } = params;
    if (!id) return new Response(JSON.stringify({ message: "Missing skill category ID" }), { status: 400 });

    try {
        await sql`DELETE FROM skill_categories WHERE id = ${id}`;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
};
