'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for react-pdf
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFViewerProps {
    pdfUrl: string;
}

export function PDFViewer({ pdfUrl }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);
    const pageRef = useRef<HTMLDivElement>(null);
    const [pageSize, setPageSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 });

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
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <div ref={pageRef}>
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
                        />
                    </Document>
                </div>
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
                        onClick={() => setPageNumber(page => Math.min(numPages!, page + 1))}
                        disabled={pageNumber >= (numPages || 1)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
} 