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
                    type
                    value
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
      const metafields = product.metafields.edges.map(({ node }: any) => {

        let parsedValue;
        try {
          parsedValue = JSON.parse(node.value);
        } catch {
          parsedValue = node.value;
        }


        return {
          id: node.id,
          type: node.type.toLowerCase() as 'boolean' | 'date' | 'color',
          multi_line_text_field: typeof parsedValue === 'string' ? parsedValue : JSON.stringify(parsedValue),
          money: node.type === 'money' ? parsedValue : {},
          dimension: node.type === 'dimension' ? parsedValue : null,
          rating: node.type === 'rating' ? parsedValue : {},
          link: node.type === 'link' ? parsedValue : null,
          volume: node.type === 'volume' ? parsedValue : null,
          weight: node.type === 'weight' ? parsedValue : null,
        };
      });

      for (const metafield of metafields) {
        await prisma.metafields.upsert({
          where: {
            id: metafield.id,
          },
          update: metafield,
          create: metafield,
        });
      }
    }

    return json({ success: true, message: "Metafields synced successfully" });
  } catch (error) {
    console.error("Error syncing metafields:", error);
    return json(
      { success: false, message: "Failed to sync metafields" },
      { status: 500 }
    );
  }
}; 