import { useEffect } from "react";
import type { Product } from "../product.ts";

export const useTrackComparison = (comparedProductIds: string[]) => {
  useEffect(() => {
    /**
     * Handles changes in product selection from the multi-select dropdown
     * Tracks the comparison event and updates the selected products state
     */
    const handleProductChange = async () => {
      const currentProductOption: Product | undefined = window?.currentProduct;
      if (!currentProductOption) {
        return console.error('"currentProductOption" is not defined');
      }
      const uniqueProductIds = comparedProductIds.filter(
        (id) => id !== String(currentProductOption.id),
      );
      if (uniqueProductIds.length === 0) {
        return;
      }
      const sessionId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("_shopify_s="))
        ?.split("=")[1];
      console.log({ sessionId });
      const collectionId = window?.collection;

      try {
        // TODO: Use GET instead and replace with navigator.sendBeacon()
        await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/api/product/comparison/track`,
          {
            method: "POST",
            body: JSON.stringify({
              collectionId,
              originalProductId: currentProductOption?.id,
              comparedProducts: uniqueProductIds,
              sessionId,
            }),
            mode: "cors",
          },
        );
      } catch (e) {
        console.error(e);
      }
    };

    handleProductChange();
  }, [comparedProductIds]);
};
