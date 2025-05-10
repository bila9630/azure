import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronsUpDown } from "lucide-react";
import React from "react";

// Helper to extract the list data safely
function extractListData(analysisData: any) {
    const valueArray = analysisData?.documents?.[0]?.fields?.data?.valueArray;
    if (!Array.isArray(valueArray)) return [];
    return valueArray;
}

function getConfidenceClass(confidence: number) {
    if (confidence >= 0.9) return "bg-green-600 text-white";
    if (confidence < 0.3) return "bg-red-600 text-white";
    return "bg-yellow-400 text-black";
}

export function PdfDataList({ analysisData }: { analysisData: any }) {
    const [rows, setRows] = React.useState(() => extractListData(analysisData));
    const [openRow, setOpenRow] = React.useState<number | null>(null);
    const [editValues, setEditValues] = React.useState<any>({});

    React.useEffect(() => {
        setRows(extractListData(analysisData));
    }, [analysisData]);

    const handleInputChange = (idx: number, field: string, value: string) => {
        setEditValues((prev: any) => ({
            ...prev,
            [idx]: {
                ...prev[idx],
                [field]: value,
            },
        }));
    };

    const handleOpenRow = (idx: number) => {
        setEditValues((prev: any) => ({
            ...prev,
            [idx]: {
                name: rows[idx]?.valueObject?.name?.valueString || "",
                text: rows[idx]?.valueObject?.text?.valueString || "",
                quantity: rows[idx]?.valueObject?.quantity?.valueString || "",
                quantityUnit: rows[idx]?.valueObject?.quantityUnit?.valueString || "",
                commission: rows[idx]?.valueObject?.commission?.valueString || "",
            },
        }));
        setOpenRow(idx);
    };

    const handleAccept = (idx: number) => {
        setRows((prev: any[]) =>
            prev.map((row, i) =>
                i === idx
                    ? {
                        ...row,
                        valueObject: {
                            ...row.valueObject,
                            name: { ...row.valueObject.name, valueString: editValues[idx].name },
                            text: { ...row.valueObject.text, valueString: editValues[idx].text },
                            quantity: { ...row.valueObject.quantity, valueString: editValues[idx].quantity },
                            quantityUnit: { ...row.valueObject.quantityUnit, valueString: editValues[idx].quantityUnit },
                            commission: { ...row.valueObject.commission, valueString: editValues[idx].commission },
                        },
                    }
                    : row
            )
        );
        setOpenRow(null);
    };

    const handleDecline = (idx: number) => {
        setEditValues((prev: any) => ({
            ...prev,
            [idx]: undefined,
        }));
        setOpenRow(null);
    };

    if (rows.length === 0) {
        return <div className="text-center text-muted-foreground">No data found</div>;
    }
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 pl-1">Extracted Informations</h3>
            {rows.map((row: any, idx: number) => {
                const confidence = typeof row.confidence === 'number' ? row.confidence : null;
                const percent = confidence !== null ? Math.round(confidence * 100) : null;
                const badgeClass = confidence !== null ? getConfidenceClass(confidence) : "";
                const isOpen = openRow === idx;
                const values = editValues[idx] || {
                    name: row.valueObject?.name?.valueString || "",
                    text: row.valueObject?.text?.valueString || "",
                    quantity: row.valueObject?.quantity?.valueString || "",
                    quantityUnit: row.valueObject?.quantityUnit?.valueString || "",
                    commission: row.valueObject?.commission?.valueString || "",
                };
                return (
                    <Collapsible key={idx} open={isOpen} onOpenChange={open => open ? handleOpenRow(idx) : setOpenRow(null)}>
                        <Card className="p-4 bg-card border rounded-lg shadow flex flex-col gap-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="font-medium text-lg truncate">
                                    {row.valueObject?.name?.valueString || "-"}
                                </div>
                                <div className="flex items-center gap-2">
                                    {percent !== null ? (
                                        <Badge className={badgeClass}>{percent}%</Badge>
                                    ) : "-"}
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <ChevronsUpDown className="h-4 w-4" />
                                            <span className="sr-only">Toggle details</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                            </div>
                            <CollapsibleContent className="mt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Name</label>
                                        <Input
                                            value={values.name}
                                            onChange={e => handleInputChange(idx, 'name', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Text</label>
                                        <Input
                                            value={values.text}
                                            onChange={e => handleInputChange(idx, 'text', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Quantity</label>
                                        <Input
                                            value={values.quantity}
                                            onChange={e => handleInputChange(idx, 'quantity', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Quantity Unit</label>
                                        <Input
                                            value={values.quantityUnit}
                                            onChange={e => handleInputChange(idx, 'quantityUnit', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold mb-1">Commission</label>
                                        <Input
                                            value={values.commission}
                                            onChange={e => handleInputChange(idx, 'commission', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end mt-4">
                                    <Button size="sm" variant="destructive" onClick={() => handleDecline(idx)}>
                                        Delete
                                    </Button>
                                    <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleAccept(idx)}>
                                        Save
                                    </Button>
                                </div>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                );
            })}
        </div>
    );
} 