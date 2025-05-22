import { useFetcher } from "@remix-run/react";
import { TextField } from "@shopify/polaris";
import React, { useCallback, useRef, useState } from "react";
import type {
  FetcherData,
  Metafield,
  Product,
} from "./ProductMetafieldManager";

/**
 * Props for the MetafieldTextField component
 */
type MetafieldTextFieldProps = {
  className?: string;
  children?: React.ReactNode;
  label?: string;
  metafield: Metafield;
  selectedProduct: Product;
};

/**
 * A component that renders an editable text field for a product metafield.
 * Automatically submits changes to update the metafield value.
 *
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes to apply to the component
 * @param {React.ReactNode} [props.children] - Child elements
 * @param {string} [props.label] - Label for the text field
 * @param {Metafield} props.metafield - The metafield to edit
 * @param {Product} props.selectedProduct - The product this metafield belongs to
 * @returns {JSX.Element | null} The rendered text field or null if no metafield/product is provided
 */
const MetafieldTextField = ({
  className,
  children,
  label,
  metafield,
  selectedProduct,
  ...restProps
}: MetafieldTextFieldProps) => {
  const fetcher = useFetcher<FetcherData>();
  const [value, setValue] = useState(metafield?.value);
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Handles changes to the text field value.
   * Automatically submits the form to update the metafield.
   *
   * @param {string} newValue - The new value entered in the text field
   */
  const handleChange = useCallback(
    (newValue: string) => {
      if (!formRef?.current) {
        console.log("formRef not found");
        return;
      }
      setValue(newValue);
      fetcher.submit(formRef.current);
    },
    [fetcher],
  );

  if (!metafield || !selectedProduct?.id) {
    return null;
  }
  return (
    <fetcher.Form
      id={`metafield-${metafield?.namespace}-${metafield?.key}`}
      method="post"
      ref={formRef}
    >
      <input type="hidden" name="action" value="updateMetafield" />
      <input type="hidden" name="metafieldId" value={metafield.id} />
      <input
        type="hidden"
        name="metafieldNamespace"
        value={metafield.namespace}
      />
      <input type="hidden" name="metafieldKey" value={metafield.key} />
      <input type="hidden" name="metafieldType" value={metafield.type} />
      <input type="hidden" name="productId" value={selectedProduct.id} />
      <TextField
        name="metafieldValue"
        label={label}
        value={value}
        onChange={handleChange}
        autoComplete="off"
        {...restProps}
      />
    </fetcher.Form>
  );
};

export default MetafieldTextField;
