'use client'

import { PDFViewer } from "@/components/PDFViewer";
import { useAtom } from 'jotai';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import { pdfDataAtom } from '@/store/pdf-atoms';
import { Button } from "@/components/ui/button";

export default function PDFViewerPage() {
    const router = useRouter();
    const [pdfData, setPdfData] = useAtom(pdfDataAtom);

    useEffect(() => {
        // If no PDF data is available, redirect to home
        if (!pdfData) {
            router.push('/');
        }
    }, [pdfData, router]);

    const handleBack = () => {
        setPdfData(null); // Clear the data
        router.push('/');
    };

    if (!pdfData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Document Viewer</h1>
                <Button variant="outline" onClick={handleBack}>
                    Back to Upload
                </Button>
            </div>
            <div className="w-full">
                <PDFViewer pdfUrl={pdfData.pdfUrl} />
            </div>
            {pdfData.analysisData && (
                <div className="mt-8 p-6 bg-card rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
                    <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(pdfData.analysisData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
} 