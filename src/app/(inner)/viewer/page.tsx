'use client'

import { PDFViewer } from "@/components/PDFViewer";
import { useAtom } from 'jotai';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import { pdfDataAtom } from '@/store/pdf-atoms';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { PdfDataList } from "@/components/PdfDataList";

export default function PDFViewerPage() {
    const router = useRouter();
    const [pdfData, setPdfData] = useAtom(pdfDataAtom);

    useEffect(() => {
        // If no PDF data is available, redirect to home
        if (!pdfData) {
            router.push('/start');
        }

        console.log(pdfData?.analysisData);
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
                <div className="p-6 bg-card rounded-lg border">
                    <PdfDataList analysisData={pdfData.analysisData} />
                </div>
                <div className="w-full">
                    <PDFViewer pdfUrl={pdfData.pdfUrl} />
                </div>
            </div>
        </div>
    );
} 