import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

interface GraphQLResponse<T = any> {
  json: () => Promise<{ data?: T; errors?: any[] }>;
}

interface ProductNode {
  id: string;
  title: string;
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

/**
 * Gets a random subset of elements from an array
 *
 * @template T - The type of elements in the array
 * @param {T[]} array - The source array to select elements from
 * @param {number} minSize - Minimum size of the subset
 * @param {number} maxSize - Maximum size of the subset
 * @returns {T[]} A randomly selected subset of elements
 */
function getRandomSubset<T>(array: T[], minSize: number, maxSize: number): T[] {
  const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

const metafieldTypes = {
  product_specs: {
    warranty: ["1 Year", "2 Years", "3 Years", "Lifetime"],
    material: ["Aluminum", "Steel", "Plastic", "Wood", "Carbon Fiber"],
    color_options: ["Red", "Blue", "Black", "White", "Silver", "Gold"],
    weight: ["Light", "Medium", "Heavy"],
    dimensions: ["Compact", "Standard", "Large"],
    battery_life: ["Short", "Medium", "Long"],
    water_resistant: ["Yes", "No"],
    certification: ["CE", "UL", "FCC", "RoHS", "ISO9001"],
    ram: ["8GB", "16GB", "32GB", "64GB", "128GB"],
    storage: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
  },
};

/**
 * Action function that sets up product metafields with random values
 * Processes all products in the store and assigns random values from predefined options
 * for various product specification metafields
 *
 * @param {Object} params - Action function parameters
 * @param {Request} params.request - The incoming request object
 * @returns {Promise<Response>} JSON response indicating success/failure of the operation
 */
export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    const productsQuery = await admin.graphql(
      `#graphql
            query {
                products(first: 250) {
                    edges {
                        node {
                            id
                            title
                        }
                    }
                }
            }`,
    );

    const productsData = await productsQuery.json();
    const allProducts = productsData.data.products.edges.map(
      (edge: { node: ProductNode }) => edge.node,
    );

    if (!allProducts || allProducts.length === 0) {
      throw new Error("No products found");
    }

    const results = {
      success: true,
      processed: 0,
      errors: [] as string[],
    };

    for (const product of allProducts) {
      try {
        const metafields = [];

        for (const [namespace, fields] of Object.entries(metafieldTypes)) {
          for (const [fieldKey, possibleValues] of Object.entries(fields)) {
            if (Math.random() > 0.5) {
              const value = getRandomSubset(possibleValues, 1, 1)[0];
              metafields.push({
                ownerId: product.id,
                namespace,
                key: fieldKey,
                type: "single_line_text_field",
                value: value,
              });
            }
          }
        }

        if (metafields.length > 0) {
          const metafieldInput = {
            metafields,
          };

          const response: GraphQLResponse<MetafieldsSetData> =
            await admin.graphql(
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
              { variables: metafieldInput },
            );

          const responseJson = await response.json();

          if (
            responseJson.data?.metafieldsSet?.userErrors &&
            responseJson.data.metafieldsSet.userErrors.length > 0
          ) {
            results.errors.push(
              `Product ${product.title}: ${responseJson.data.metafieldsSet.userErrors[0].message}`,
            );
          } else {
            results.processed++;
          }
        }
      } catch (error) {
        results.errors.push(
          `Product ${product.title}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    return json({
      success: results.success,
      message: `Processed ${results.processed} products with metafields`,
      data: {
        processedCount: results.processed,
        errorCount: results.errors.length,
        errors: results.errors,
      },
    });
  } catch (error) {
    console.error("Error setting up metafields:", error);
    return json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to set up metafields",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
