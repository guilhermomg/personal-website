import type { APIRoute } from "astro";
import { createServerClient } from "../../../lib/supabase";

export const PUT: APIRoute = async ({ request, cookies, params }) => {
    try {
        const { id } = params;

        if (!id) {
            return new Response(
                JSON.stringify({ message: "Missing experience ID" }),
                { status: 400 }
            );
        }

        const supabase = createServerClient(cookies);

        // Verify user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (!user || authError) {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 401 }
            );
        }

        // Verify user is admin
        const adminGithubUsername = import.meta.env.GITHUB_USERNAME;
        const userGithubUsername =
            user.user_metadata?.user_name ||
            user.user_metadata?.preferred_username;

        if (userGithubUsername !== adminGithubUsername) {
            return new Response(
                JSON.stringify({ message: "Forbidden" }),
                { status: 403 }
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

        // Update experience
        const { data, error } = await supabase
            .from("experiences")
            .update({
                company: body.company,
                start_month: body.start_month,
                start_year: body.start_year,
                end_month: body.end_month || null,
                end_year: body.end_year || null,
                is_published: body.is_published !== false,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return new Response(
                JSON.stringify({ message: "Failed to update experience" }),
                { status: 500 }
            );
        }

        // Upsert translations (delete old ones and insert new ones)
        // First, delete existing translations
        const { error: deleteError } = await supabase
            .from("experience_translations")
            .delete()
            .eq("experience_id", id);

        if (deleteError) {
            console.error("Delete translation error:", deleteError);
            return new Response(
                JSON.stringify({ message: "Failed to update translations" }),
                { status: 500 }
            );
        }

        // Then insert new translations
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

        const { error: insertError } = await supabase
            .from("experience_translations")
            .insert(translationsToInsert);

        if (insertError) {
            console.error("Insert translation error:", insertError);
            return new Response(
                JSON.stringify({ message: "Failed to update translations" }),
                { status: 500 }
            );
        }

        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ message: "Internal server error" }),
            { status: 500 }
        );
    }
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
    try {
        const { id } = params;

        if (!id) {
            return new Response(
                JSON.stringify({ message: "Missing experience ID" }),
                { status: 400 }
            );
        }

        const supabase = createServerClient(cookies);

        // Verify user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (!user || authError) {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 401 }
            );
        }

        // Verify user is admin
        const adminGithubUsername = import.meta.env.GITHUB_USERNAME;
        const userGithubUsername =
            user.user_metadata?.user_name ||
            user.user_metadata?.preferred_username;

        if (userGithubUsername !== adminGithubUsername) {
            return new Response(
                JSON.stringify({ message: "Forbidden" }),
                { status: 403 }
            );
        }

        // Delete experience
        const { error } = await supabase
            .from("experiences")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Supabase error:", error);
            return new Response(
                JSON.stringify({ message: "Failed to delete experience" }),
                { status: 500 }
            );
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ message: "Internal server error" }),
            { status: 500 }
        );
    }
};
