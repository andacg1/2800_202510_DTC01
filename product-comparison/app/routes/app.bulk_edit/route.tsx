import { authenticate } from "../../shopify.server";
import BulkEditManager from "./BulkEditManager";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    // Only return empty data on GET
    return { products: [], allMetafieldKeys: [] };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const productIdsRaw = formData.get("productIds");
    let productIds: string[] = [];
    try {
        productIds = JSON.parse(productIdsRaw as string);
    } catch {
        return { products: [], allMetafieldKeys: [] };
    }
    if (!Array.isArray(productIds) || productIds.length === 0) {
        return { products: [], allMetafieldKeys: [] };
    }

    // Fetch products and their metafields from Shopify
    const query = `{
        nodes(ids: [${productIds.map((id) => `\"${id}\"`).join(",")}]) {
            ... on Product {
                id
                title
                metafields(namespace: \"product_specs\", first: 10) {
                    edges {
                        node {
                            key
                            value
                        }
                    }
                }
            }
        }
    }`;
    const response = await admin.graphql(query);
    const body = typeof response.body === "string" ? JSON.parse(response.body) : response.body;
    const nodes = body?.data?.nodes ?? [];
    const products = nodes.map((node: any) => {
        if (!node) return null;
        const metafields = (node.metafields?.edges ?? []).reduce((acc: any, { node: mf }: any) => {
            acc[mf.key] = mf.value;
            return acc;
        }, {});
        return {
            id: node.id,
            title: node.title,
            ...metafields,
        };
    }).filter(Boolean);
    const allMetafieldKeys = Array.from(
        new Set(
            products.flatMap((p: any) => Object.keys(p)).filter((k: string) => k !== "id" && k !== "title")
        )
    );
    return { products, allMetafieldKeys };
};

export default function App() {
    const actionData = useActionData<typeof action>();
    const { products, allMetafieldKeys } = useLoaderData<typeof loader>();
    return <BulkEditManager actionData={actionData} products={products} metafieldKeys={allMetafieldKeys} />;
} 