import client from '@/lib/client';
import {
    getLongRunningPoller,
    isUnexpected,
} from "@azure-rest/ai-document-intelligence";
import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { extractValuesFromAnalyzeResult } from '@/lib/extractAnalyzeResult';

import type { AnalyzeOperationOutput } from "@azure-rest/ai-document-intelligence";



export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
        return new Response(JSON.stringify({ error: "No file uploaded" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Read file as ArrayBuffer and convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("PDF Buffer:", buffer);

    // Convert buffer to base64
    const base64Source = buffer.toString('base64');

    const initialResponse = await client
        .path("/documentModels/{modelId}:analyze", "second")
        .post({
            contentType: "application/json",
            body: {
                base64Source,
            },
            queryParameters: { locale: "en-IN" },
        });

    if (isUnexpected(initialResponse)) {
        throw initialResponse.body.error;
    }

    const poller = getLongRunningPoller(client, initialResponse);
    const analyzeResult = ((await poller.pollUntilDone()).body as AnalyzeOperationOutput).analyzeResult;

    // Add id field to each item in valueArray
    const valueArray = analyzeResult?.documents?.[0]?.fields?.data?.valueArray;
    if (Array.isArray(valueArray)) {
        valueArray.forEach((item: any, index: number) => {
            item.id = `item-${index + 1}`;
        });
    }

    // Extract and log the values
    const extractedValues = extractValuesFromAnalyzeResult(analyzeResult);
    console.log('Extracted Values:', extractedValues);

    // SKU SECTION
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
                content: JSON.stringify(extractedValues)
            }
        ],
        schema: z.object({
            results: z.array(z.object({
                id: z.string().describe("The id of the item. Must be a string."),
                sku: z.string().describe("The SKU of a product or service based on the categorization rules. Must be one of: 620001, 670001, 660001, 610001, 680001, 240001, 330001, 450001, 290001, 360001, DL8110016, DL5010008, DL5019990"),
                explaination: z.string().describe("Provide a detailed explanation of why you chose this SKU based on the input data and categorization rules"),
            }))
        }),
    });

    // Extract only the SKU and explanation from the result
    const skuResults = result.object.results.map(({ id, sku, explaination }) => ({ id, sku, explaination }));
    console.log('SKU Results:', skuResults);

    if (Array.isArray(valueArray)) {
        skuResults.forEach(({ id, sku, explaination }) => {
            const item = valueArray.find((item: any) => item.id === id);
            if (item) {
                (item as any).sku = sku;
                (item as any).skuExplanation = explaination;
            }
        });
    }

    // Return documents and page dimensions
    return new Response(JSON.stringify({
        documents: analyzeResult?.documents,
        width: analyzeResult?.pages?.[0]?.width,
        height: analyzeResult?.pages?.[0]?.height
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}