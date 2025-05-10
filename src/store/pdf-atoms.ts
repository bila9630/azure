// src/store/pdf-atoms.ts
'use client';
import { atom, useSetAtom } from 'jotai';
import { createJSONStorage, atomWithStorage } from 'jotai/utils';

// Create storage instance
const storage = createJSONStorage(() => localStorage);

// Define types
export type PDFData = {
    pdfUrl?: string;
    analysisData?: any;
};

// Create persistent atom with proper initialization
export const pdfDataAtom = atomWithStorage<PDFData>(
    'pdfData',
    {}, // initial value
    storage,
    { getOnInit: true } // Ensure we get stored value on initialization
);

// Helper function to update PDF data
export const setPDFData = (data: PDFData) => {
    const [, setPdfData] = useSetAtom(pdfDataAtom);
    setPdfData(data);
};