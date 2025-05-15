import React, { useState, useEffect } from "react";
import "./App.css";
import ComparisonTable from "./ComparisonTable.tsx";
import type { LocationData } from "./product.ts";
import { getMockLocation } from "./product.ts";
import type { Recommendation } from "./RecommendationQuery/RecommendationContext.ts";
import { RecommendationContext } from "./RecommendationQuery/RecommendationContext.ts";
import RecommendationQuery from "./RecommendationQuery/RecommendationQuery.tsx";
import MultiColumnComparison from "./MultiColumnComparison.tsx";
import { LocationContext } from "./LocationContext.ts";

export function App() {
  const [recommendation, setRecommendation] = useState<Recommendation>();
  const [query, setQuery] = useState<string>();
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const tableVariant: string = window?.tableVariant || "multi-column";
  const products = window?.productMetafieldData;

  useEffect(() => {
    (async () => {
      //const location = await getLocation();
      const location = await getMockLocation();
      setUserLocation(location);
    })();
  }, []);

  if (!products) {
    return null;
  }
  return (
    <LocationContext value={{ location: userLocation }}>
      <RecommendationContext
        value={{ recommendation, setRecommendation, query, setQuery }}
      >
        <div className="product-comparison z-10">
          <h2>Product Comparison</h2>

          <RecommendationQuery products={products} />

          {tableVariant && tableVariant === "multi-column" ? (
            <MultiColumnComparison products={products} />
          ) : (
            <ComparisonTable products={products} />
          )}
        </div>
      </RecommendationContext>
    </LocationContext>
  );
}
