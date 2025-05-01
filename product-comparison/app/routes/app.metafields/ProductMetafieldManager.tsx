import { useEffect, useState } from "react";
import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  Select,
  Banner,
  Modal,
  Text,
  LegacyStack,
  ButtonGroup,
  BlockStack,
} from "@shopify/polaris";
import { Form, useFetcher, useNavigation } from "@remix-run/react";
import { iif } from "rxjs";

interface Metafield {
  id?: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
}

interface Product {
  id: string;
  title: string;
}

interface ProductMetafieldManagerProps {
  actionData:
    | {
        metafields?: Metafield[];
        metafield?: Metafield;
        deletedId?: string;
        error?: string;
      }
    | undefined;
}

export default function ProductMetafieldManager({
  actionData,
}: ProductMetafieldManagerProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [metafields, setMetafields] = useState<Metafield[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMetafield, setNewMetafield] = useState<Metafield>({
    namespace: "",
    key: "",
    value: "",
    type: "string",
  });
  const refreshFetcher = useFetcher();

  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  // Update metafields when actionData changes
  if (actionData?.metafields) {
    setMetafields(actionData.metafields);
  } else if (actionData?.metafield) {
    setMetafields([...metafields, actionData.metafield]);
    setShowAddModal(false);
    setNewMetafield({ namespace: "", key: "", value: "", type: "string" });
  } else if (actionData?.deletedId) {
    setMetafields(metafields.filter((m) => m.id !== actionData.deletedId));
  }

  useEffect(() => {
    console.log({ metafields: refreshFetcher?.data?.metafields });
  }, [refreshFetcher.data]);

  useEffect(() => {
    (async () => {
      refreshFetcher.submit(
        {
          action: "fetchMetafields",
          productId: selectedProduct?.id || null,
        },
        { method: "post" },
      );
    })();
  }, [selectedProduct?.id]);
  useEffect(() => {
    if (refreshFetcher?.data?.metafields) {
      setMetafields([...refreshFetcher.data.metafields]);
    }
  }, [refreshFetcher.data]);

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
      }
    } catch (error) {
      console.error("Failed to select product:", error);
    }
  };

  return (
    <Page
      title="Product Metafields Manager"
      primaryAction={{
        content: "Select Product",
        onAction: handleProductSelect,
      }}
    >
      <Layout>
        {actionData?.error && (
          <Layout.Section>
            <Banner tone="critical">{actionData.error}</Banner>
          </Layout.Section>
        )}

        {selectedProduct && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Selected Product: {selectedProduct.title}
                  </Text>
                  <Button onClick={() => setShowAddModal(true)}>
                    Add Metafield
                  </Button>
                </BlockStack>

                <refreshFetcher.Form method="post">
                  <input type="hidden" name="action" value="fetchMetafields" />
                  <input
                    type="hidden"
                    name="productId"
                    value={selectedProduct.id}
                  />
                  <Button submit loading={isLoading}>
                    Refresh Metafields
                  </Button>
                </refreshFetcher.Form>

                {metafields.length === 0 ? (
                  <Text as="p">No metafields found for this product.</Text>
                ) : (
                  <LegacyStack vertical spacing="loose">
                    {metafields.map((metafield) => (
                      <LegacyStack
                        key={metafield.id}
                        distribution="equalSpacing"
                      >
                        <Text as="p">
                          {metafield.namespace}.{metafield.key}:{" "}
                          {metafield.value}
                        </Text>
                        <ButtonGroup>
                          <Form method="post">
                            <input
                              type="hidden"
                              name="action"
                              value="deleteMetafield"
                            />
                            <input
                              type="hidden"
                              name="metafieldId"
                              value={metafield.id}
                            />
                            <Button tone="critical" submit loading={isLoading}>
                              Delete
                            </Button>
                          </Form>
                        </ButtonGroup>
                      </LegacyStack>
                    ))}
                  </LegacyStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        <Modal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Metafield"
          primaryAction={{
            content: "Add",
            onAction: () => {
              const form = document.getElementById(
                "addMetafieldForm",
              ) as HTMLFormElement;
              form?.submit();
            },
            loading: isLoading,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setShowAddModal(false),
            },
          ]}
        >
          <Modal.Section>
            <Form id="addMetafieldForm" method="post">
              <input type="hidden" name="action" value="addMetafield" />
              <input
                type="hidden"
                name="productId"
                value={selectedProduct?.id}
              />
              <BlockStack gap="400">
                <TextField
                  label="Namespace"
                  name="namespace"
                  value={newMetafield.namespace}
                  onChange={(value) =>
                    setNewMetafield({ ...newMetafield, namespace: value })
                  }
                  autoComplete="off"
                />
                <TextField
                  label="Key"
                  name="key"
                  value={newMetafield.key}
                  onChange={(value) =>
                    setNewMetafield({ ...newMetafield, key: value })
                  }
                  autoComplete="off"
                />
                <TextField
                  label="Value"
                  name="value"
                  value={newMetafield.value}
                  onChange={(value) =>
                    setNewMetafield({ ...newMetafield, value: value })
                  }
                  autoComplete="off"
                />
                <Select
                  label="Type"
                  name="type"
                  options={[
                    { label: "String", value: "string" },
                    { label: "Integer", value: "integer" },
                    { label: "JSON String", value: "json_string" },
                  ]}
                  value={newMetafield.type}
                  onChange={(value) =>
                    setNewMetafield({ ...newMetafield, type: value })
                  }
                />
              </BlockStack>
            </Form>
          </Modal.Section>
        </Modal>
      </Layout>
    </Page>
  );
}
