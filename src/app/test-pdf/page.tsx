'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for react-pdf
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default function TestPDF() {
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);
    const pageRef = useRef<HTMLDivElement>(null);
    const [pageSize, setPageSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 });

    // Example polygon data for a visible area (rectangle near top left)
    const polygonInches = [
        [1, 1],
        [3, 1],
        [3, 2],
        [1, 2],
    ];
    const pageWidthInches = 8.5;
    const pageHeightInches = 11;

    useEffect(() => {
        if (pageRef.current) {
            const rect = pageRef.current.getBoundingClientRect();
            setPageSize({ width: rect.width, height: rect.height });
        }
    }, [pageNumber]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="max-w-4xl w-full">
                <h1 className="text-2xl font-bold mb-8 text-center">PDF Test Page</h1>

                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div ref={pageRef}>
                            <Document
                                file="https://raw.githubusercontent.com/Azure/azure-sdk-for-js/6704eff082aaaf2d97c1371a28461f512f8d748a/sdk/formrecognizer/ai-form-recognizer/assets/forms/Invoice_1.pdf"
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
                                />
                            </Document>
                        </div>
                        {/* Polygon overlay for the word 'UNITED' */}
                        {pageSize.width > 0 && pageSize.height > 0 && (
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
                                <polygon
                                    points={polygonInches.map(([x, y]) => [
                                        (x / pageWidthInches) * pageSize.width,
                                        (y / pageHeightInches) * pageSize.height
                                    ].join(",")).join(" ")}
                                    fill="rgba(255,0,0,0.2)"
                                    stroke="red"
                                    strokeWidth={2}
                                />
                            </svg>
                        )}
                    </div>

                    {numPages && (
                        <div className="flex justify-center items-center gap-4 mt-4 w-full">
                            <button
                                onClick={() => setPageNumber(page => Math.max(1, page - 1))}
                                disabled={pageNumber <= 1}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <p className="text-lg text-center">
                                Page {pageNumber} of {numPages}
                            </p>
                            <button
                                onClick={() => setPageNumber(page => Math.min(numPages, page + 1))}
                                disabled={pageNumber >= numPages}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 