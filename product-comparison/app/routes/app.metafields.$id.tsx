import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { authenticate } from "../shopify.server";
import ProductMetafieldManager from "./app.metafield_editor/ProductMetafieldManager";

/**
 * Loader function that fetches product and metafield data
 * Retrieves a specific product and its metafields using the Shopify GraphQL API
 *
 * @param {LoaderFunctionArgs} params - Loader function arguments
 * @param {Request} params.request - The incoming request object
 * @param {Object} params.params - URL parameters containing product ID
 * @returns {Promise<Object>} Object containing product and metafield data
 * @throws {Response} 404 error if product is not found
 */
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const productId = params.id;

  // Fetch initial product data
  const response = await admin.graphql(`
    query {
      product(id: "gid://shopify/Product/${productId}") {
        id
        title
        metafields(first: 50) {
          edges {
            node {
              id
              namespace
              key
              value
              type
            }
          }
        }
      }
    }
  `);

  const { data } = await response.json();
  console.log(data);

  if (!data.product) {
    throw new Response("Product not found", { status: 404 });
  }

  return {
    admin,
    initialProduct: {
      id: data.product.id,
      title: data.product.title,
    },
    initialMetafields: data.product.metafields.edges.map(
      (edge: any) => edge.node,
    ),
  };
};

/**
 * Action function that handles metafield operations
 * Supports fetching, adding, updating, and deleting metafields
 *
 * @param {ActionFunctionArgs} params - Action function arguments
 * @param {Request} params.request - The incoming request object
 * @returns {Promise<Object>} Response object containing operation result
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    if (!action || action === "fetchMetafields") {
      const productId = formData.get("productId") as string;
      const response = await admin.graphql(`
        query {
          product(id: "gid://shopify/Product/${productId}") {
            metafields(first: 50) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                  type
                }
              }
            }
          }
        }
      `);

      const {
        data: {
          product: {
            metafields: { edges },
          },
        },
      } = await response.json();

      return { metafields: edges.map((edge: any) => edge.node) };
    } else if (action === "addMetafield" || action === "updateMetafield") {
      const productId = formData.get("productId") as string;
      const metafieldKey = formData.get("metafieldKey") as string;
      const metafieldValue = formData.get("metafieldValue") as string;
      const metafieldType = formData.get("metafieldType") as string;

      const response = await admin.graphql(
        `
        mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              namespace
              key
              value
              type
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
        {
          variables: {
            metafields: [
              {
                ownerId: productId,
                namespace: "product_specs",
                key: metafieldKey,
                value: metafieldValue,
                type: metafieldType,
              },
            ],
          },
        },
      );

      const { data } = await response.json();
      if (data.metafieldsSet.userErrors.length > 0) {
        return { error: data.metafieldsSet.userErrors[0].message };
      }
      return { metafield: data.metafieldsSet.metafields[0] };
    } else if (action === "deleteMetafield") {
      const metafieldId = formData.get("metafieldId") as string;
      const metafieldKey = formData.get("metafieldKey") as string;
      const productId = formData.get("productId") as string;
      await admin.graphql(
        `
        mutation MetafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {
          metafieldsDelete(metafields: $metafields) {
            deletedMetafields {
              ownerId
              namespace
              key
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
        {
          variables: {
            metafields: [
              {
                ownerId: productId,
                namespace: "product_specs",
                key: metafieldKey,
              },
            ],
          },
        },
      );

      return { deletedId: metafieldId };
    } else {
      return { error: "Invalid action" };
    }
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while processing your request" };
  }
};

/**
 * ProductMetafieldsPage component that renders the metafield management interface
 * Displays and allows editing of a product's metafields
 *
 * @returns {JSX.Element} The rendered product metafields page component
 */
export default function ProductMetafieldsPage() {
  const actionData = useActionData<typeof action>();
  const { initialProduct, initialMetafields } = useLoaderData<typeof loader>();
  useEffect(() => {
    console.log({ initialProduct, initialMetafields });
  }, [initialMetafields, initialProduct]);

  return (
    <ProductMetafieldManager
      actionData={actionData}
      initialProduct={initialProduct}
      initialMetafields={initialMetafields}
    />
  );
}
