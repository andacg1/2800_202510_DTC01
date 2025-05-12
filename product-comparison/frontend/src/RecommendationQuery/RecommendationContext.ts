import React, { createContext } from "react";
import type { Product } from "../product.ts";

export type RecommendationQueryProps = {
  className?: string;
  children?: React.ReactNode;
  products?: Product[];
};

export type Recommendation = {
  recommendedProductId: string;
  recommendedProductTitle: string;
  reason: string;
};

export type RecommendationResponse = {
  outputJson: Recommendation;
};

export type RecommendationContextType = {
  recommendation: Recommendation | undefined;
  setRecommendation: React.Dispatch<
    React.SetStateAction<Recommendation | undefined>
  >;
};

export const defaultRecommendationContext: RecommendationContextType = {
  recommendation: {
    recommendedProductId: "",
    recommendedProductTitle: "",
    reason: "",
  },
  setRecommendation: () => {},
};

export const RecommendationContext = createContext(
  defaultRecommendationContext,
);
