import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    const response = await admin.graphql(`
      query {
        products(first: 250) {
          edges {
            node {
              id
              metafields(first: 100) {
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
        }
      }
    `);

    const responseJson = await response.json();
    const products = responseJson.data.products.edges;

    for (const { node: product } of products) {
      const metafields = product.metafields.edges.map(({ node }: any) => ({
        id: node.id,
        namespace: node.namespace,
        key: node.key,
        value: node.value,
        type: node.type,
        productId: product.id,
      }));

      for (const metafield of metafields) {
        await prisma.metafield.upsert({
          where: {
            id: metafield.id,
          },
          update: {
            namespace: metafield.namespace,
            key: metafield.key,
            value: metafield.value,
            type: metafield.type,
            productId: metafield.productId,
          },
          create: {
            id: metafield.id,
            namespace: metafield.namespace,
            key: metafield.key,
            value: metafield.value,
            type: metafield.type,
            productId: metafield.productId,
          },
        });
      }
    }

    return json({ success: true, message: "Metafields synced successfully" });
  } catch (error) {
    console.error("Error syncing metafields:", error);
    return json(
      { success: false, message: "Failed to sync metafields" },
      { status: 500 },
    );
  }
};
