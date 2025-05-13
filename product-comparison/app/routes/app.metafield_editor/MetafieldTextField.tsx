import React, { useCallback, useEffect, useRef, useState } from "react";
import { TextField } from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";
import type {
  FetcherData,
  Metafield,
  Product,
} from "./ProductMetafieldManager";

type MetafieldTextFieldProps = {
  className?: string;
  children?: React.ReactNode;
  label?: string;
  metafield: Metafield;
  selectedProduct: Product;
};

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
