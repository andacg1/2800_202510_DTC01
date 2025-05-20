import type { Unit } from "convert";
import { convertMany } from "convert";
import { useState } from "react";
import type {
  BestSpecDefinition,
  ProductOption,
  SpecOrderingEntry,
} from "../MultiColumnComparison.tsx";
import type { Product } from "../product.ts";
import { getAllSpecKeys } from "../product.ts";

export const useBestSpecs = (
  products: Product[],
  selectedOptions: ProductOption[],
) => {
  const [specOrdering] = useState<SpecOrderingEntry[]>(
    window?.metaobject || [],
  );
  const getBestSpecs = (specKey: string): BestSpecDefinition => {
    const firstProductWithSpec = selectedOptions.find(
      (selectedProduct) => specKey in selectedProduct.product?.specs,
    );
    if (selectedOptions.length === 0 || !firstProductWithSpec) {
      return {
        key: specKey,
        bestProduct: null,
      };
    }

    try {
      const getQuantity = (
        option: ProductOption,
        unit: Unit,
      ): number | null => {
        if (!(specKey in option.product?.specs)) {
          return null;
        }
        return convertMany(String(option.product?.specs[specKey])).to(unit);
      };

      let bestProduct = firstProductWithSpec;
      const unit = convertMany(String(bestProduct.product?.specs[specKey])).to(
        "best",
      ).unit;
      for (const selectedProduct of selectedOptions) {
        const quantity = getQuantity(selectedProduct, unit);
        const bestQuantity = getQuantity(bestProduct, unit);
        if (quantity === null || bestQuantity === null) {
          continue;
        }
        if (quantity > bestQuantity) {
          bestProduct = selectedProduct;
        }
      }

      return {
        key: specKey,
        bestProduct: bestProduct.product,
      };
    } catch (e) {
      console.error(e);
      return {
        key: specKey,
        bestProduct: null,
      };
    }
  };

  const bestSpecs: BestSpecDefinition[] = getAllSpecKeys(
    products,
    selectedOptions,
  )
    .filter((specKey) =>
      specOrdering.some((entry) => entry.metafield_key === specKey),
    )
    .map(getBestSpecs);

  return {
    bestSpecs,
  };
};
