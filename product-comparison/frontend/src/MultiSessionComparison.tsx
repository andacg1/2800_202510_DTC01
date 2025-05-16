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

type Props = {
  className?: string;
  children?: React.ReactNode;
  products: Product[];
};
type ProductOption = {
  readonly value: string;
  readonly label: string;
  readonly product: Product;
};

const animatedComponents = makeAnimated();
const baseStyles = {
  white: "white",
  primary: "hsl(var(--p))",
  hover: "#f3f4f6",
};

const selectStyles: StylesConfig<ProductOption, true> = {
  control: (s) => ({
    ...s,
    backgroundColor: baseStyles.white,
    minHeight: "3rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
    borderRadius: "0.75rem",
    "&:hover": {
      borderColor: "#d1d5db",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    },
    "&:focus-within": {
      borderColor: baseStyles.primary,
      boxShadow: `0 0 0 2px ${baseStyles.primary}20`,
    },
  }),
  menu: (s) => ({
    ...s,
    zIndex: 100,
    backgroundColor: baseStyles.white,
    animation: "fadeIn 0.2s ease-out",
    transform: "translateY(0.5rem)",
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    borderRadius: "0.75rem",
    marginTop: "0.5rem",
    border: "1px solid #e5e7eb",
  }),
  input: (s) => ({
    ...s,
    ":focus-visible": { ...s[":focus-visible"], boxShadow: "none" },
  }),
  option: (s, state) => ({
    ...s,
    backgroundColor: state.isSelected
      ? `${baseStyles.primary}10`
      : baseStyles.white,
    color: state.isSelected ? baseStyles.primary : "#1f2937",
    padding: "0.875rem 1rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: state.isSelected
        ? `${baseStyles.primary}15`
        : baseStyles.hover,
    },
    "&:active": { backgroundColor: `${baseStyles.primary}20` },
  }),
  multiValue: (s) => ({
    ...s,
    backgroundColor: `${baseStyles.primary}10`,
    borderRadius: "0.5rem",
    padding: "0.25rem",
  }),
  multiValueLabel: (s) => ({
    ...s,
    color: baseStyles.primary,
    fontWeight: 500,
    padding: "0.25rem 0.5rem",
  }),
  multiValueRemove: (s) => ({
    ...s,
    color: baseStyles.primary,
    ":hover": {
      backgroundColor: `${baseStyles.primary}20`,
      color: baseStyles.primary,
    },
  }),
};

const MultiColumnComparison = ({ className, children, products }: Props) => {
  const pathName = window.location.pathname;
  const { location: userLocation } = useContext(LocationContext);
  const { recommendation, setRecommendation } = useContext(
    RecommendationContext,
  );
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<ProductOption>
  >(
    products
      .map((p) => ({
        value: String(p.id),
        label: p.title,
        product: p,
        isFixed: pathName.includes(p.handle),
      }))
      .filter((o) => pathName.includes(o.product.handle)),
  );

  const productOptions = products.map((p) => ({
    value: String(p.id),
    label: p.title,
    product: p,
  }));

  useEffect(() => {
    if (!recommendation?.recommendedProductId) return;
    setSelectedOptions(
      productOptions.filter(
        (o) =>
          getShortId(recommendation.recommendedProductId) ===
          getShortId(o.product.id),
      ),
    );
  }, [recommendation]);

  const handleProductChange = async (
    newValue: MultiValue<ProductOption>,
    actionMeta: ActionMeta<ProductOption>,
  ) => {
    setSelectedOptions(newValue);
    const currentProduct = window?.currentProduct as Product;
    if (!currentProduct)
      return console.error('"currentProduct" is not defined');

    const sessionId = document.cookie
      .split("; ")
      .find((r) => r.startsWith("_shopify_s="))
      ?.split("=")[1];
    const collectionId = window?.collection as string;

    await fetch(`${process.env.APP_BACKEND_URL}/api/product/comparison/track`, {
      method: "POST",
      body: JSON.stringify({
        collectionId,
        originalProductId: currentProduct?.id,
        comparedProducts: newValue.map((o) => o.product.id),
        sessionId,
      }),
      mode: "cors",
    });
  };

  const getAllSpecKeys = () =>
    Array.from(
      new Set(
        products
          .filter((p) =>
            selectedOptions.map((o) => o.value).includes(String(p.id)),
          )
          .flatMap((p) => Object.keys(p.specs)),
      ),
    );

  return (
    <div className={`${className} space-y-6`}>
      <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200">
        <div className="flex flex-wrap gap-3 items-center w-full">
          {selectedOptions.map((option) => (
            <div
              key={option.value}
              className="group relative flex items-center bg-base-200 hover:bg-base-300 rounded-lg transition-all duration-200 min-w-[160px] h-12 px-4 pr-12 shadow-sm hover:shadow-md"
            >
              <span className="font-medium text-base-content truncate flex-1">
                {option.label}
              </span>
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm p-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-base-300/50 transition-colors duration-200 flex-shrink-0 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newOptions = selectedOptions.filter(
                    (o) => o.value !== option.value,
                  );
                  setSelectedOptions(newOptions);
                  handleProductChange(newOptions, {
                    action: "remove-value",
                    removedValue: option,
                  });
                }}
                aria-label={`Remove ${option.label} from comparison`}
              >
                <FontAwesomeIcon
                  icon={faX}
                  className="text-base-content/70 group-hover:text-base-content text-sm"
                />
              </button>
            </div>
          ))}
          <button
            className="flex items-center justify-center w-12 h-12 bg-primary hover:bg-primary-focus text-primary-content rounded-lg transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md hover:scale-105"
            onClick={() => setIsSelectOpen(true)}
            aria-label="Add product to comparison"
          >
            <FontAwesomeIcon icon={faPlus} className="text-lg" />
          </button>
        </div>
      </div>

      {isSelectOpen && (
        <div className="relative z-50 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl"
            onClick={() => setIsSelectOpen(false)}
          />
          <div className="relative">
            <Select
              isMulti
              name="products"
              options={productOptions}
              components={animatedComponents}
              classNamePrefix="select-internal"
              menuIsOpen={isSelectOpen}
              onMenuClose={() => setIsSelectOpen(false)}
              onChange={handleProductChange}
              value={selectedOptions}
              styles={selectStyles}
              placeholder="Search and select products to compare..."
              noOptionsMessage={() => "No products found"}
              loadingMessage={() => "Loading products..."}
              className="select-container"
            />
          </div>
        </div>
      )}

      {selectedOptions.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
          <div className="comparison-table">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200">
                  <th className="w-1/4 font-semibold text-base-content">
                    Specification
                  </th>
                  {selectedOptions.map(({ product }) => (
                    <th
                      key={product.id}
                      className="text-center font-semibold text-base-content"
                    >
                      {product?.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getAllSpecKeys().map((specKey) => (
                  <tr key={specKey} className="hover:bg-base-200/50">
                    <td className="font-medium">
                      {specKey === "available_regions" && userLocation
                        ? `Available in ${userLocation?.country_name || "N/A"}?`
                        : specKey.replace("_", " ")}
                    </td>
                    {selectedOptions.map(({ product }) => {
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
                              <FontAwesomeIcon
                                icon={
                                  isAvailable(userLocation, specValue)
                                    ? faCheck
                                    : faX
                                }
                                className={
                                  isAvailable(userLocation, specValue)
                                    ? "text-success"
                                    : "text-error"
                                }
                                size="2x"
                                fixedWidth
                              />
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
