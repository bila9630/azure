'use client';

import { useState } from 'react';
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

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="max-w-4xl w-full">
                <h1 className="text-2xl font-bold mb-8 text-center">PDF Test Page</h1>

                <div className="flex flex-col items-center gap-4">
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

                    {numPages && (
                        <div className="flex items-center gap-4 mt-4">
                            <button
                                onClick={() => setPageNumber(page => Math.max(1, page - 1))}
                                disabled={pageNumber <= 1}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <p className="text-lg">
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