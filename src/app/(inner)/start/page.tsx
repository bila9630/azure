'use client'

import { ModeToggle } from "@/components/dark-mode-toggle";
import FileDropzone from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSetAtom } from 'jotai';
import { pdfDataAtom } from '@/store/pdf-atoms';
// const data = {
//   documents: [{
//     boundingRegions: [{
//       pageNumber: 1,
//       polygon: [0, 0, 8.2639, 0, 8.2639, 11.6806, 0, 11.6806]
//     }],
//     confidence: 0.999,
//     docType: "second",
//     fields: {
//       data: {
//         confidence: 0.441,
//         type: "array",
//         valueArray: [{
//           confidence: 0.624,
//           type: "object",
//           valueObject: {
//             commission: {
//               type: 'string',
//               valueString: '1.1.20',
//               content: '1.1.20',
//               boundingRegions: [{
//                 pageNumber: 1,
//                 polygon: [0, 0, 8.2639, 0, 8.2639, 11.6806, 0, 11.6806]
//               }],
//               confidence: 0.993
//             },
//             name: {
//               type: 'string',
//               valueString: 'wie Pos. 10, jedoch b = 0,885 m',
//               content: 'wie Pos. 10, jedoch b = 0,885 m',
//               boundingRegions: [{
//                 pageNumber: 1,
//                 polygon: [0, 0, 8.2639, 0, 8.2639, 11.6806, 0, 11.6806]
//               }],
//               confidence: 0.949
//             },
//             quantity: {
//               type: 'string',
//               valueString: '3,000',
//               content: '3,000',
//               boundingRegions: [{
//                 pageNumber: 1,
//                 polygon: [0, 0, 8.2639, 0, 8.2639, 11.6806, 0, 11.6806]
//               }],
//               confidence: 0.991
//             },
//             quantityUnit: {
//               type: 'string',
//               valueString: 'Stk',
//               content: 'Stk',
//               boundingRegions: [{
//                 pageNumber: 1,
//                 polygon: [0, 0, 8.2639, 0, 8.2639, 11.6806, 0, 11.6806]
//               }],
//               confidence: 0.993
//             },
//             text: {
//               type: 'string',
//               valueString: 'Einbauort: WC Herren',
//               content: 'Einbauort: WC Herren',
//               boundingRegions: [{
//                 pageNumber: 1,
//                 polygon: [0, 0, 8.2639, 0, 8.2639, 11.6806, 0, 11.6806]
//               }],
//               confidence: 0.893
//             }
//           }
//         }]
//       }
//     },
//   }]
// };

export default function Home() {
  const router = useRouter();
  const setPdfData = useSetAtom(pdfDataAtom);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const removeFile = (file: File) => setFiles([]);

  const handleClick = async () => {
    if (files.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    try{
      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      ;
      console.log("data", data);

      // Create a URL for the PDF file from the uploaded file
      const pdfBlob = new Blob([files[0]], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      console.log(pdfUrl);

      const viewerData = {
        pdfUrl,
        analysisData: data
      };

      setPdfData(viewerData);
      // Save the data to sessionStorage
      sessionStorage.setItem('pdfViewerData', JSON.stringify(viewerData));

      // Navigate to viewer page
      router.push('/viewer');
    } catch (error) {
      console.error("Error processiong file:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center flex flex-col items-center gap-8">
            <p className="text-2xl font-semibold mb-2">Welcome to file analyzer!</p>
            
            {files.length > 0 ? (
                <div className="rounded-lg border bg-card p-4 w-full max-w-md">
                    <div className="flex items-center justify-between rounded bg-muted p-2">
                        <div className="mr-2 flex min-w-0 flex-1 items-center">
                            <FileText className="mr-2 h-5 w-5 text-primary" />
                            <p className="truncate text-sm">{files[0].name}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0"
                            onClick={() => setFiles([])}
                        >
                            <X className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            ) : (
                <FileDropzone
                    files={files}
                    setFiles={setFiles}
                    className="rounded-lg border-2 border-dashed border-muted h-48 p-10 bg-card hover:bg-accent/50 transition-colors duration-150 flex items-center justify-center mb-6 w-full max-w-md"
                >
                    <div className="text-center w-full">
                        <p className="text-base text-muted-foreground mb-1">
                            Drop your document here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Supported formats: PDF, DOC, DOCX
                        </p>
                    </div>
                </FileDropzone>
            )}

            <Button 
                className="mt-2 px-8 py-2 text-base" 
                onClick={handleClick} 
                disabled={loading}
            >
                {loading ? "Loading..." : "Call api endpoint"}
            </Button>
        </div>
    </div>
);
}