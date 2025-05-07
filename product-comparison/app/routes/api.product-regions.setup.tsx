import { json } from "@remix-run/node";
import type { ActionFunction, TypedResponse } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import fs from 'fs';
import path from 'path';


interface Country {
    name: string;
    "alpha-2": string;
    "alpha-3": string;
    "country-code": string;
    "iso_3166-2": string;
    region: string;
    "sub-region": string;
    "intermediate-region": string;
    "region-code": string;
    "sub-region-code": string;
    "intermediate-region-code": string;
}


interface GraphQLResponse<T = any> {
    json: () => Promise<{ data?: T; errors?: any[] }>;
}


interface ProductNode {
    id: string;
}
interface ProductEdge {
    node: ProductNode;
}
interface ProductsData {
    products: {
        edges: ProductEdge[];
        pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
        };
    };
}


interface MetafieldNode {
    id: string;
    key: string;
    namespace: string;
    ownerType?: string;
}
interface MetafieldsSetData {
    metafieldsSet: {
        metafields: MetafieldNode[];
        userErrors: any[];
    };
}


function getRandomSubset<T>(array: T[], minSize: number, maxSize: number): T[] {
    if (!array || array.length === 0) {
        return [];
    }
    const actualMinSize = Math.max(0, Math.min(minSize, array.length));
    const actualMaxSize = Math.min(maxSize, array.length);

    const size = Math.floor(Math.random() * (actualMaxSize - actualMinSize + 1)) + actualMinSize;

    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
}

export const action: ActionFunction = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    let productsUpdatedCount = 0;

    try {

        const regionsPath = path.join(process.cwd(), 'extensions', 'product-comparison-block', 'snippets', 'regions.liquid');
        if (!fs.existsSync(regionsPath)) {
            throw new Error('Regions data file not found');
        }
        const regionsContent = fs.readFileSync(regionsPath, 'utf-8');
        const regionsMatch = regionsContent.match(/window\.regions = (\[[\s\S]*?\]);/);
        if (!regionsMatch) {
            throw new Error('Could not find regions data in the liquid file');
        }
        let parsedRegions: Country[];
        try {
            parsedRegions = JSON.parse(regionsMatch[1]);
        } catch (error) {
            throw new Error('Invalid JSON format in regions data');
        }
        if (!Array.isArray(parsedRegions) || parsedRegions.length === 0) {
            throw new Error('Regions data must be a non-empty array');
        }

        const masterRegionListSet = new Set<string>();
        parsedRegions.forEach(country => {
            if (country.region) masterRegionListSet.add(country.region);
            if (country["sub-region"]) masterRegionListSet.add(country["sub-region"]);
        });
        const masterRegionList = Array.from(masterRegionListSet);

        if (masterRegionList.length === 0) {
            return json({ success: true, message: "No regions or sub-regions found in the source data. No products updated." });
        }

        let allProductIds: string[] = [];
        let hasNextPage = true;
        let cursor: string | null = null;
        const PRODUCT_QUERY_BATCH_SIZE = 100;

        while (hasNextPage) {
            const productQueryResponse: GraphQLResponse<ProductsData> = await admin.graphql(
                `#graphql
                query getProducts($first: Int!, $after: String) {
                  products(first: $first, after: $after, sortKey: ID) {
                    edges {
                      node {
                        id
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }`,
                {
                    variables: {
                        first: PRODUCT_QUERY_BATCH_SIZE,
                        after: cursor,
                    },
                }
            );
            const productQueryResult = await productQueryResponse.json();
            if (!productQueryResult.data?.products) {
                const errorDetails = productQueryResult.errors ? JSON.stringify(productQueryResult.errors) : 'Malformed product query response.';
                throw new Error(`Failed to fetch products: ${errorDetails}`);
            }

            productQueryResult.data.products.edges.forEach((edge: ProductEdge) => {
                allProductIds.push(edge.node.id);
            });
            hasNextPage = productQueryResult.data.products.pageInfo.hasNextPage;
            cursor = productQueryResult.data.products.pageInfo.endCursor;
        }

        if (allProductIds.length === 0) {
            return json({ success: true, message: "No products found in the store. No metafields set." });
        }

        for (const productId of allProductIds) {
            const randomRegions = getRandomSubset(masterRegionList, 1, 3);

            if (randomRegions.length > 0) {
                const metafieldInput = {
                    metafields: [
                        {
                            ownerId: productId,
                            namespace: "product_specs",
                            key: "available_regions",
                            type: "json",
                            value: JSON.stringify(randomRegions),
                        }
                    ]
                };

                const response: GraphQLResponse<MetafieldsSetData> = await admin.graphql(
                    `#graphql
                    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
                        metafieldsSet(metafields: $metafields) {
                            metafields {
                                id
                                key
                                namespace
                                ownerType
                            }
                            userErrors {
                                field
                                message
                                code
                            }
                        }
                    }`,
                    { variables: metafieldInput }
                );
                const responseJson = await response.json();

                if (responseJson.data?.metafieldsSet?.userErrors && responseJson.data.metafieldsSet.userErrors.length > 0) {
                    console.error(`Failed to set metafield for product ${productId}:`, responseJson.data.metafieldsSet.userErrors);
                } else if (responseJson.data?.metafieldsSet?.metafields && responseJson.data.metafieldsSet.metafields.length > 0) {
                    productsUpdatedCount++;
                } else {
                    console.warn(`Unexpected response or no metafields set for product ${productId}:`, responseJson);
                }
            }
        }

        return json({
            success: true,
            message: `Successfully processed ${allProductIds.length} products. ${productsUpdatedCount} products had their 'available_regions' metafield set/updated.`
        });

    } catch (error) {
        console.error("Error setting product regions metafields:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return json({
            success: false,
            message: `Failed to set product regions: ${errorMessage}`
        }, { status: 500 });
    }
};
