import { Page, Layout, Card, Text, Button } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { ReactApexGrid } from "./apex-grid-factory";
import { useFetcher } from "@remix-run/react";

interface BulkEditManagerProps {
    products: any[];
    metafieldKeys: string[];
    actionData?: any;
}

export default function BulkEditManager({ products, metafieldKeys, actionData }: BulkEditManagerProps) {
    const [rows, setRows] = useState<any[]>([]);
    const [editedRows, setEditedRows] = useState<{ [id: string]: any }>({});
    const [selectedMetafields, setSelectedMetafields] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const fetcher = useFetcher();

    // Open Shopify product picker
    const handleProductSelect = async () => {
        try {
            const products = await window.shopify.resourcePicker({
                type: "product",
                action: "select",
                multiple: true,
            });
            if (products && products.length > 0) {
                setSelectedProducts(products);
                fetcher.submit(
                    { productIds: JSON.stringify(products.map((p: any) => p.id)) },
                    { method: "post" }
                );
            }
        } catch (error) {
            console.error("Failed to select products:", error);
        }
    };

    // Update grid when fetcher returns data
    useEffect(() => {
        if (
            fetcher.data &&
            typeof fetcher.data === "object" &&
            fetcher.data !== null &&
            "products" in fetcher.data &&
            "allMetafieldKeys" in fetcher.data &&
            Array.isArray(fetcher.data.products) &&
            Array.isArray(fetcher.data.allMetafieldKeys)
        ) {
            setRows(fetcher.data.products);
            setSelectedMetafields(fetcher.data.allMetafieldKeys);
        }
    }, [fetcher.data]);

    // Columns: always show id/title, plus all metafields (let user toggle visibility)
    const columns = [
        { key: "id", name: "ID", width: 80, editable: false },
        { key: "title", name: "Title", width: 200, editable: false },
        ...selectedMetafields.map((key) => ({
            key,
            name: key,
            width: 120,
            editable: true,
        })),
    ];

    const handleCellEdit = (rowIdx: number, key: string, value: string) => {
        const updatedRows = [...rows];
        updatedRows[rowIdx] = { ...updatedRows[rowIdx], [key]: value };
        setRows(updatedRows);
        setEditedRows((prev) => ({ ...prev, [updatedRows[rowIdx].id]: updatedRows[rowIdx] }));
    };

    const handleSave = () => {
        alert("Save clicked! (scaffold)");
    };

    const handleCheckboxChange = (key: string) => {
        setSelectedMetafields((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    return (
        <Page title="Bulk Edit Products">
            <Layout>
                <Layout.Section>
                    <Card>
                        <Text as="h2" variant="headingMd">
                            Bulk Edit
                        </Text>
                        <div style={{ marginTop: 24, marginBottom: 24 }}>
                            <Button onClick={handleProductSelect}>
                                Select Products
                            </Button>
                        </div>
                        {rows.length > 0 && (
                            <>
                                <div style={{ marginTop: 24, marginBottom: 24 }}>
                                    <div>
                                        <Text variant="bodySm" as="span">
                                            Select metafields to edit:
                                        </Text>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                                            {Array.isArray(fetcher.data?.allMetafieldKeys) && fetcher.data.allMetafieldKeys.length > 0
                                                ? fetcher.data.allMetafieldKeys.map((key: string) => (
                                                    <label key={key} style={{ display: "flex", alignItems: "center" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMetafields.includes(key)}
                                                            onChange={() => handleCheckboxChange(key)}
                                                            style={{ marginRight: 4 }}
                                                        />
                                                        {key}
                                                    </label>
                                                ))
                                                : null}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 24 }}>
                                    <ReactApexGrid
                                        data={rows}
                                        columns={columns}
                                        onCellEdit={({ rowIdx, column, value }: any) => handleCellEdit(rowIdx, column.key, value)}
                                    />
                                </div>
                                <div style={{ marginTop: 24 }}>
                                    <Button onClick={handleSave}>
                                        Save
                                    </Button>
                                </div>
                            </>
                        )}
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
} 