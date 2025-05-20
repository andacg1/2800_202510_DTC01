import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  Grid,
  LegacyCard,
  InlineStack,
} from "@shopify/polaris";
import { Prisma, ProductComparison } from "@prisma/client";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import ComparisonSummary from "../components/ComparisonSummary";

export interface Metafield {
  id?: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface Product {
  id: string;
  title: string;
}

export interface FetcherData {
  metafields?: Metafield[];
  metafield?: Metafield;
  deletedId?: string;
  error?: string;
}

interface ProductMetafieldManagerProps {
  actionData: FetcherData | undefined;
  initialProduct?: Product;
  initialMetafields?: Metafield[];
}

/**
 * Extracts the short product ID from a Shopify GID (Global ID) or number.
 * Removes the "gid://shopify/Product/" prefix if present.
 *
 * @param {string | number} gid - The Shopify Global ID or numeric product ID
 * @returns {string} The short product ID as a string
 */
export const getShortId = (gid: string | number): string => {
  if (typeof gid === "number") {
    return String(gid);
  }
  return gid.replace("gid://shopify/Product/", "");
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const comparedProductId = new URL(request.url).searchParams.get(
    "comparedProductId",
  );

  let comparisons: ProductComparison[] = [];
  if (comparedProductId) {
    comparisons = await prisma.productComparison.findMany({
      where: {
        originalProductId: comparedProductId,
      },
    });
  } else {
    comparisons = [];
  }
  const allComparedProductIds = new Set(
    comparisons.flatMap((comparison) => comparison.comparedProducts),
  );

  let productTitles = [];
  try {
    const response = await admin.graphql(
      `
query Products($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      id
      title
    }
  }
}
    `,
      {
        variables: {
          ids: Array.from(allComparedProductIds).map(
            (id) => `gid://shopify/Product/${id}`,
          ),
        },
      },
    );
    const json = await response.json();
    productTitles = json.data.nodes;
  } catch (e) {
    console.error(e);
  }

  return {
    comparisons,
    productTitles,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  return {
    admin,
  };
};

export default function ProductMetafieldManager({
  initialProduct,
}: ProductMetafieldManagerProps) {
  const { comparisons, productTitles } = useLoaderData<typeof loader>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    initialProduct || null,
  );
  {
    const fetcher = useFetcher<typeof action>();

    const shopify = useAppBridge();
    const isLoading =
      ["loading", "submitting"].includes(fetcher.state) &&
      fetcher.formMethod === "POST";
    const [searchParams, setSearchParams] = useSearchParams();
    const productId =
      fetcher.data?.product?.id && getShortId(fetcher.data?.product?.id);

    useEffect(() => {
      if (productId) {
        shopify.toast.show("Product created");
      }
    }, [productId, shopify]);
    const generateProduct = () => fetcher.submit({}, { method: "POST" });

    const handleProductSelect = async () => {
      try {
        const products = await window.shopify.resourcePicker({
          type: "product",
          action: "select",
        });

        if (products && products.length > 0) {
          const selected = products[0];
          setSelectedProduct({
            id: selected.id,
            title: selected.title,
          });

          const params = new URLSearchParams();
          params.set("comparedProductId", getShortId(selected.id));
          setSearchParams(params, {
            preventScrollReset: true,
          });
        }
      } catch (error) {
        console.error("Failed to select product:", error);
      }
    };

    return (
      <Page>
        <TitleBar title="Remix app template">
          <button variant="primary" onClick={generateProduct}>
            Generate a product
          </button>
        </TitleBar>

        <BlockStack gap="500">
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="500">
                  <BlockStack gap="200">
                    <Text as="h4" variant="headingMd">
                      Admin Dashboard
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="h4" variant="headingMd">
                        Comparison History
                      </Text>

                      {selectedProduct && (
                        <Text as="h2" variant="headingMd">
                          Selected Product: {selectedProduct.title}
                        </Text>
                      )}

                      <Button onClick={handleProductSelect}>
                        Select Product
                      </Button>
                    </InlineStack>

                    <Card roundedAbove="sm">
                      <ComparisonSummary
                        comparisons={comparisons}
                        productTitles={productTitles}
                      />
                    </Card>
                  </BlockStack>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </BlockStack>
      </Page>
    );
  }
}
