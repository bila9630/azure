'use client';

import { useState } from 'react';
import PDFViewer, { BoundingBox } from '@/components/PDFViewer';
import { v4 as uuidv4 } from 'uuid';

export default function TestPDF() {
    const boundingBoxes: BoundingBox[] = [
        {
            id: uuidv4(),
            coordinates: [
                0.5, 0.5,  // x1, y1
                4.5, 0.5,  // x2, y2
                4.5, 3.5,  // x3, y3
                0.5, 3.5   // x4, y4
            ],
            color: "rgba(255,0,0,0.2)",
            strokeColor: "red"
        },
        {
            id: uuidv4(),
            coordinates: [
                4.5, 7.5,  // x1, y1
                7.5, 7.5,  // x2, y2
                7.5, 10.5, // x3, y3
                4.5, 10.5  // x4, y4
            ],
            color: "rgba(0,0,255,0.2)",
            strokeColor: "blue"
        }
    ];

    const [visibleBoxes, setVisibleBoxes] = useState<Record<string, boolean>>(
        boundingBoxes.reduce((acc, box) => ({ ...acc, [box.id]: true }), {})
    );

    const toggleBox = (boxId: string) => {
        setVisibleBoxes(prev => ({
            ...prev,
            [boxId]: !prev[boxId]
        }));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="max-w-4xl w-full">
                <h1 className="text-2xl font-bold mb-8 text-center">PDF Test Page</h1>

                {/* Box toggle controls */}
                <div className="flex gap-2 mb-4 justify-center">
                    {boundingBoxes.map((box) => (
                        <button
                            key={box.id}
                            onClick={() => toggleBox(box.id)}
                            className={`px-4 py-2 rounded-md ${visibleBoxes[box.id]
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-gray-300 hover:bg-gray-400'
                                } text-white`}
                        >
                            Box {box.id}
                        </button>
                    ))}
                </div>

                <PDFViewer
                    pdfUrl="https://raw.githubusercontent.com/Azure/azure-sdk-for-js/6704eff082aaaf2d97c1371a28461f512f8d748a/sdk/formrecognizer/ai-form-recognizer/assets/forms/Invoice_1.pdf"
                    boundingBoxes={boundingBoxes}
                    visibleBoxes={visibleBoxes}
                    pageWidthInches={8.2639}
                    pageHeightInches={11.6806}
                />
            </div>
        </div>
    );
} 