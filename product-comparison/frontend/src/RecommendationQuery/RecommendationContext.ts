import type React from "react";
import { createContext } from "react";
import type { Product } from "../product.ts";

/**
 * Props for the RecommendationQuery component
 * @typedef {Object} RecommendationQueryProps
 * @property {string} [className] - Optional CSS class name for styling
 * @property {React.ReactNode} [children] - Optional child elements
 * @property {Product[]} [products] - Array of products to generate recommendations from
 */
export type RecommendationQueryProps = {
  className?: string;
  children?: React.ReactNode;
  products?: Product[];
};

/**
 * Structure of a product recommendation
 * @typedef {Object} Recommendation
 * @property {string} recommendedProductId - ID of the recommended product
 * @property {string} recommendedProductTitle - Title of the recommended product
 * @property {string} reason - Explanation for why this product was recommended
 */
export type Recommendation = {
  recommendedProductId: string;
  recommendedProductTitle: string;
  reason: string;
};

/**
 * Response structure from the recommendation API
 * @typedef {Object} RecommendationResponse
 * @property {Recommendation} outputJson - The recommendation data
 */
export type RecommendationResponse = {
  outputJson: Recommendation;
};

/**
 * Type definition for the Recommendation context value
 * @typedef {Object} RecommendationContextType
 * @property {Recommendation | undefined} recommendation - Current recommendation or undefined
 * @property {React.Dispatch<React.SetStateAction<Recommendation | undefined>>} setRecommendation - Function to update recommendation
 * @property {string | undefined} query - Current search query
 * @property {React.Dispatch<React.SetStateAction<string | undefined>>} setQuery - Function to update search query
 */
export type RecommendationContextType = {
  recommendation: Recommendation | undefined;
  setRecommendation: React.Dispatch<
    React.SetStateAction<Recommendation | undefined>
  >;
  query: string | undefined;
  setQuery: React.Dispatch<React.SetStateAction<string | undefined>>;
};

/**
 * Default values for the Recommendation context
 */
export const defaultRecommendationContext: RecommendationContextType = {
  recommendation: {
    recommendedProductId: "",
    recommendedProductTitle: "",
    reason: "",
  },
  setRecommendation: () => {},
  query: "",
  setQuery: () => {},
};

/**
 * React context for managing product recommendations throughout the application
 * Provides access to recommendation state and query functionality
 */
export const RecommendationContext = createContext(
  defaultRecommendationContext,
);
