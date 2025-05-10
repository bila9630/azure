'use client'

import { PDFViewer } from "@/components/PDFViewer";
import { useAtom } from 'jotai';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import { pdfDataAtom } from '@/store/pdf-atoms';

export default function PDFViewerPage() {
    const router = useRouter();
    const [pdfData, setPdfData] = useAtom(pdfDataAtom);

    useEffect(() => {
        // If no PDF data is available, redirect to home
        if (!pdfData) {
            router.push('/start');
        }
    }, [pdfData, router]);

    if (!pdfData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8 px-4 lg:px-8">
                <h2 className="text-xl font-semibold">Analysis Results</h2>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    Next
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 lg:px-8">
                {pdfData.analysisData && (
                    <div className="p-6 bg-card rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm">
                            {JSON.stringify(pdfData.analysisData, null, 2)}
                        </pre>
                    </div>
                )}
                <div className="w-full">
                    <PDFViewer pdfUrl={pdfData.pdfUrl} />
                </div>
            </div>
        </div>
    );
} 