import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const requestBody = await request.json();
    const { productId, metafields } = requestBody;

    if (!productId || !metafields || !Array.isArray(metafields)) {
      return json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    const metafieldsInput = metafields.map((mf: any) => ({
      ownerId: productId,
      namespace: mf.namespace,
      key: mf.key,
      value: mf.value,
      type: mf.type,
    }));

    const response = await admin.graphql(
      `#graphql
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
            type
            owner {
              ... on Product {
                id
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafields: metafieldsInput,
        },
      },
    );

    const responseJson = await response.json();

    if (responseJson.data.metafieldsSet.userErrors.length > 0) {
      return json(
        {
          error: "Failed to update metafields",
          details: responseJson.data.metafieldsSet.userErrors,
        },
        { status: 400 },
      );
    }

    return json({
      message: "Metafields updated successfully",
      metafields: responseJson.data.metafieldsSet.metafields,
    });
  } catch (error: any) {
    console.error("Error updating metafields:", error);
    return json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
};