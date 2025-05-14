import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import MultiColumnComparison from "../frontend/src/MultiColumnComparison";

// Define a minimal type that satisfies the component's requirements
interface ProductLike {
  id: number;
  title: string;
  handle: string;
  specs: Record<string, any>;
  [key: string]: any; // To allow for additional properties
}

// Sample product data for the story
const sampleProducts: ProductLike[] = [
  {
    id: 1,
    title: "Product A",
    handle: "product-a",
    description: "Description for Product A",
    published_at: "2023-01-01",
    created_at: "2023-01-01",
    type: "Type A",
    vendor: "Vendor A",
    tags: ["tag1", "tag2"],
    variants: [],
    images: [],
    options: [],
    shop: "shop.myshopify.com",
    status: "active",
    price: 100,
    price_min: 100,
    price_max: 100,
    available: true,
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
    type: "Type B",
    vendor: "Vendor B",
    tags: ["tag1", "tag3"],
    variants: [],
    images: [],
    options: [],
    shop: "shop.myshopify.com",
    status: "active",
    price: 150,
    price_min: 150,
    price_max: 150,
    available: true,
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

// Mock component that wraps our actual component with the needed props
// This avoids the context issues
const MockMultiColumnComparison = (props: any) => {
  // In a real component, we would use the context values
  // But for Storybook, we'll just render the component with mock props
  return (
    <div style={{ padding: "20px" }}>
      <MultiColumnComparison {...props} />
    </div>
  );
};

const meta = {
  title: "Product Comparison/MultiColumnComparison",
  component: MockMultiColumnComparison,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return (
        <div data-theme="light">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof MockMultiColumnComparison>;

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
  decorators: [
    (Story) => {
      // Set the pathname for testing
      // if (typeof window !== 'undefined') {
      //   Object.defineProperty(window, 'location', {
      //     value: { pathname: '/products/product-a' },
      //     writable: true
      //   });
      // }
      return (
        <div data-theme="light">
          <Story />
        </div>
      );
    },
  ],
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
        type: "Type C",
        vendor: "Vendor C",
        tags: ["tag1", "tag4"],
        variants: [],
        images: [],
        options: [],
        shop: "shop.myshopify.com",
        status: "active",
        price: 80,
        price_min: 80,
        price_max: 80,
        available: true,
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
