import React, { useState } from "react";
import "./App.css";
import type { TableVariant } from "./AppBlock.tsx";
import AppBlock from "./AppBlock.tsx";
import { useUserLocation } from "./hooks/useUserLocation.ts";
import type { Recommendation } from "./RecommendationQuery/RecommendationContext.ts";
import { RecommendationContext } from "./RecommendationQuery/RecommendationContext.ts";
import RecommendationQuery from "./RecommendationQuery/RecommendationQuery.tsx";
import { LocationContext } from "./LocationContext.ts";

export function App() {
  const [recommendation, setRecommendation] = useState<Recommendation>();
  const [query, setQuery] = useState<string>();
  const tableVariant: TableVariant = (window?.tableVariant ||
    "multi-column") as TableVariant;
  const products = window?.productMetafieldData;
  const currentProduct = window?.currentProduct;
  const { userLocation } = useUserLocation();

  if (!products) {
    return <pre>Products not found.</pre>;
  }
  return (
    <LocationContext value={{ location: userLocation }}>
      <RecommendationContext
        value={{ recommendation, setRecommendation, query, setQuery }}
      >
        <div className="product-comparison z-10">
          <h2>Product Comparison</h2>
          <RecommendationQuery products={products} />
          <AppBlock
            tableVariant={tableVariant}
            products={products}
            currentProduct={currentProduct}
          />
        </div>
      </RecommendationContext>
    </LocationContext>
  );
}
