import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import SpecData from "../frontend/src/ui/SpecData";
import type { LocationData } from "../frontend/src/product";

// Sample location data for the story
const sampleLocation: LocationData = {
  ip: "192.168.1.1",
  network: "192.168.1.0/24",
  version: "IPv4",
  city: "San Francisco",
  region: "California",
  region_code: "CA",
  country: "US",
  country_name: "United States",
  country_code: "US",
  country_code_iso3: "USA",
  country_capital: "Washington DC",
  country_tld: ".us",
  continent_code: "NA",
  in_eu: false,
  postal: "94105",
  latitude: 37.7749,
  longitude: -122.4194,
  timezone: "America/Los_Angeles",
  utc_offset: "-0700",
  country_calling_code: "+1",
  currency: "USD",
  currency_name: "Dollar",
  languages: "en-US",
  country_area: 9629091,
  country_population: 327167434,
  asn: "AS12345",
  org: "Example ISP",
};

const meta = {
  title: "Product Comparison/SpecData",
  component: SpecData,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <table data-theme="light">
        <tbody>
          <tr>{Story()}</tr>
        </tbody>
      </table>
    ),
  ],
} satisfies Meta<typeof SpecData>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextValue: Story = {
  args: {
    productId: "1",
    specKey: "color",
    specValue: "Red",
  },
};

export const NumberValue: Story = {
  args: {
    productId: "2",
    specKey: "weight",
    specValue: 2.5,
  },
};

export const ArrayValue: Story = {
  args: {
    productId: "3",
    specKey: "materials",
    specValue: ["Cotton", "Polyester", "Wool"],
  },
};

export const AvailableRegion: Story = {
  args: {
    productId: "4",
    specKey: "available_regions",
    userLocation: sampleLocation,
    specValue: ["US", "CA", "EU"],
  },
};

export const UnavailableRegion: Story = {
  args: {
    productId: "5",
    specKey: "available_regions",
    userLocation: sampleLocation,
    specValue: ["JP", "AU", "UK"],
  },
};

export const EmptyValue: Story = {
  args: {
    productId: "6",
    specKey: "color",
    specValue: undefined,
  },
};
