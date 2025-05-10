// components/PDFViewer.tsx
'use client';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useState, useRef, useEffect } from 'react';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const CATEGORY_COLORS = {
  name: 'border-red-500',
  text: 'border-blue-500', 
  quantity: 'border-green-500',
  quantityUnit: 'border-yellow-500',
  commission: 'border-purple-500'
};

interface PDFViewerProps {
  pdfUrl: string;
  analysisData?: any;
}

export function PDFViewer({ pdfUrl, analysisData }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 800, height: 0 });
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;
    
    const updateSize = () => {
      if (pageRef.current) {
        setPageSize({
          width: pageRef.current.clientWidth,
          height: pageRef.current.clientHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const renderBoundingBoxes = () => {
    if (!analysisData?.documents?.[0]?.fields?.data?.valueArray) return null;

    return analysisData.documents[0].fields.data.valueArray.flatMap((item: any) => 
      Object.entries(item.valueObject).map(([category, props]: [string, any]) => {
        if (!props.boundingRegions) return null;
        return props.boundingRegions.map((region: any, i: number) => {
          const polygon = region.polygon;
          if (!polygon || polygon.length < 6) return null;
          
          return (
            <div
              key={`${category}-${i}`}
              className={`absolute border-2 ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'border-gray-500'}`}
              style={{
                left: `${polygon[0]}in`,
                top: `${polygon[1]}in`,
                width: `${polygon[2] - polygon[0]}in`,
                height: `${polygon[5] - polygon[1]}in`,
              }}
            />
          );
        });
      })
    );
  };

  return (
    <div className="relative w-full">
      <div ref={pageRef} className="shadow-lg">
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div>Loading PDF...</div>}
          className="flex justify-center"
        >
          <Page 
            pageNumber={pageNumber}
            width={pageSize.width}
            renderTextLayer={false}
            className="border"
          />
        </Document>
        <div className="absolute inset-0 pointer-events-none">
          {renderBoundingBoxes()}
        </div>
      </div>
      
      {numPages && (
        <div className="flex justify-center gap-4 mt-4">
          <button 
            onClick={() => setPageNumber(p => Math.max(1, p - 1))} 
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="flex items-center">
            Page {pageNumber} of {numPages}
          </span>
          <button 
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} 
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}