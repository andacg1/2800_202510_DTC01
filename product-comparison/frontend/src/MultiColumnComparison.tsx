import React, { useContext, useEffect, useState } from "react";
import type { MultiValue, StylesConfig } from "react-select";
import Select from "react-select";
import { isAvailable, type Product } from "./product.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { LocationContext } from "./LocationContext.ts";
import makeAnimated from "react-select/animated";

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

  useEffect(() => {
    console.log({ selectedOptions });
    const currentProductOption = productOptions.find((option) =>
      pathName.includes(option.product.handle),
    );
    console.log({ pathName, productOptions, currentProductOption });
  }, [pathName, productOptions, selectedOptions]);

  // Get all unique spec keys across selected products
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

  return (
    <div className={className}>
      Multi Column Comparison Table
      <Select
        isMulti
        name="products"
        options={productOptions}
        components={animatedComponents}
        className="basic-multi-select"
        classNamePrefix="select-internal"
        /* menuIsOpen={true} */
        onChange={setSelectedOptions}
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
