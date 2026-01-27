import type { APIRoute } from "astro";
import { createServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
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
        if (!body.title || !body.company || !body.start_month || !body.start_year) {
            return new Response(
                JSON.stringify({
                    message: "Missing required fields (title, company, start_month, start_year)",
                }),
                { status: 400 }
            );
        }

        // Insert experience
        const { data, error } = await supabase
            .from("experiences")
            .insert({
                title: body.title,
                company: body.company,
                location: body.location || null,
                start_month: body.start_month,
                start_year: body.start_year,
                end_month: body.end_month || null,
                end_year: body.end_year || null,
                description: body.description || [],
                skills: body.skills || [],
                is_published: body.is_published !== false,
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return new Response(
                JSON.stringify({ message: "Failed to create experience" }),
                { status: 500 }
            );
        }

        return new Response(JSON.stringify(data), { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ message: "Internal server error" }),
            { status: 500 }
        );
    }
};
