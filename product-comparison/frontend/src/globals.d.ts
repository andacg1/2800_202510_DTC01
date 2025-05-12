declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: Record<string, any>;
    productMetafieldData: Product[];
    tableVariant?: string;
  }
}
