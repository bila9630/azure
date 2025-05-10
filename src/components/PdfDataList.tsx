import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import React from "react";

// Helper to extract the list data safely
function extractListData(analysisData: any) {
    const valueArray = analysisData?.documents?.[0]?.fields?.data?.valueArray;
    if (!Array.isArray(valueArray)) return [];
    return valueArray.map((item: any) => item?.valueObject || {});
}

export function PdfDataList({ analysisData }: { analysisData: any }) {
    const rows = extractListData(analysisData);
    return (
        <div className="mb-8">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Text</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Quantity Unit</TableHead>
                        <TableHead>Commission</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">No data found</TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{row.name?.valueString || "-"}</TableCell>
                                <TableCell>{row.text?.valueString || "-"}</TableCell>
                                <TableCell>{row.quantity?.valueString || "-"}</TableCell>
                                <TableCell>{row.quantityUnit?.valueString || "-"}</TableCell>
                                <TableCell>{row.commission?.valueString || "-"}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
} 