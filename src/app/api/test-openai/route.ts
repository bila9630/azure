import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

export async function GET() {
    try {
        const result = await generateObject({
            model: openai("gpt-4o-mini"),
            prompt: "Please come up with 10 definitions for AI agents.",
            schema: z.object({
                definitions: z.array(z.string().describe("Use as much jargon as possible. It should be completely incoherent.")),
            }),
        });

        return new Response(JSON.stringify({ result }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in test-openai route:", error);
        return new Response(JSON.stringify({ error: "Failed to generate AI definitions" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
} 