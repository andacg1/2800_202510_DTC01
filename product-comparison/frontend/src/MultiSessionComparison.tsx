import React, { useContext, useEffect, useState } from "react";
import type { ActionMeta, MultiValue, StylesConfig } from "react-select";
import Select from "react-select";
import { isAvailable, type Product } from "./product.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX, faPlus } from "@fortawesome/free-solid-svg-icons";
import { LocationContext } from "./LocationContext.ts";
import makeAnimated from "react-select/animated";
import { RecommendationContext } from "./RecommendationQuery/RecommendationContext.ts";
import { getShortId } from "./utils.ts";

type MultiColumnComparisonProps = {
  className?: string;
  children?: React.ReactNode;
  products: Product[];
};

export type ProductOption = {
  readonly value: string;
  readonly label: string;
  readonly product: Product;
};

const animatedComponents = makeAnimated();

const selectStyles: StylesConfig<ProductOption, true> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "white",
    animation: "none",
    opacity: 1,
    transform: "translateY(0px)",
    minHeight: "2.5rem",
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    border: "1px solid #e5e7eb",
    "&:hover": {
      borderColor: "#d1d5db",
    },
  }),
  menu: (styles) => ({
    ...styles,
    zIndex: "100",
    backgroundColor: "white",
    animation: "none",
    opacity: 1,
    transform: "translateY(0px)",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    borderRadius: "0.5rem",
    marginTop: "0.5rem",
  }),
  input: (styles) => ({
    ...styles,
    ":focus-visible": {
      ...styles[":focus-visible"],
      boxShadow: "none",
    },
  }),
  option: (styles, state) => ({
    ...styles,
    backgroundColor: state.isSelected ? "#f3f4f6" : "white",
    color: "#1f2937",
    padding: "0.75rem 1rem",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  }),
};

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

  const handleProductChange = async (
    newValue: MultiValue<ProductOption>,
    actionMeta: ActionMeta<ProductOption>,
  ) => {
    setSelectedOptions(newValue);

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
      `${process.env.APP_BACKEND_URL}/api/product/comparison/track`,
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

  const [isSelectOpen, setIsSelectOpen] = useState(false);

  return (
    <div className={`${className} space-y-6`}>
      {/* Product Tabs */}
      <div className="bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap justify-center gap-2 items-center w-full">
          {selectedOptions.map((option) => (
            <button
              key={option.value}
              className="group relative flex items-center justify-center text-center px-4 py-2 bg-base-200 hover:bg-base-300 rounded-lg transition-colors duration-200 min-w-[120px] h-10"
              onClick={() => {}}
            >
              <span className="font-medium text-base-content truncate">
                {option.label}
              </span>
              <button
                className="absolute right-1 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs p-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-base-300/50 transition-colors duration-200 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOptions(
                    selectedOptions.filter((opt) => opt.value !== option.value),
                  );
                }}
                aria-label={`Remove ${option.label} from comparison`}
              >
                <FontAwesomeIcon
                  icon={faX}
                  className="text-base-content/70 group-hover:text-base-content text-sm"
                />
              </button>
            </button>
          ))}
          <button
            className="flex items-center justify-center w-10 h-10 bg-primary hover:bg-primary-focus text-primary-content rounded-lg transition-colors duration-200 flex-shrink-0"
            onClick={() => setIsSelectOpen(true)}
            aria-label="Add product to comparison"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>

      {/* Product Select Dropdown */}
      {isSelectOpen && (
        <div className="relative z-50">
          <Select
            isMulti
            name="products"
            options={productOptions}
            components={animatedComponents}
            className="basic-multi-select"
            classNamePrefix="select-internal"
            menuIsOpen={isSelectOpen}
            onMenuClose={() => setIsSelectOpen(false)}
            onChange={(newValue, actionMeta) => {
              handleProductChange(newValue, actionMeta);
              setIsSelectOpen(false);
            }}
            value={selectedOptions}
            styles={selectStyles}
            placeholder="Select products to compare..."
          />
        </div>
      )}

      {/* Comparison Table */}
      {selectedOptions.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow-sm">
          <div className="comparison-table">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200">
                  <th className="w-1/4 font-semibold text-base-content">
                    Specification
                  </th>
                  {selectedOptions.map((selectedProduct) => {
                    const product = selectedProduct.product;
                    return (
                      <th
                        key={product.id}
                        className="text-center font-semibold text-base-content"
                      >
                        {product?.title}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {getAllSpecKeys().map((specKey) => (
                  <tr key={specKey} className="hover:bg-base-200/50">
                    {specKey === "available_regions" && userLocation ? (
                      <td className="font-medium">{`Available in ${userLocation?.country_name || "N/A"}?`}</td>
                    ) : (
                      <td className="font-medium">
                        {specKey.replace("_", " ")}
                      </td>
                    )}
                    {selectedOptions.map((selectedProduct) => {
                      const product = selectedProduct.product;
                      const specValue = product?.specs[specKey];
                      const isAvailableField = specKey === "available_regions";
                      if (
                        isAvailableField &&
                        userLocation &&
                        Array.isArray(specValue)
                      ) {
                        return (
                          <td
                            key={`${product.id}-${specKey}`}
                            className="text-center align-middle"
                          >
                            <div className="flex flex-col items-center justify-center gap-1">
                              {isAvailable(userLocation, specValue) ? (
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="text-success"
                                  size={"2x"}
                                  fixedWidth
                                />
                              ) : (
                                <FontAwesomeIcon
                                  icon={faX}
                                  className="text-error"
                                  size={"2x"}
                                  fixedWidth
                                />
                              )}
                              <div className="text-sm text-base-content/70">
                                {specValue.join(", ")}
                              </div>
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td
                          key={`${product.id}-${specKey}`}
                          className="text-center align-middle"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-base-content">
                              {Array.isArray(specValue)
                                ? specValue.join(", ")
                                : specValue?.toString() || "N/A"}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiColumnComparison;
