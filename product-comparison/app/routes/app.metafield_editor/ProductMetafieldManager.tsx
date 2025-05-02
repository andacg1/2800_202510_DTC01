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
import { Form, useFetcher, useNavigate, useNavigation, useSubmit } from "@remix-run/react";

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

interface FetcherData {
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

export default function ProductMetafieldManager({
  actionData,
  initialProduct,
  initialMetafields,
}: ProductMetafieldManagerProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    initialProduct || null,
  );
  const [metafields, setMetafields] = useState<Metafield[]>(
    initialMetafields ? initialMetafields : [],
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMetafield, setNewMetafield] = useState<Metafield>({
    namespace: "",
    key: "",
    value: "",
    type: "string",
  });
  const refreshFetcher = useFetcher<FetcherData>();
  const addMetafieldFetcher = useFetcher<FetcherData>();

  const navigation = useNavigation();
  const navigate = useNavigate();
  const submit = useSubmit();
  const isLoading = navigation.state === "submitting";

  // Update metafields when actionData changes
  useEffect(() => {
    // FIXME
    if (actionData?.metafields) {
      setMetafields(actionData.metafields);
    } else if (actionData?.metafield) {
      //setMetafields([...metafields, actionData.metafield]);
      setShowAddModal(false);
      setNewMetafield({ namespace: "", key: "", value: "", type: "string" });
    } else if (actionData?.deletedId) {
      setMetafields(metafields.filter((m) => m.id !== actionData.deletedId));
    }
  }, [actionData?.metafields, initialMetafields, actionData]);

  useEffect(() => {
    console.log({ initialProduct, initialMetafields });

  }, [initialProduct, initialMetafields]);

  // useEffect(() => {
  //   if (refreshFetcher?.data?.metafields) {
  //     setMetafields([...refreshFetcher.data.metafields]);
  //   }
  // }, [refreshFetcher.data]);

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
        const shortId = selected.id.split('/').at(-1)
        navigate(`/app/metafields/${shortId}`, {replace: true, flushSync: true})

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

                {initialMetafields?.length === 0 ? (
                  <Text as="p">No metafields found for this product.</Text>
                ) : (
                  <LegacyStack vertical spacing="loose">
                    {initialMetafields?.map((metafield) => (
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
                            <input
                              type="hidden"
                              name="metafieldNamespace"
                              value={metafield.namespace}
                            />
                            <input
                              type="hidden"
                              name="metafieldKey"
                              value={metafield.key}
                            />
                            <input
                              type="hidden"
                              name="productId"
                              value={selectedProduct.id}
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
              //form?.submit();
              submit(form, {flushSync: true, navigate: true})
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
            <addMetafieldFetcher.Form id="addMetafieldForm" method="post">
              <input type="hidden" name="action" value="addMetafield" />
              <input
                type="hidden"
                name="productId"
                value={selectedProduct?.id}
              />
              <BlockStack gap="400">
                <TextField
                  label="Namespace"
                  name="metafieldNamespace"
                  value={newMetafield.namespace}
                  onChange={(value) =>
                    setNewMetafield({ ...newMetafield, namespace: value })
                  }
                  autoComplete="off"
                />
                <TextField
                  label="Key"
                  name="metafieldKey"
                  value={newMetafield.key}
                  onChange={(value) =>
                    setNewMetafield({ ...newMetafield, key: value })
                  }
                  autoComplete="off"
                />
                <TextField
                  label="Value"
                  name="metafieldValue"
                  value={newMetafield.value}
                  onChange={(value) =>
                    setNewMetafield({ ...newMetafield, value: value })
                  }
                  autoComplete="off"
                />
                <Select
                  label="Type"
                  name="metafieldType"
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
            </addMetafieldFetcher.Form>
          </Modal.Section>
        </Modal>
      </Layout>
    </Page>
  );
}
