import React, { useEffect } from "react";
import ComparisonTable from "./ComparisonTable.tsx";
import MultiColumnComparison from "./MultiColumnComparison.tsx";
import PredefinedComparison from "./PredefinedComparison.tsx";
import type { Product } from "./product.ts";

export type TableVariant = "multi-column" | "two-column" | "predefined";
type AppBlockProps = {
  className?: string;
  children?: React.ReactNode;
  tableVariant: TableVariant;
  products: Product[];
  currentProduct: Product | undefined;
};

const AppBlock = ({
  className,
  children,
  tableVariant,
  products,
  currentProduct,
}: AppBlockProps) => {
  useEffect(() => {}, []);

  if (tableVariant === "multi-column") {
    return <MultiColumnComparison products={products} preselectAll={false} />;
  } else if (tableVariant === "two-column") {
    return <ComparisonTable products={products} />;
  } else if (tableVariant === "predefined") {
    return (
      <PredefinedComparison
        products={products}
        currentProduct={currentProduct}
      />
    );
  } else {
    return (
      <div>
        <pre>
          Could not find table variant. Make sure it's selected in the app block
          settings.
        </pre>
      </div>
    );
  }
};

export default AppBlock;
