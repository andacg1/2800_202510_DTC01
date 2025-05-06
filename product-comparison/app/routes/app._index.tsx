import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
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
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);
  const generateProduct = () => fetcher.submit({}, { method: "POST" });

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

                  <Page fullWidth>
                    <Grid>
                      <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                        <LegacyCard title="PlaceHolder" sectioned>
                          <p>View a summary of your online store’s sales.</p>
                        </LegacyCard>
                      </Grid.Cell>

                      <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                        <LegacyCard title="PlaceHolder" sectioned>
                          <p>View a summary of your online store’s orders.</p>
                        </LegacyCard>
                      </Grid.Cell>

                      <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                        <LegacyCard title="PlaceHolder" sectioned>
                          <p>View a summary of your online store’s orders.</p>
                        </LegacyCard>
                      </Grid.Cell>

                      <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                        <LegacyCard title="PlaceHolder" sectioned>
                          <p>View a summary of your online store’s orders.</p>
                        </LegacyCard>
                      </Grid.Cell>
                    </Grid>
                  </Page>

                </BlockStack>

                <BlockStack gap="200">
                  <Text as="h4" variant="headingMd">
                    Comparison History
                  </Text>

                  <Card roundedAbove="sm">
                    <Text as="h2" variant="headingSm">
                      Online store dashboard
                    </Text>
                    <Box paddingBlock="200">
                      <BlockStack gap="200">
                        <Text as="h3" variant="headingSm" fontWeight="medium">
                          Reports
                        </Text>
                        <Text as="p" variant="bodyMd">
                          View a summary of your online store’s performance.
                        </Text>
                      </BlockStack>
                    </Box>
                    <Box paddingBlockStart="200">
                      <BlockStack gap="200">
                        <Text as="h3" variant="headingSm" fontWeight="medium">
                          Summary
                        </Text>
                        <Text as="p" variant="bodyMd">
                          View a summary of your online store’s performance, including sales,
                          visitors, top products, and referrals.
                        </Text>
                      </BlockStack>
                    </Box>
                  </Card>

                </BlockStack>
                <InlineStack gap="300">
                  <Button loading={isLoading} onClick={generateProduct}>
                    Generate a product
                  </Button>
                  {fetcher.data?.product && (
                    <Button
                      url={`shopify:admin/products/${productId}`}
                      target="_blank"
                      variant="plain"
                    >
                      View product
                    </Button>
                  )}
                </InlineStack>
                {fetcher.data?.product && (
                  <>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      productCreate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.product, null, 2)}
                        </code>
                      </pre>
                    </Box>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      productVariantsBulkUpdate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.variant, null, 2)}
                        </code>
                      </pre>
                    </Box>
                  </>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
