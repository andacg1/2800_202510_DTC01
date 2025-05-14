import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ComparisonTable from "../frontend/src/ComparisonTable";
import { RecommendationContext } from "../frontend/src/RecommendationQuery/RecommendationContext";

// Sample product data for the story
const sampleProducts = [
  {
    id: 1,
    title: "Product A",
    handle: "product-a",
    description: "Description for Product A",
    published_at: "2023-01-01",
    created_at: "2023-01-01",
    updated_at: "2023-01-01",
    vendor: "Vendor A",
    product_type: "Type A",
    tags: ["tag1", "tag2"],
    variants: [],
    images: [],
    options: [],
    shop: "shop.myshopify.com",
    status: "active",
    price: 100,
    compare_at_price: 120,
    inventory_quantity: 10,
    inventory_management: "shopify",
    inventory_policy: "deny",
    fulfillment_service: "manual",
    requires_shipping: true,
    taxable: true,
    weight: 1,
    weight_unit: "kg",
    specs: {
      color: "Red",
      size: "Medium",
      weight: "2kg",
      available_regions: ["US", "CA", "EU"],
    },
  },
  {
    id: 2,
    title: "Product B",
    handle: "product-b",
    description: "Description for Product B",
    published_at: "2023-01-01",
    created_at: "2023-01-01",
    updated_at: "2023-01-01",
    vendor: "Vendor B",
    product_type: "Type B",
    tags: ["tag1", "tag3"],
    variants: [],
    images: [],
    options: [],
    shop: "shop.myshopify.com",
    status: "active",
    price: 150,
    compare_at_price: 180,
    inventory_quantity: 5,
    inventory_management: "shopify",
    inventory_policy: "deny",
    fulfillment_service: "manual",
    requires_shipping: true,
    taxable: true,
    weight: 2,
    weight_unit: "kg",
    specs: {
      color: "Blue",
      size: "Large",
      weight: "3kg",
      available_regions: ["US", "EU"],
    },
  },
];

const meta = {
  title: "Product Comparison/ComparisonTable",
  component: ComparisonTable,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div data-theme="light" style={{ padding: "1rem" }}>
        <RecommendationContext.Provider
          value={{
            recommendation: undefined,
            setRecommendation: () => {},
            query: undefined,
            setQuery: () => {},
          }}
        >
          <Story />
        </RecommendationContext.Provider>
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof ComparisonTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    products: [],
  },
};

export const WithTwoProducts: Story = {
  args: {
    products: sampleProducts,
  },
};

export const WithThreeProducts: Story = {
  args: {
    products: [
      ...sampleProducts,
      {
        id: 3,
        title: "Product C",
        handle: "product-c",
        description: "Description for Product C",
        published_at: "2023-01-01",
        created_at: "2023-01-01",
        updated_at: "2023-01-01",
        vendor: "Vendor C",
        product_type: "Type C",
        tags: ["tag1", "tag4"],
        variants: [],
        images: [],
        options: [],
        shop: "shop.myshopify.com",
        status: "active",
        price: 80,
        compare_at_price: 100,
        inventory_quantity: 15,
        inventory_management: "shopify",
        inventory_policy: "deny",
        fulfillment_service: "manual",
        requires_shipping: true,
        taxable: true,
        weight: 1.5,
        weight_unit: "kg",
        specs: {
          color: "Green",
          size: "Small",
          weight: "1.5kg",
          available_regions: ["US", "CA", "JP"],
        },
      },
    ],
  },
};
