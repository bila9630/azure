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
import { parse } from 'js2xmlparser';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";

// Helper to extract the list data safely
function extractListData(analysisData: any) {
    const valueArray = analysisData?.documents?.[0]?.fields?.data?.valueArray;
    if (!Array.isArray(valueArray)) return [];
    // Add status: 'accepted' to each row
    return valueArray.map((row: any) => ({ ...row, status: 'accepted' }));
}

function getConfidenceClass(confidence: number) {
    if (confidence >= 0.9) return "bg-green-600 text-white";
    if (confidence < 0.3) return "bg-red-600 text-white";
    return "bg-yellow-400 text-black";
}

function getConfidenceTextClass(confidence: number) {
    if (confidence >= 0.9) return "text-green-700";
    if (confidence < 0.3) return "text-red-700";
    return "text-yellow-700";
}

interface PdfDataListProps {
    analysisData: any;
    openRow: number | null;
    setOpenRow: React.Dispatch<React.SetStateAction<number | null>>;
}

export function PdfDataList({ analysisData, openRow, setOpenRow }: PdfDataListProps) {
    const [rows, setRows] = React.useState(() => extractListData(analysisData));
    const [editValues, setEditValues] = React.useState<any>({});
    const [filter, setFilter] = React.useState<'accepted' | 'deleted'>('accepted');

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
                sku: rows[idx]?.sku || "",
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
                        sku: editValues[idx].sku,
                        status: 'accepted',
                    }
                    : row
            )
        );
        setOpenRow(null);
    };


    const handleXMLExport = () => {
        console.log('Export XML...');
        const inputList = extractListData(analysisData);

        const items = inputList.map((item, idx) => {
            const obj = item.valueObject;
            return {
                sku: rows[idx]?.sku || "",
                name: obj.name?.valueString || "",
                text: obj.text?.valueString || "",
                quantity: obj.quantity?.valueString || "",
                quantityUnit: obj.quantityUnit?.valueString || "",
                price: obj.price?.valueString || "",
                priceUnit: obj.priceUnit?.valueString || "€",
                purchasePrice: obj.purchasePrice?.valueString || "",
                commission: obj.commission?.valueString || ""
            };
        });

        const orderData = {
            customerId: "",
            commission: "",
            type: "",
            shippingConditionId: "",
            items: items
        };

        const xmlString = parse('order', orderData);
        const blob = new Blob([xmlString], { type: 'application/xml' });

        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const handleDelete = (idx: number) => {
        setRows((prev: any[]) =>
            prev.map((row, i) =>
                i === idx
                    ? { ...row, status: 'deleted' }
                    : row
            )
        );
        setOpenRow(null);
    };

    if (rows.length === 0) {
        return <div className="text-center text-muted-foreground">No data found</div>;
    }
    const filteredRows = rows.filter(row => row.status === filter);
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 pl-1">Extracted Informations</h3>
            <div className="flex justify-between items-center mb-2 pl-1">
                <div className="flex gap-2">
                    <Button size="sm" variant={filter === 'accepted' ? 'default' : 'outline'} onClick={() => setFilter('accepted')}>Accepted</Button>
                    <Button size="sm" variant={filter === 'deleted' ? 'default' : 'outline'} onClick={() => setFilter('deleted')}>Deleted</Button>
                </div>
                <Button size="sm" className="ml-auto" onClick={() => handleXMLExport()}>XML Export</Button>
            </div>
            {filteredRows.length === 0 ? (
                <div className="text-center text-muted-foreground">No data found</div>
            ) : (
                filteredRows.map((row: any, idx: number) => {
                    // Find the real index in the rows array
                    const realIdx = rows.findIndex(r => r === row);
                    const confidence = typeof row.confidence === 'number' ? row.confidence : null;
                    const percent = confidence !== null ? Math.round(confidence * 100) : null;
                    const badgeClass = confidence !== null ? getConfidenceClass(confidence) : "";
                    const isOpen = openRow === realIdx;
                    const values = editValues[realIdx] || {
                        name: row.valueObject?.name?.valueString || "",
                        text: row.valueObject?.text?.valueString || "",
                        quantity: row.valueObject?.quantity?.valueString || "",
                        quantityUnit: row.valueObject?.quantityUnit?.valueString || "",
                        commission: row.valueObject?.commission?.valueString || "",
                        sku: row.sku || "",
                    };
                    return (
                        <Collapsible key={realIdx} open={isOpen} onOpenChange={open => open ? handleOpenRow(realIdx) : setOpenRow(null)}>
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
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <label className="block text-xs mb-1 text-muted-foreground">
                                                    Name{row.valueObject?.name?.confidence !== undefined && (
                                                        <span className={"ml-1 " + getConfidenceTextClass(row.valueObject.name.confidence)}>
                                                            ({Math.round((row.valueObject.name.confidence || 0) * 100)}%)
                                                        </span>
                                                    )}
                                                </label>
                                                <Input
                                                    value={values.name}
                                                    onChange={e => handleInputChange(realIdx, 'name', e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <label className="block text-xs mb-1 text-muted-foreground">
                                                    Text{row.valueObject?.text?.confidence !== undefined && (
                                                        <span className={"ml-1 " + getConfidenceTextClass(row.valueObject.text.confidence)}>
                                                            ({Math.round((row.valueObject.text.confidence || 0) * 100)}%)
                                                        </span>
                                                    )}
                                                </label>
                                                <Input
                                                    value={values.text}
                                                    onChange={e => handleInputChange(realIdx, 'text', e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <label className="block text-xs mb-1 text-muted-foreground">
                                                    Quantity{row.valueObject?.quantity?.confidence !== undefined && (
                                                        <span className={"ml-1 " + getConfidenceTextClass(row.valueObject.quantity.confidence)}>
                                                            ({Math.round((row.valueObject.quantity.confidence || 0) * 100)}%)
                                                        </span>
                                                    )}
                                                </label>
                                                <Input
                                                    value={values.quantity}
                                                    onChange={e => handleInputChange(realIdx, 'quantity', e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <label className="block text-xs mb-1 text-muted-foreground">
                                                    Quantity Unit{row.valueObject?.quantityUnit?.confidence !== undefined && (
                                                        <span className={"ml-1 " + getConfidenceTextClass(row.valueObject.quantityUnit.confidence)}>
                                                            ({Math.round((row.valueObject.quantityUnit.confidence || 0) * 100)}%)
                                                        </span>
                                                    )}
                                                </label>
                                                <Input
                                                    value={values.quantityUnit}
                                                    onChange={e => handleInputChange(realIdx, 'quantityUnit', e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:col-span-2">
                                            <div className="flex-1">
                                                <label className="block text-xs mb-1 text-muted-foreground">
                                                    Commission{row.valueObject?.commission?.confidence !== undefined && (
                                                        <span className={"ml-1 " + getConfidenceTextClass(row.valueObject.commission.confidence)}>
                                                            ({Math.round((row.valueObject.commission.confidence || 0) * 100)}%)
                                                        </span>
                                                    )}
                                                </label>
                                                <Input
                                                    value={values.commission}
                                                    onChange={e => handleInputChange(realIdx, 'commission', e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:col-span-2">
                                            <div className="flex-1 flex flex-col gap-1">
                                                <label className="block text-xs mb-1 text-muted-foreground">
                                                    SKU
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={values.sku}
                                                        onChange={e => handleInputChange(realIdx, 'sku', e.target.value)}
                                                        className="w-full"
                                                    />
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 ml-2" tabIndex={0} aria-label="Show SKU explanation">
                                                                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="max-w-xs text-sm">
                                                            {row.skuExplanation || 'No explanation available.'}
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end mt-4">
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(realIdx)}>
                                            Delete
                                        </Button>
                                        <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleAccept(realIdx)}>
                                            Save
                                        </Button>
                                    </div>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    );
                })
            )}
        </div>
    );
} 