import React, { useContext, useEffect, useState } from "react";
import type { ActionMeta, MultiValue, StylesConfig } from "react-select";
import Select from "react-select";
import { useBestSpecs } from "./hooks/useBestSpecs";
import { useTrackComparison } from "./hooks/useTrackComparison.ts";
import { getAllSpecKeys, type Product } from "./product";
import { LocationContext } from "./LocationContext";
import makeAnimated from "react-select/animated";
import { RecommendationContext } from "./RecommendationQuery/RecommendationContext";
import SpecData from "./ui/SpecData";
import { getShortId } from "./utils";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToWindowEdges,
  restrictToFirstScrollableAncestor,
} from "@dnd-kit/modifiers";

/**
 * Props for the MultiColumnComparison component
 */
type MultiColumnComparisonProps = {
  className?: string;
  children?: React.ReactNode;
  products: Product[];
  preselectAll: boolean;
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

const SortableColumnHeader = ({
  productId,
  children,
}: {
  productId: string;
  children: React.ReactNode;
}) => {
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
      className="text-center!"
      {...attributes}
      {...listeners}
    >
      {children}
    </th>
  );
};

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

export type SpecOrderingEntry = {
  metafield_ascending_order: boolean;
  metafield_key: string;
  metafield_namespace: string;
};

export type BestSpecDefinition = {
  key: string;
  bestProduct: Product | null;
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
  products,
  preselectAll = false,
}: MultiColumnComparisonProps) => {
  const productOptions = products.map((product) => ({
    value: String(product.id),
    label: product.title,
    product: product,
    isFixed: window.location.pathname.includes(product.handle),
  }));

  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<ProductOption>
  >(
    preselectAll
      ? productOptions
      : productOptions.filter((option) =>
          window.location.pathname.includes(option.product.handle),
        ),
  );
  const { location: userLocation } = useContext(LocationContext);
  const { recommendation } = useContext(RecommendationContext);
  const allSpecKeys = getAllSpecKeys(products, selectedOptions);
  const { bestSpecs } = useBestSpecs(products, Array.from(selectedOptions));

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
  };

  useTrackComparison(
    selectedOptions.map((option) => String(option.product.id)),
  );

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

  return (
    <div className={className}>
      <Select
        isMulti
        name="products"
        options={productOptions}
        components={animatedComponents}
        className="basic-multi-select"
        classNamePrefix="select-internal"
        onChange={handleProductChange}
        value={selectedOptions}
        styles={selectStyles}
      />
      {Array.isArray(selectedOptions) &&
      selectedOptions?.length === 0 ? null : (
        <div className="overflow-x-auto">
          {selectedOptions.length > 0 && (
            <div className="comparison-table overflow-x-scroll">
              <h3>Comparison</h3>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[
                  restrictToWindowEdges,
                  restrictToFirstScrollableAncestor,
                ]}
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
                      {allSpecKeys.map((specKey) => (
                        <tr key={specKey}>
                          {specKey === "available_regions" && userLocation ? (
                            <td>{`Available in ${userLocation?.country_name || "N/A"}?`}</td>
                          ) : (
                            <td>{specKey.replace("_", " ")}</td>
                          )}
                          {selectedOptions.map((selectedProduct) => (
                            <SpecData
                              key={selectedProduct.product.id}
                              productId={String(selectedProduct.product.id)}
                              specValue={
                                selectedProduct.product.specs?.[specKey]
                              }
                              specKey={specKey}
                              userLocation={userLocation}
                              bestSpecs={bestSpecs}
                            />
                          ))}
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
