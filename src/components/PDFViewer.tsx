'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for react-pdf
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export interface BoundingBox {
    id: string;
    coordinates: number[];  // Flat array format: [x1,y1,x2,y2,x3,y3,x4,y4]
    color?: string;
    strokeColor?: string;
}

interface PDFViewerProps {
    pdfUrl: string;
    boundingBoxes?: BoundingBox[];
    visibleBoxes: Record<string, boolean>;
    showControls?: boolean;
    className?: string;
    pageWidthInches?: number;
    pageHeightInches?: number;
    pageNumber?: number;
    setPageNumber?: (page: number) => void;
    onNumPages?: (numPages: number) => void;
}

export default function PDFViewer({
    pdfUrl,
    boundingBoxes = [],
    visibleBoxes,
    showControls = true,
    className = '',
    pageWidthInches = 8.2639,
    pageHeightInches = 11.6806,
    pageNumber: controlledPageNumber,
    setPageNumber: controlledSetPageNumber,
    onNumPages,
}: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>();
    const [internalPageNumber, setInternalPageNumber] = useState<number>(1);
    const pageNumber = controlledPageNumber ?? internalPageNumber;
    const setPageNumber = controlledSetPageNumber ?? setInternalPageNumber;
    const FIXED_PDF_WIDTH = 500; // px (smaller display)
    const aspectRatio = pageHeightInches / pageWidthInches;
    const renderedHeight = FIXED_PDF_WIDTH * aspectRatio;
    const pageSize = { width: FIXED_PDF_WIDTH, height: renderedHeight };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
        if (onNumPages) onNumPages(numPages);
    }

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className="relative" style={{ width: FIXED_PDF_WIDTH, height: renderedHeight }}>
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex flex-col items-center"
                    loading={<div className="text-lg">Loading PDF...</div>}
                    error={<div className="text-lg text-red-500">Error loading PDF!</div>}
                >
                    <Page
                        pageNumber={pageNumber}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-lg"
                        loading={<div className="text-lg">Loading page...</div>}
                        width={FIXED_PDF_WIDTH}
                    />
                </Document>
                {/* Polygon overlays */}
                {boundingBoxes.length > 0 && (
                    <svg
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: pageSize.width,
                            height: pageSize.height,
                            pointerEvents: 'none',
                        }}
                        width={pageSize.width}
                        height={pageSize.height}
                    >
                        {boundingBoxes.map((box) =>
                            visibleBoxes[box.id] && (
                                <polygon
                                    key={box.id}
                                    points={box.coordinates.map((coord, index) => {
                                        const isX = index % 2 === 0;
                                        const value = isX
                                            ? (coord / pageWidthInches) * pageSize.width
                                            : (coord / pageHeightInches) * pageSize.height;
                                        return value;
                                    }).join(",")}
                                    fill={box.color || "rgba(255,0,0,0.2)"}
                                    stroke={box.strokeColor || "red"}
                                    strokeWidth={2}
                                />
                            )
                        )}
                    </svg>
                )}
            </div>
        </div>
    );
} 