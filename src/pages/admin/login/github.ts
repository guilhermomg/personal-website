import type { APIRoute } from "astro";

export const GET: APIRoute = ({ redirect }) => {
    const clientId = import.meta.env.GITHUB_CLIENT_ID;
    const params = new URLSearchParams({
        client_id: clientId,
        scope: "read:user",
        allow_signup: "false",
    });
    return redirect(`https://github.com/login/oauth/authorize?${params}`);
};
