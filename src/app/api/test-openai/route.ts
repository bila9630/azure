import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

export async function GET() {
    try {
        const result = await generateObject({
            model: openai("gpt-4o-mini"),
            messages: [
                {
                    role: "system",
                    content: `You are a specialized assistant that categorizes products and services into appropriate SKUs based on detailed rules. You will receive data including name, text, quantity, quantity unit, and commission.

Follow these categorization rules:

ELEMENTS:
- For wooden doors and frames: Use SKU 620001
- For steel doors, steel frames, pipe frame doors: Use SKU 670001
- For entrance doors: Use SKU 660001
- For glass doors: Use SKU 610001
- For gates: Use SKU 680001

Important rules for Elements:
- Door leaf is decisive (Often wooden door leaf with steel frame - then use 620001)
- For glazing --> Frame is decisive (Often fixed glazing with steel frame - then use 670001)

ACCESSORIES:
- For hardware/fittings: Use SKU 240001
- For door stops: Use SKU 330001
- For ventilation grilles: Use SKU 450001
- For door closers: Use SKU 290001
- For locks/electric openers: Use SKU 360001

SERVICES:
- For maintenance: Use SKU DL8110016
- For hourly work: Use SKU DL5010008
- For other work (e.g., site setup, measurement, sample door leaf, etc.): Use SKU DL5019990

Analyze the input data carefully and select the most appropriate SKU based on these rules.`
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        name: "Bürotür mit Stahl-U-Zarge",
                        text: "Hörmann Stahlfutterzarge",
                        quantity: "1",
                        quantity_unit: "stk"
                    })
                }
            ],
            schema: z.object({
                sku: z.string().describe("The SKU of a product or service based on the categorization rules. Must be one of: 620001, 670001, 660001, 610001, 680001, 240001, 330001, 450001, 290001, 360001, DL8110016, DL5010008, DL5019990"),
                explaination: z.string().describe("Provide a detailed explanation of why you chose this SKU based on the input data and categorization rules"),
            }),
        });

        // Extract only the SKU and explanation from the result
        const { sku, explaination } = result.object;

        return new Response(JSON.stringify({ sku, explaination }), {
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