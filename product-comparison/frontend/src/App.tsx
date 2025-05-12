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
  const tableVariant: string = window?.tableVariant;
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    (async () => {
      //const location = await getLocation();
      const location = await getMockLocation();
      setUserLocation(location);
    })();
  }, []);

  return (
    <LocationContext value={{ location: userLocation }}>
      <RecommendationContext value={{ setRecommendation, recommendation }}>
        <div className="product-comparison z-10">
          <h2>Product Comparison</h2>

          <RecommendationQuery products={window?.productMetafieldData} />

          {tableVariant && tableVariant === "multi-column" ? (
            <MultiColumnComparison products={window?.productMetafieldData} />
          ) : (
            <ComparisonTable products={window?.productMetafieldData} />
          )}
        </div>
      </RecommendationContext>
    </LocationContext>
  );
}
