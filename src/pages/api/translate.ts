import type { APIRoute } from "astro";
import OpenAI from "openai";

const LANGUAGE_MAP: Record<string, string> = {
    en: "English",
    fr: "French",
    pt: "Portuguese (Brazilian)",
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const apiKey = import.meta.env.OPENAI_API_KEY;

        if (!apiKey) {
            return new Response(
                JSON.stringify({ message: "OpenAI API key not configured" }),
                { status: 500 }
            );
        }

        const body = (await request.json()) as {
            title: string;
            location?: string;
            description: string[];
            skills: string[];
            targetLanguage: string;
        };

        const { title, location, description, skills, targetLanguage } = body;

        if (!title || !targetLanguage) {
            return new Response(
                JSON.stringify({
                    message: "Missing required fields (title, targetLanguage)",
                }),
                { status: 400 }
            );
        }

        const targetLangName = LANGUAGE_MAP[targetLanguage] || targetLanguage;

        const client = new OpenAI({ apiKey });

        // Translate in a single prompt for consistency
        const descriptionText =
            description.length > 0
                ? description.join("\n")
                : "(No description provided)";
        const skillsText =
            skills.length > 0 ? skills.join(", ") : "(No skills provided)";
        const locationText = location || "(No location provided)";

        const prompt = `Translate the following job experience information from English to ${targetLangName}. Keep the structure intact and return a JSON object with the translated fields.

IMPORTANT: Return ONLY the JSON object, no other text.

Input:
- Title: ${title}
- Location: ${locationText}
- Description (one per line):
${descriptionText}
- Skills (comma-separated):
${skillsText}

Return this JSON format:
{
  "title": "translated title",
  "location": "translated location",
  "description": ["translated accomplishment 1", "translated accomplishment 2"],
  "skills": ["translated skill 1", "translated skill 2"]
}

If any field is empty in the input, set the corresponding field to null or empty array.`;

        const message = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const responseText =
            message.choices[0].message.content || "";

        // Parse the JSON response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Failed to extract JSON from response:", responseText);
            return new Response(
                JSON.stringify({
                    message: "Failed to parse translation response",
                }),
                { status: 500 }
            );
        }

        const translated = JSON.parse(jsonMatch[0]);

        return new Response(JSON.stringify(translated), { status: 200 });
    } catch (error) {
        console.error("Translation error:", error);
        return new Response(
            JSON.stringify({
                message:
                    error instanceof Error
                        ? error.message
                        : "Translation failed",
            }),
            { status: 500 }
        );
    }
};
