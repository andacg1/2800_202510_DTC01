import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import RecommendationQuery from "../frontend/src/RecommendationQuery/RecommendationQuery";
import { RecommendationContext } from "../frontend/src/RecommendationQuery/RecommendationContext";

// Typing just enough to satisfy the component's requirements
interface SimpleProduct {
  id: number;
  title: string;
  handle: string;
  description: string;
  specs: Record<string, any>;
  [key: string]: any; // Allow other properties
}

// Sample product data for the story
const sampleProducts: SimpleProduct[] = [
  {
    id: 1,
    title: "Copper Light",
    handle: "copper-light",
    description: "A beautiful copper light for your home",
    published_at: "2023-01-01",
    created_at: "2023-01-01",
    vendor: "Lighting Co.",
    product_type: "Lighting",
    tags: ["light", "copper", "home"],
    variants: [],
    images: [],
    options: [],
    shop: "shop.myshopify.com",
    status: "active",
    price: 100,
    type: "Physical",
    price_min: 100,
    price_max: 100,
    available: true,
    specs: {
      color: "Copper",
      size: "Medium",
      weight: "2kg",
      available_regions: ["US", "CA", "EU"],
    },
  },
  {
    id: 2,
    title: "Snowboard Pro",
    handle: "snowboard-pro",
    description: "Professional snowboard for winter sports",
    published_at: "2023-01-01",
    created_at: "2023-01-01",
    vendor: "Snow Sports Inc.",
    product_type: "Winter Sports",
    tags: ["snow", "board", "winter"],
    variants: [],
    images: [],
    options: [],
    shop: "shop.myshopify.com",
    status: "active",
    price: 350,
    type: "Physical",
    price_min: 350,
    price_max: 350,
    available: true,
    specs: {
      color: "Black",
      size: "Large",
      weight: "5kg",
      available_regions: ["US", "CA", "EU"],
    },
  },
  {
    id: 3,
    title: "Plant Pot",
    handle: "plant-pot",
    description: "Ceramic pot for indoor plants",
    published_at: "2023-01-01",
    created_at: "2023-01-01",
    vendor: "Home & Garden",
    product_type: "Home Decor",
    tags: ["pot", "plant", "ceramic"],
    variants: [],
    images: [],
    options: [],
    shop: "shop.myshopify.com",
    status: "active",
    price: 35,
    type: "Physical",
    price_min: 35,
    price_max: 35,
    available: true,
    specs: {
      color: "White",
      size: "Small",
      weight: "1kg",
      available_regions: ["US", "EU", "JP"],
    },
  },
];

const meta = {
  title: "Product Comparison/RecommendationQuery",
  component: RecommendationQuery,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => {
      // Setup process.env for the component
      if (typeof process !== "undefined") {
        process.env = {
          ...process.env,
          APP_BACKEND_URL: "https://example.com",
        };
      }

      // Create a wrapper component with the context
      const RecommendationWrapper = () => (
        <div data-theme="light">
          <RecommendationContext.Provider
            value={{
              recommendation: undefined,
              setRecommendation: () => {},
              query: undefined,
              setQuery: () => {},
            }}
          >
            <div
              style={{
                width: "800px",
                padding: "20px",
              }}
            >
              <Story />
            </div>
          </RecommendationContext.Provider>
        </div>
      );

      return <RecommendationWrapper />;
    },
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof RecommendationQuery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    products: [],
  },
};

export const WhileWaiting: Story = {
  args: {
    products: sampleProducts,
  },
  decorators: [
    (Story) => {
      const WithRecommendation = () => (
        <RecommendationContext.Provider
          value={{
            recommendation: undefined,
            setRecommendation: () => {},
            query:
              "I am a level 5 kobold working in dark mines. My head-candle doesn't provide enough light. Which product would help me?",
            setQuery: () => {},
          }}
        >
          <Story />
        </RecommendationContext.Provider>
      );
      return <WithRecommendation />;
    },
  ],
};

export const WithRecommendation: Story = {
  args: {
    products: sampleProducts,
  },
  decorators: [
    (Story) => {
      const WithRecommendation = () => (
        <RecommendationContext.Provider
          value={{
            recommendation: {
              recommendedProductId: "gid://shopify/Product/9962241655059",
              recommendedProductTitle: "Copper Light",
              reason:
                "As a level 5 kobold working in dim mines, your primary issue is inadequate illumination from your head-candle. Of all the products you listed, the 'Copper Light' is the only item that is actually designed to produce light.",
            },
            setRecommendation: () => {},
            query:
              "I am a level 5 kobold working in dark mines. My head-candle doesn't provide enough light. Which product would help me?",
            setQuery: () => {},
          }}
        >
          <Story />
        </RecommendationContext.Provider>
      );
      return <WithRecommendation />;
    },
  ],
};
