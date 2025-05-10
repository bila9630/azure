'use client'

import PDFViewer from "@/components/PDFViewer";
import { useAtom } from 'jotai';
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from 'react';
import { pdfDataAtom } from '@/store/pdf-atoms';
import { PdfDataList } from "@/components/PdfDataList";

export default function PDFViewerPage() {
    const router = useRouter();
    const [pdfData, setPdfData] = useAtom(pdfDataAtom);

    // Extract bounding boxes from analysisData
    const boundingBoxes = useMemo(() => {
        if (!pdfData?.analysisData?.documents) return [];
        const docs = pdfData.analysisData.documents;
        const boxes = [];
        let boxCount = 1;
        const fieldsToExtract = ['commission', 'name', 'quantity', 'quantityUnit', 'text'];
        for (const doc of docs) {
            const valueArray = doc.fields?.data?.valueArray || [];
            for (const item of valueArray) {
                for (const field of fieldsToExtract) {
                    const fieldObj = item.valueObject?.[field];
                    if (fieldObj?.boundingRegions?.length) {
                        for (const region of fieldObj.boundingRegions) {
                            if (region.polygon && Array.isArray(region.polygon)) {
                                boxes.push({
                                    id: `box-${boxCount++}`,
                                    coordinates: region.polygon,
                                    color: 'rgba(255,0,0,0.2)', // Optionally, use different colors per field
                                    strokeColor: 'red',
                                    label: field,
                                });
                            }
                        }
                    }
                }
            }
        }
        return boxes;
    }, [pdfData]);

    // Visibility state for each box
    const [visibleBoxes, setVisibleBoxes] = useState<Record<string, boolean>>({});
    useEffect(() => {
        // Initialize all boxes as visible when boundingBoxes change
        setVisibleBoxes(boundingBoxes.reduce((acc, box) => ({ ...acc, [box.id]: true }), {}));
    }, [boundingBoxes]);

    const toggleBox = (boxId: string) => {
        setVisibleBoxes(prev => ({ ...prev, [boxId]: !prev[boxId] }));
    };

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
                {/* <div className="p-6 bg-card rounded-lg border">
                    <PdfDataList analysisData={pdfData.analysisData} />
                </div> */}
                <div className="w-full">
                    {/* Box toggle controls */}
                    <div className="flex gap-2 mb-4 justify-center">
                        {boundingBoxes.map((box, idx) => (
                            <button
                                key={box.id}
                                onClick={() => toggleBox(box.id)}
                                className={`px-4 py-2 rounded-md ${visibleBoxes[box.id]
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                    } text-white`}
                            >
                                Box {idx + 1}
                            </button>
                        ))}
                    </div>
                    <PDFViewer
                        pdfUrl={pdfData.pdfUrl}
                        boundingBoxes={boundingBoxes}
                        visibleBoxes={visibleBoxes}
                        pageWidthInches={pdfData.width}
                        pageHeightInches={pdfData.height}
                    />
                </div>
            </div>
        </div>
    );
} 