import type { SpecOrderingEntry } from "./MultiColumnComparison.tsx";
import type { Product } from "./product.ts";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: Record<string, any>;
    productMetafieldData: Product[];
    tableVariant: string;
    currentProduct?: Product;
    collection?: string;
    metaobject?: SpecOrderingEntry[];
  }
}

export {};
