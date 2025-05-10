
// app/(inner)/viewer/page.tsx
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
    // Check for data in sessionStorage on reload
    const savedData = sessionStorage.getItem('pdfViewerData');
    if (savedData && !pdfData) {
      setPdfData(JSON.parse(savedData));
    } else if (!pdfData) {
      router.push('/start');
    }
  }, [pdfData, router, setPdfData]);

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
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 lg:px-8">
        <div className="p-6 bg-card rounded-lg border">
          {/* Your data list component */}
          <PdfDataList analysisData={pdfData.analysisData} />
        </div>
        <div className="w-full">
          <PDFViewer 
            pdfUrl={pdfData.pdfUrl} 
            analysisData={pdfData.analysisData} 
          />
        </div>
      </div>
    </div>
  );
}
