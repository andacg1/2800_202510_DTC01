import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import {
  getMockLocation,
  isAvailable,
  type LocationData,
  type Product,
} from "./product.ts";
import { RecommendationContext } from "./RecommendationQuery/RecommendationContext.ts";

type ComparisonTableProps = {
  className?: string;
  children?: React.ReactNode;
  products: Product[];
};

const ComparisonTable = ({
  className,
  children,
  products,
}: ComparisonTableProps) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const [userLocation, setUserLocation] = useState<LocationData>();

  const { recommendation, setRecommendation } = useContext(
    RecommendationContext,
  );

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

  const ensureProductSelection = (productId: number) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return [...prev];
      } else {
        // Limit to comparing 2 products maximum
        if (prev.length < 2) {
          return [...prev, productId];
        }
        return [prev[1], productId]; // Replace oldest selection
      }
    });
  };

  // Get all unique spec keys across selected products
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
    (async () => {
      //const location = await getLocation();
      const location = await getMockLocation();
      setUserLocation(location);
    })();
  }, []);

  useEffect(() => {
    if (!recommendation?.recommendedProductId) {
      return;
    }
    const shortId = recommendation.recommendedProductId.slice(22);
    setSelectedProducts([Number(shortId)]);
    // ensureProductSelection(Number(shortId));
  }, [recommendation]);

  // Track comparison when two products are selected
  useEffect(() => {
    const trackComparison = async () => {
      // This would normally send data to your Shopify app backend
      if (selectedProducts.length === 2) {
        try {
          console.log(
            `Tracking comparison between ${selectedProducts[0]} and ${selectedProducts[1]}`,
          );
          // In a real implementation, you would call your API endpoint
          // await fetch('/api.product.comparison.track', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     productAId: selectedProducts[0],
          //     productBId: selectedProducts[1],
          //     userId: 'anonymous',
          //     shop: window.location.hostname
          //   })
          // });
        } catch (err) {
          console.error("Failed to track comparison", err);
        }
      }
    };

    if (selectedProducts.length === 2) {
      trackComparison();
    }
  }, [selectedProducts]);

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
                    const specValue = product?.specs[specKey];
                    const isAvailableField = specKey === "available_regions";
                    if (
                      isAvailableField &&
                      userLocation &&
                      Array.isArray(specValue)
                    ) {
                      return (
                        <td
                          key={`${productId}-${specKey}`}
                          className="text-center"
                        >
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
                        </td>
                      );
                    }
                    return (
                      <td
                        key={`${productId}-${specKey}`}
                        className="text-center"
                      >
                        {Array.isArray(specValue)
                          ? specValue.join(", ")
                          : specValue?.toString() || "N/A"}
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
  );
};

export default ComparisonTable;
