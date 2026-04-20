import type { AstroCookies } from "astro";
import { getSessionUser } from "./auth";

export async function requireAdmin(cookies: AstroCookies): Promise<Response | string> {
    const user = await getSessionUser(cookies);
    if (!user) {
        return new Response(null, { status: 302, headers: { Location: "/admin/login" } });
    }
    return user.login;
}
