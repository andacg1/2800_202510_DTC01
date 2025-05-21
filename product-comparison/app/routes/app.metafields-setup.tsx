import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Banner, BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { useState } from "react";
import { authenticate } from "../shopify.server";

/**
 * Loader function for the metafields setup page
 * Authenticates admin requests and provides shop information
 *
 * @param {Object} params - Loader function parameters
 * @param {Request} params.request - The incoming request object
 * @returns {Promise<Response>} JSON response containing shop data
 */
export const loader: LoaderFunction = async ({ request }) => {
  await authenticate.admin(request);
  return json({ shop: process.env.SHOPIFY_SHOP });
};

/**
 * MetafieldsSetup component that provides UI for setting up product metafields
 * Allows generating random metafields for all products in the store
 *
 * @returns {JSX.Element} The rendered metafields setup page component
 */
export default function MetafieldsSetup() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [data, setData] = useState<{
    processedCount?: number;
    errorCount?: number;
    errors?: string[];
  } | null>(null);

  /**
   * Sets up metafields for all products in the store
   * Makes an API call to generate random metafield values
   * Updates the UI state based on the operation result
   */
  const setupMetafields = async () => {
    setStatus("loading");
    setMessage("");
    setData(null);

    try {
      const response = await fetch("/api/metafields/setup", {
        method: "POST",
      });
      const responseData = await response.json();

      if (responseData.success) {
        setStatus("success");
        setMessage(responseData.message);
        setData(responseData.data);
      } else {
        setStatus("error");
        setMessage(responseData.message || "Failed to set up metafields");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to set up metafields");
    }
  };

  return (
    <Page
      title="Metafields Setup"
      primaryAction={{
        content: "Generate Metafields",
        onAction: setupMetafields,
        loading: status === "loading",
      }}
    >
      <Layout>
        <Layout.Section>
          {status === "success" && (
            <Banner
              title="Success"
              tone="success"
              onDismiss={() => setStatus("idle")}
            >
              <p>{message}</p>
              {data && (
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    Processed {data.processedCount} products
                  </Text>
                  {data.errorCount && data.errorCount > 0 && (
                    <Text as="p" variant="bodyMd" tone="critical">
                      {data.errorCount} errors occurred
                    </Text>
                  )}
                </BlockStack>
              )}
            </Banner>
          )}

          {status === "error" && (
            <Banner
              title="Error"
              tone="critical"
              onDismiss={() => setStatus("idle")}
            >
              <p>{message}</p>
            </Banner>
          )}

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Generate Random Metafields
              </Text>
              <Text as="p" variant="bodyMd">
                This will generate random metafields for all products in your
                store. Each product will get a random selection of metafields
                from the following categories:
              </Text>
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd">
                  • Warranty (1 Year, 2 Years, 3 Years, Lifetime)
                  <br />
                  • Material (Aluminum, Steel, Plastic, Wood, Carbon Fiber)
                  <br />
                  • Color Options (Red, Blue, Black, White, Silver, Gold)
                  <br />
                  • Weight (Light, Medium, Heavy)
                  <br />
                  • Dimensions (Compact, Standard, Large)
                  <br />
                  • Battery Life (Short, Medium, Long)
                  <br />
                  • Water Resistant (Yes, No)
                  <br />
                  • Certification (CE, UL, FCC, RoHS, ISO9001)
                  <br />• Storage
                  <br />• RAM
                </Text>
              </BlockStack>
              <Text as="p" variant="bodyMd">
                Each product has a 50% chance of getting each metafield type.
                Here be dragons!
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
