import { useEffect } from "react";
import { authenticate } from "../shopify.server";
import ProductMetafieldManager from "./app.old_metafields/ProductMetafieldManager";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";

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
    } else if (action === "addMetafield") {
      const productId = formData.get("productId") as string;
      const namespace = formData.get("namespace") as string;
      const key = formData.get("key") as string;
      const value = formData.get("value") as string;
      const type = formData.get("type") as string;

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
                namespace,
                key,
                value,
                type,
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
      await admin.graphql(
        `
        mutation metafieldDelete($input: MetafieldDeleteInput!) {
          metafieldDelete(input: $input) {
            deletedId
            userErrors {
              field
              message
            }
          }
        }
      `,
        {
          variables: {
            input: {
              id: metafieldId,
            },
          },
        },
      );

      return { deletedId: metafieldId };
    } else {
      return { error: "Invalid action" };
    }
  } catch (error) {
    return { error: "An error occurred while processing your request" };
  }
};

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
