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

    // openRow state for controlling which item is expanded and which bounding boxes are visible
    const [openRow, setOpenRow] = useState<number | null>(null);

    // Extract bounding boxes from analysisData
    type Box = import('@/components/PDFViewer').BoundingBox & { label: string; itemIndex: number };
    const boundingBoxes = useMemo(() => {
        if (!pdfData?.analysisData?.documents) return [];
        const docs = pdfData.analysisData.documents;
        const boxes: Box[] = [];
        let boxCount = 1;
        const fieldsToExtract = ['commission', 'name', 'quantity', 'quantityUnit', 'text'];
        const fieldColorMap: Record<string, { fill: string; stroke: string }> = {
            commission: { fill: 'rgba(16, 185, 129, 0.2)', stroke: '#10B981' }, // green-500
            name: { fill: 'rgba(59, 130, 246, 0.2)', stroke: '#3B82F6' }, // blue-500
            quantity: { fill: 'rgba(245, 158, 11, 0.2)', stroke: '#F59E0B' }, // yellow-500
            quantityUnit: { fill: 'rgba(239, 68, 68, 0.2)', stroke: '#EF4444' }, // red-500
            text: { fill: 'rgba(168, 85, 247, 0.2)', stroke: '#A855F7' }, // purple-500
        };
        for (const doc of docs) {
            const valueArray = doc.fields?.data?.valueArray || [];
            valueArray.forEach((item: any, itemIndex: number) => {
                fieldsToExtract.forEach(field => {
                    const fieldObj = item.valueObject?.[field];
                    if (fieldObj?.boundingRegions?.length) {
                        (fieldObj.boundingRegions as any[]).forEach((region: any) => {
                            if (region.polygon && Array.isArray(region.polygon)) {
                                const color = fieldColorMap[field]?.fill || 'rgba(59,130,246,0.2)';
                                const strokeColor = fieldColorMap[field]?.stroke || '#3B82F6';
                                boxes.push({
                                    id: `box-${boxCount++}`,
                                    coordinates: region.polygon,
                                    color,
                                    strokeColor,
                                    label: field,
                                    itemIndex,
                                });
                            }
                        });
                    }
                });
            });
        }
        return boxes;
    }, [pdfData]);

    // Only show boxes for the open row
    const visibleBoxes = useMemo(() => {
        const map: Record<string, boolean> = {};
        if (openRow === null) return map;
        boundingBoxes.forEach(box => {
            map[box.id] = box.itemIndex === openRow;
        });
        return map;
    }, [boundingBoxes, openRow]);

    useEffect(() => {
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
                <h2 className="text-xl font-semibold">Analyzed Results</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 lg:px-8">
                <div className="p-6 bg-card rounded-lg border">
                    <PdfDataList analysisData={pdfData.analysisData} openRow={openRow} setOpenRow={setOpenRow} />
                </div>
                <div className="w-full">
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