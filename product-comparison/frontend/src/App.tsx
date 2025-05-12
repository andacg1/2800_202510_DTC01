import React, { useState, useEffect } from "react";
import "./App.css";
import ComparisonTable from "./ComparisonTable.tsx";
import { getMockLocation, LocationData, Product } from "./product.ts";
import type { Recommendation } from "./RecommendationQuery/RecommendationContext.ts";
import { RecommendationContext } from "./RecommendationQuery/RecommendationContext.ts";
import RecommendationQuery from "./RecommendationQuery/RecommendationQuery.tsx";
import MultiColumnComparison from "./MultiColumnComparison.tsx";
import { LocationContext } from "./LocationContext.ts";

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tableVariant: string = window?.tableVariant;
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    (async () => {
      //const location = await getLocation();
      const location = await getMockLocation();
      setUserLocation(location);
    })();
  }, []);

  // This function would normally fetch from your Shopify store
  // In this basic implementation, we're mocking product data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Mock data - in reality this would be an API call
        const products: Product[] = window.productMetafieldData;

        console.log({ reactProductData: products });
        setProducts(products);
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <LocationContext value={{ location: userLocation }}>
      <RecommendationContext value={{ setRecommendation, recommendation }}>
        <div className="product-comparison">
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
