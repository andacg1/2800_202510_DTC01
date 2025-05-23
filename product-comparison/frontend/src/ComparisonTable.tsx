import React, { useContext, useEffect, useState } from "react";
import { useBestSpecs } from "./hooks/useBestSpecs.ts";
import { useTrackComparison } from "./hooks/useTrackComparison.ts";
import { useUserLocation } from "./hooks/useUserLocation.ts";
import { type Product } from "./product.ts";
import { RecommendationContext } from "./RecommendationQuery/RecommendationContext.ts";
import SpecData from "./ui/SpecData.tsx";
import { getShortId } from "./utils.ts";

type ComparisonTableProps = {
  className?: string;
  children?: React.ReactNode;
  products: Product[];
};

/**
 * A component that renders a table comparing selected products and their specifications.
 * Allows users to select up to two products for comparison and displays their specifications side by side.
 *
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes to apply to the component
 * @param {React.ReactNode} [props.children] - Child elements
 * @param {Product[]} props.products - Array of products available for comparison
 * @returns {JSX.Element} The rendered comparison table component
 */
const ComparisonTable = ({ className, products }: ComparisonTableProps) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const { recommendation } = useContext(RecommendationContext);
  const { userLocation } = useUserLocation();
  const { bestSpecs } = useBestSpecs(
    products,
    selectedProducts.map((id) => {
      const product = products.find((product) => product.id === id) as Product;
      return {
        product,
        label: product?.title || String(id),
        value: String(id),
      };
    }),
  );
  useTrackComparison(selectedProducts.map((id) => String(id)));

  /**
   * Toggles the selection state of a product in the comparison table.
   * Maintains a maximum of 2 products selected at any time.
   *
   * @param {number} productId - The ID of the product to toggle
   */
  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        // Limit to comparing 2 products maximum
        if (prev.length < 2) {
          return [...prev, productId];
        }
        return [prev[1], productId]; // Replace oldest selection
      }
    });
  };

  /**
   * Retrieves all unique specification keys across the currently selected products.
   *
   * @returns {string[]} Array of unique specification keys
   */
  const getAllSpecKeys = () => {
    const selectedProductData = products.filter((p) =>
      selectedProducts.includes(p.id),
    );
    const allKeys = new Set<string>();

    selectedProductData.forEach((product) => {
      Object.keys(product.specs).forEach((key) => {
        allKeys.add(key);
      });
    });

    return Array.from(allKeys);
  };

  useEffect(() => {
    if (!recommendation?.recommendedProductId) {
      console.log("No product ID", recommendation);
      return;
    }
    const productId = getShortId(recommendation.recommendedProductId);
    setSelectedProducts([Number(productId)]);
  }, [recommendation]);

  return (
    <div className={className}>
      <div className="product-selection">
        <h3>Select Products to Compare (max 2)</h3>
        <div className="products-grid">
          {products.map((product) => (
            <div
              key={product.id}
              className={`product-card ${selectedProducts.includes(product.id) ? "selected" : ""}`}
              onClick={() => toggleProductSelection(product.id)}
            >
              <h4>{product.title}</h4>
              <div className="select-indicator">
                {selectedProducts.includes(product.id) ? "✓" : "+"}
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedProducts.length > 0 && (
        <div className="comparison-table">
          <h3>Comparison</h3>
          <table>
            <thead>
              <tr>
                <th>Specification</th>
                {selectedProducts.map((productId) => {
                  const product = products.find((p) => p.id === productId);
                  return <th key={productId}>{product?.title}</th>;
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
                  {selectedProducts.map((productId) => {
                    const product = products.find((p) => p.id === productId);
                    const specValue = product?.specs?.[specKey];
                    return (
                      <SpecData
                        key={productId}
                        productId={String(productId)}
                        specValue={specValue}
                        specKey={specKey}
                        userLocation={userLocation}
                        bestSpecs={bestSpecs}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;
