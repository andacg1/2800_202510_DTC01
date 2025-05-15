declare module "*.css";
declare global {
    interface Window {
      gtag: (...args: any[]) => void;
      dataLayer: Record<string, any>;
      productMetafieldData: Product[];
      tableVariant?: string;
      currentProduct?: Product;
      collection?: string;
    }
  }
  