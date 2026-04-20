import type { AstroCookies } from "astro";
import { getSessionUser } from "./auth";

export async function verifyAdminRequest(cookies: AstroCookies): Promise<Response | null> {
    const user = await getSessionUser(cookies);
    if (!user) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }
    return null;
}
