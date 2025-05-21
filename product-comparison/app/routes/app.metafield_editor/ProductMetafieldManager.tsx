import {
  Form,
  useFetcher,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Banner,
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  Layout,
  LegacyStack,
  Modal,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import MetafieldTextField from "./MetafieldTextField";

/**
 * Interface representing a Shopify metafield
 */
export interface Metafield {
  id?: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
}

/**
 * Interface representing a Shopify product
 */
export interface Product {
  id: string;
  title: string;
}

/**
 * Interface for data returned by the fetcher
 */
export interface FetcherData {
  metafields?: Metafield[];
  metafield?: Metafield;
  deletedId?: string;
  error?: string;
}

/**
 * Props for the ProductMetafieldManager component
 */
interface ProductMetafieldManagerProps {
  actionData: FetcherData | undefined;
  initialProduct?: Product;
  initialMetafields?: Metafield[];
}

/**
 * A component that manages product metafields in the Shopify admin.
 * Allows adding, editing, and deleting metafields for a selected product.
 *
 * @param {Object} props - Component props
 * @param {FetcherData} [props.actionData] - Data from the last action
 * @param {Product} [props.initialProduct] - Initially selected product
 * @param {Metafield[]} [props.initialMetafields] - Initial metafields for the selected product
 * @returns {JSX.Element} The rendered product metafield manager
 */
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

  /**
   * Handles product selection using Shopify's resource picker
   * Updates the selected product and navigates to the metafields page for that product
   */
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
        const shortId = selected.id.split("/").at(-1);
        navigate(`/app/metafields/${shortId}`, {
          replace: true,
          flushSync: true,
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
                <BlockStack>
                  {initialMetafields?.length === 0 ? (
                    <Text as="p">No metafields found for this product.</Text>
                  ) : (
                    <LegacyStack vertical spacing="loose">
                      {initialMetafields?.map((metafield) => (
                        <LegacyStack
                          key={metafield.id}
                          distribution="equalSpacing"
                        >
                          <LegacyStack distribution="fill" alignment="center">
                            <Text as="p">
                              {metafield.namespace}.{metafield.key}:{" "}
                            </Text>

                            <MetafieldTextField
                              label=""
                              metafield={metafield}
                              selectedProduct={selectedProduct}
                            />
                          </LegacyStack>

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
                              <Button
                                tone="critical"
                                submit
                                loading={isLoading}
                              >
                                Delete
                              </Button>
                            </Form>
                          </ButtonGroup>
                        </LegacyStack>
                      ))}
                    </LegacyStack>
                  )}
                </BlockStack>
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
              submit(form, { flushSync: true, navigate: true });
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
                  value={"product_specs"}
                  onChange={(value) =>
                    setNewMetafield({ ...newMetafield, namespace: value })
                  }
                  autoComplete="off"
                  disabled
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
