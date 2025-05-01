import {
  LegacyStack,
  FormLayout,
  Select,
  TextField,
  InlineError,
  Button,
  LegacyCard,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";

export function SeparateValidationErrorExample() {
  const [metafieldName, setMetafieldName] = useState("");
  const [metafieldValue, setMetafieldValue] = useState("");
  const [textFieldValue, setTextFieldValue] = useState("");
  const [selectTypeValue, setSelectTypeValue] = useState("Product type");
  const [selectConditionValue, setSelectConditionValue] =
    useState("is equal to");

  const handleMetafieldNameChange = useCallback(
    (value: string) => setMetafieldName(value),
    [],
  );

  const handleMetafieldValueChange = useCallback(
    (value: string) => setMetafieldValue(value),
    [],
  );

  const handleSelectTypeChange = useCallback(
    (value: string) => setSelectTypeValue(value),
    [],
  );

  const handleSelectConditionChange = useCallback(
    (value: string) => setSelectConditionValue(value),
    [],
  );

  const textFieldID = "ruleContent";
  const isInvalid = isValueInvalid(textFieldValue);
  const errorMessage = isInvalid
    ? "Enter 3 or more characters for product type is equal to"
    : "";

  const formGroupMarkup = (
    <LegacyStack wrap={false} alignment="leading" spacing="loose">
      <LegacyStack.Item fill>
        <FormLayout>
          <FormLayout.Group condensed>
            <TextField
              labelHidden={false}
              label="Metafield Name"
              error={isInvalid}
              id={textFieldID}
              value={metafieldName}
              onChange={handleMetafieldNameChange}
              autoComplete="off"
            />
            <TextField
              labelHidden={false}
              label="Metafield Value"
              error={isInvalid}
              id={textFieldID}
              value={metafieldValue}
              onChange={handleMetafieldValueChange}
              autoComplete="off"
            />
            <Select
              labelHidden={false}
              label="Metafield Type"
              options={["Text", "Number"]}
              value={selectTypeValue}
              onChange={handleSelectTypeChange}
            />
          </FormLayout.Group>
        </FormLayout>
        <div style={{ marginTop: "4px" }}>
          <InlineError message={errorMessage} fieldID={textFieldID} />
        </div>
      </LegacyStack.Item>
      <Button icon={DeleteIcon} accessibilityLabel="Remove item" />
    </LegacyStack>
  );

  return (
    <LegacyCard sectioned>
      <FormLayout>{formGroupMarkup}</FormLayout>
    </LegacyCard>
  );

  function isValueInvalid(content: string) {
    if (!content) {
      return true;
    }

    return content.length < 3;
  }
}
