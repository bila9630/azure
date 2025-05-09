import { NextResponse } from 'next/server';
import client from '@/lib/client';
import {
    getLongRunningPoller,
    isUnexpected,
    parseResultIdFromResponse,
    streamToUint8Array,
} from "@azure-rest/ai-document-intelligence";

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
        .path("/documentModels/{modelId}:analyze", "prebuilt-layout")
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
    console.log(analyzeResult);

    return new Response(JSON.stringify({ result: analyzeResult }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
} 