export type ExtractedItem = {
    id: string;
    commission?: string;
    name?: string;
    quantity?: string;
    quantity_unit?: string;
    text?: string;
};

export function extractValuesFromAnalyzeResult(analyzeResult: any): ExtractedItem[] {
    const valueArray = analyzeResult?.documents?.[0]?.fields?.data?.valueArray ?? [];
    return valueArray.map((item: any) => {
        const vo = item.valueObject || {};
        return {
            id: item.id,
            commission: vo.commission?.valueString,
            name: vo.name?.valueString,
            quantity: vo.quantity?.valueString,
            quantity_unit: vo.quantityUnit?.valueString,
            text: vo.text?.valueString,
        };
    });
} 