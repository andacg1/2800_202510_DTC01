import React, { useContext, useEffect, useState } from "react";
import type { ActionMeta, MultiValue, StylesConfig } from "react-select";
import Select from "react-select";
import { isAvailable, type Product } from "./product.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { LocationContext } from "./LocationContext.ts";
import makeAnimated from "react-select/animated";
import { RecommendationContext } from "./RecommendationQuery/RecommendationContext.ts";
import { getShortId } from "./utils.ts";

/**
 * Props for the MultiColumnComparison component
 */
type MultiColumnComparisonProps = {
  className?: string;
  children?: React.ReactNode;
  products: Product[];
};

/**
 * Type definition for product options used in the multi-select dropdown
 */
export type ProductOption = {
  readonly value: string;
  readonly label: string;
  readonly product: Product;
};

const animatedComponents = makeAnimated();

/**
 * Custom styles configuration for the React-Select component
 */
const selectStyles: StylesConfig<ProductOption, true> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "white",
    animation: "none",
    opacity: 1,
    transform: "translateY(0px)",
  }),
  menu: (styles) => ({
    ...styles,
    zIndex: "100",
    backgroundColor: "white",
    animation: "none",
    opacity: 1,
    transform: "translateY(0px)",
  }),
  input: (styles) => ({
    ...styles,
    ":focus-visible": {
      ...styles[":focus-visible"],
      boxShadow: "none",
    },
  }),
};

/**
 * A component that renders a multi-column product comparison interface.
 * Features a multi-select dropdown for product selection and displays a detailed
 * comparison table of the selected products' specifications.
 *
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes to apply to the component
 * @param {React.ReactNode} [props.children] - Child elements
 * @param {Product[]} props.products - Array of products available for comparison
 * @returns {JSX.Element} The rendered multi-column comparison component
 */
const MultiColumnComparison = ({
  className,
  children,
  products,
}: MultiColumnComparisonProps) => {
  const pathName = window.location.pathname;
  const productOptions = products.map((product) => ({
    value: String(product.id),
    label: product.title,
    product: product,
    isFixed: window.location.pathname.includes(product.handle),
  }));

  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<ProductOption>
  >(
    productOptions.filter((option) =>
      window.location.pathname.includes(option.product.handle),
    ),
  );
  const { location: userLocation } = useContext(LocationContext);
  const { recommendation, setRecommendation } = useContext(
    RecommendationContext,
  );

  /**
   * Gets the currently viewed product based on the URL path
   * @returns {ProductOption | undefined} The current product option or undefined if not found
   */
  const getCurrentProduct = () =>
    productOptions.find((option) => pathName.includes(option.product.handle));

  useEffect(() => {
    console.log({ selectedOptions });
    const currentProductOption = productOptions.find((option) =>
      pathName.includes(option.product.handle),
    );
    console.log({ pathName, productOptions, currentProductOption });
  }, [pathName, productOptions, selectedOptions]);

  useEffect(() => {
    if (!recommendation?.recommendedProductId) {
      console.log("No product ID", recommendation);
      return;
    }
    for (const option of productOptions) {
      console.log(
        getShortId(option.product.id),
        getShortId(recommendation.recommendedProductId),
      );
    }
    setSelectedOptions(
      productOptions.filter(
        (option) =>
          getShortId(recommendation.recommendedProductId) ===
          getShortId(option.product.id),
      ),
    );
  }, [recommendation]);

  /**
   * Gets all unique specification keys across the selected products
   * @returns {string[]} Array of unique specification keys
   */
  const getAllSpecKeys = () => {
    const selectedProductData = products.filter((p) =>
      selectedOptions.map((product) => product.value).includes(String(p.id)),
    );
    const allKeys = new Set<string>();

    selectedProductData.forEach((product) => {
      Object.keys(product.specs).forEach((key) => {
        allKeys.add(key);
      });
    });

    return Array.from(allKeys);
  };

  /**
   * Handles changes in product selection from the multi-select dropdown
   * Tracks the comparison event and updates the selected products state
   *
   * @param {MultiValue<ProductOption>} newValue - The newly selected product options
   * @param {ActionMeta<ProductOption>} actionMeta - Metadata about the selection change action
   */
  const handleProductChange = async (
    newValue: MultiValue<ProductOption>,
    actionMeta: ActionMeta<ProductOption>,
  ) => {
    setSelectedOptions(newValue);
    // TODO: Track the comparison
    const currentProductOption: Product = window?.currentProduct;
    if (!currentProductOption) {
      return console.error('"currentProductOption" is not defined');
    }
    const sessionId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("_shopify_s="))
      ?.split("=")[1];
    console.log({ sessionId });
    const collectionId = window?.collection;

    const resp = await fetch(
      `${import.meta.env.VITE_APP_BACKEND_URL}/api/product/comparison/track`,
      {
        method: "POST",
        body: JSON.stringify({
          collectionId,
          originalProductId: currentProductOption?.id,
          comparedProducts: newValue.map((option) => option.product.id),
          sessionId,
        }),
        mode: "cors",
      },
    );
  };

  return (
    <div className={className}>
      <Select
        isMulti
        name="products"
        options={productOptions}
        components={animatedComponents}
        className="basic-multi-select"
        classNamePrefix="select-internal"
        /* menuIsOpen={true} */
        onChange={handleProductChange}
        value={selectedOptions}
        styles={selectStyles}
      />
      {Array.isArray(selectedOptions) &&
      selectedOptions?.length === 0 ? null : (
        <div className="overflow-x-auto">
          {selectedOptions.length > 0 && (
            <div className="comparison-table">
              <h3>Comparison</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Specification</th>
                    {selectedOptions.map((selectedProduct) => {
                      const product = selectedProduct.product;
                      return (
                        <th key={product.id} className="text-center!">
                          {product?.title}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {getAllSpecKeys().map((specKey) => (
                    <tr key={specKey}>
                      {specKey === "available_regions" && userLocation ? (
                        <td>{`Available in ${userLocation?.country_name || "N/A"}?`}</td>
                      ) : (
                        <td>{specKey.replace("_", " ")}</td>
                      )}
                      {selectedOptions.map((selectedProduct) => {
                        const product = selectedProduct.product;
                        const specValue = product?.specs[specKey];
                        const isAvailableField =
                          specKey === "available_regions";
                        if (
                          isAvailableField &&
                          userLocation &&
                          Array.isArray(specValue)
                        ) {
                          return (
                            <td
                              key={`${product.id}-${specKey}`}
                              className="text-center"
                            >
                              <div className="flex flex-col items-center justify-center">
                                {isAvailable(userLocation, specValue) ? (
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    color={"rgba(31,255,0,0.5)"}
                                    size={"2x"}
                                    fixedWidth
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faX}
                                    color={"#b02525"}
                                    size={"2x"}
                                    fixedWidth
                                  />
                                )}
                                <div>{specValue.join(", ")}</div>
                              </div>
                            </td>
                          );
                        }
                        return (
                          <td
                            key={`${product.id}-${specKey}`}
                            className="text-center"
                          >
                            <div className="flex flex-col items-center justify-center">
                              {Array.isArray(specValue)
                                ? specValue.join(", ")
                                : specValue?.toString() || "N/A"}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiColumnComparison;
