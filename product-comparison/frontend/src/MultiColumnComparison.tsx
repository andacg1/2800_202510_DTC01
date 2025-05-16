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
import SpecData from "./SpecData.tsx";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const SortableColumnHeader: React.FC<{
  productId: string;
  children: React.ReactNode;
}> = ({ productId, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: productId });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 2 : 1,
    cursor: "grab",
    background: isDragging ? "#f0f0f0" : undefined,
  };
  return (
    <th
      ref={setNodeRef}
      style={style}
      className="text-center"
      {...attributes}
      {...listeners}
    >
      {children}
    </th>
  );
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

  // Drag and drop sensors
  const sensors = useSensors(useSensor(PointerSensor));

  // Drag and drop handler for columns
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedOptions((items) => {
        // Cast to ProductOption[] to satisfy mutable type
        const arr = [...items] as ProductOption[];
        const oldIndex = arr.findIndex((item) => item.value === active.id);
        const newIndex = arr.findIndex((item) => item.value === over.id);
        return arrayMove(arr, oldIndex, newIndex);
      });
    }
  };

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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedOptions.map((opt) => opt.value)}
                  strategy={horizontalListSortingStrategy}
                >
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Specification</th>
                        {selectedOptions.map((selectedProduct) => {
                          const product = selectedProduct.product;
                          return (
                            <SortableColumnHeader
                              key={selectedProduct.value}
                              productId={selectedProduct.value}
                            >
                              {product?.title}
                            </SortableColumnHeader>
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
                            return (
                              <SpecData
                                key={`${product.id}-${specKey}`}
                                productId={String(product.id)}
                                specKey={specKey}
                                userLocation={userLocation}
                                specValue={specValue}
                              />
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiColumnComparison;
