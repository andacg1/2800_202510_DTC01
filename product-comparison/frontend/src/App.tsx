import React, { useState, useEffect } from "react";
import "./App.css";
import ComparisonTable from "./ComparisonTable.tsx";
import type { Product } from "./product.ts";
import type { Recommendation } from "./RecommendationQuery/RecommendationContext.ts";
import { RecommendationContext } from "./RecommendationQuery/RecommendationContext.ts";
import RecommendationQuery from "./RecommendationQuery/RecommendationQuery.tsx";

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <RecommendationContext value={{ setRecommendation, recommendation }}>
      <div className="product-comparison">
        <h2>Product Comparison</h2>

        <RecommendationQuery products={products} />

        <ComparisonTable products={products} />
      </div>
    </RecommendationContext>
  );
}
