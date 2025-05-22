import type { MultiValue } from "react-select";
import type { ProductOption } from "./MultiColumnComparison.tsx";

/**
 * Represents a product with all its details and specifications
 */
export type Product = {
  id: number;
  title: string;
  handle: string;
  description: string;
  published_at: string;
  created_at: string;
  vendor: string;
  type: string;
  tags: string[];
  price: number;
  price_min: number;
  price_max: number;
  available: boolean;
  price_varies: boolean;
  compare_at_price: number;
  compare_at_price_min: number;
  compare_at_price_max: number;
  compare_at_price_varies: boolean;
  variants: Variant[];
  images: string[];
  featured_image: string;
  options: string[];
  media: Media[];
  requires_selling_plan: boolean;
  selling_plan_groups: any[];
  content: string;
  specs: Specs;
};

/**
 * Represents a product variant with its specific details
 */
export type Variant = {
  id: number;
  title: string;
  option1: string;
  option2: any;
  option3: any;
  sku: string;
  requires_shipping: boolean;
  taxable: boolean;
  featured_image: any;
  available: boolean;
  name: string;
  public_title: string;
  options: string[];
  price: number;
  weight: number;
  compare_at_price: number;
  inventory_management: any;
  barcode: string;
  requires_selling_plan: boolean;
  selling_plan_allocations: any[];
  quantity_rule: QuantityRule;
};

/**
 * Defines quantity rules for product variants
 */
export type QuantityRule = {
  min: number | null;
  max: number | null;
  increment: number;
};

/**
 * Represents media associated with a product
 */
export type Media = {
  alt: any;
  id: number;
  position: number;
  preview_image: PreviewImage;
  aspect_ratio: number;
  height: number;
  media_type: string;
  src: string;
  width: number;
};

/**
 * Represents preview image data for product media
 */
export type PreviewImage = {
  aspect_ratio: number;
  height: number;
  width: number;
  src: string;
};

/**
 * Contains geographical region data following ISO standards
 */
export type RegionData = {
  name: string;
  "alpha-2": string;
  "alpha-3": string;
  "country-code": string;
  "iso_3166-2": string;
  region: string;
  "sub-region": string;
  "intermediate-region": string;
  "region-code": string;
  "sub-region-code": string;
  "intermediate-region-code": string;
};

/**
 * Contains detailed location data for a user
 */
export type LocationData = {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
};

/**
 * Represents product specifications with optional available regions
 */
export type Specs = Record<string, string[] | string | number> & {
  available_regions?: string[];
};

/**
 * Fetches the user's location data from ipapi.co
 * @returns {Promise<LocationData>} Promise resolving to the user's location data
 */
export const getLocation = async (): Promise<LocationData> => {
  const ipResp = await fetch("https://ipapi.co/json/");
  return await ipResp.json();
};

/**
 * Returns mock location data for testing purposes
 * Simulates a user located in Vancouver, Canada
 * @returns {Promise<LocationData>} Promise resolving to mock location data
 */
export const getMockLocation = async (): Promise<LocationData> => {
  const mockResponse = {
    ip: "8.8.8.8",
    network: "8.8.8.8/20",
    version: "IPv4",
    city: "Vancouver",
    region: "British Columbia",
    region_code: "BC",
    country: "CA",
    country_name: "Canada",
    country_code: "CA",
    country_code_iso3: "CAN",
    country_capital: "Ottawa",
    country_tld: ".ca",
    continent_code: "NA",
    in_eu: false,
    postal: "V6L",
    latitude: 49.251,
    longitude: -123.1623,
    timezone: "America/Vancouver",
    utc_offset: "-0700",
    country_calling_code: "+1",
    currency: "CAD",
    currency_name: "Dollar",
    languages: "en-CA,fr-CA,iu",
    country_area: 9984670,
    country_population: 37058856,
    asn: "AS6327",
    org: "SHAW",
  };
  return mockResponse;
};

/**
 * Checks if a product is available in the user's region
 * Compares the user's location against the product's available regions
 *
 * @param {LocationData} locationData - The user's location data
 * @param {string[]} availableRegions - Array of regions where the product is available
 * @returns {boolean} True if the product is available in the user's region, false otherwise
 */
export function isAvailable(
  locationData: LocationData,
  availableRegions: string[],
): boolean {
  if (!availableRegions) {
    return false;
  }
  const regionData: RegionData[] | undefined = window?.regions;
  if (!regionData) {
    console.warn("Could not find regionData.");
    return false;
  }
  const userRegionData = regionData.find(
    (data) => data["alpha-2"] === locationData.country,
  );
  return availableRegions.some(
    (region) =>
      region === userRegionData?.region ||
      region === userRegionData?.["sub-region"],
  );
}

/**
 * Gets all unique specification keys across the selected products
 * @returns {string[]} Array of unique specification keys
 */
export const getAllSpecKeys = (
  products: Product[],
  selectedOptions: MultiValue<ProductOption>,
): string[] => {
  const selectedProductData = products.filter((p) =>
    selectedOptions.map((product) => product.value).includes(String(p.id)),
  );
  const allKeys = new Set<string>();

  selectedProductData.forEach((product) => {
    Object.keys(product.specs).forEach((key) => {
      allKeys.add(key);
    });
  });

  return Array.from(allKeys);
};
