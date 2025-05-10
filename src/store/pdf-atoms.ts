import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

interface PDFData {
    pdfUrl: string;
    analysisData: any;
    width?: number;
    height?: number;
}

// Use atomWithStorage to persist the state
export const pdfDataAtom = atomWithStorage<PDFData | null>('pdfData', null); 