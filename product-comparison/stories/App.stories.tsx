import type { Meta, StoryObj } from '@storybook/react';
import { App } from '../frontend/src/App';

const meta = {
  title: 'Product Comparison/App',
  component: App,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      // Mock the window global properties the component uses
      if (typeof window !== 'undefined') {
        window.productMetafieldData = [
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
              available_regions: ["US", "CA", "EU"]
            }
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
              available_regions: ["US", "EU"]
            }
          }
        ];
        window.tableVariant = "table";
      }
      
      return <Story />;
    }
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultiColumnVariant: Story = {
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        window.tableVariant = "multi-column";
      }
      return <Story />;
    }
  ]
};

export const WithThreeProducts: Story = {
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        window.productMetafieldData = [
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
              available_regions: ["US", "CA", "EU"]
            }
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
              available_regions: ["US", "EU"]
            }
          },
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
              available_regions: ["US", "CA", "JP"]
            }
          }
        ];
      }
      return <Story />;
    }
  ]
}; 