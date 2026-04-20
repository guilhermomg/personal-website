import type { AstroCookies } from "astro";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

interface JWTPayload {
    sub: string;
    login: string;
    iat: number;
    exp: number;
}

function base64url(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function getKey(secret: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    return crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

export async function signJWT(
    payload: Omit<JWTPayload, "iat" | "exp">,
    secret: string
): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JWTPayload = { ...payload, iat: now, exp: now + COOKIE_MAX_AGE };

    const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
    const body = base64url(new TextEncoder().encode(JSON.stringify(fullPayload)));
    const sigInput = `${header}.${body}`;

    const key = await getKey(secret);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(sigInput));

    return `${sigInput}.${base64url(sig)}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const [header, body, sigB64] = parts;
        const sigInput = `${header}.${body}`;

        const key = await getKey(secret);
        const sig = base64urlDecode(sigB64);
        const valid = await crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(sigInput));
        if (!valid) return null;

        const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(body))) as JWTPayload;
        if (payload.exp < Math.floor(Date.now() / 1000)) return null;

        return payload;
    } catch {
        return null;
    }
}

export function setSessionCookie(cookies: AstroCookies, token: string): void {
    cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });
}

export function clearSessionCookie(cookies: AstroCookies): void {
    cookies.delete(COOKIE_NAME, { path: "/" });
}

export async function getSessionUser(cookies: AstroCookies): Promise<JWTPayload | null> {
    const token = cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJWT(token, import.meta.env.JWT_SECRET);
}
