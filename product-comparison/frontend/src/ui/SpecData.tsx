import React from "react";
import type { LocationData } from "../product";
import { isAvailable } from "../product";
import Check from "./Check";
import Times from "./Times";
import type { BestSpecDefinition } from "../MultiColumnComparison";

export type SpecValue = string | number | string[] | undefined;

type SpecDataProps = {
  className?: string;
  children?: React.ReactNode;
  productId: string;
  specValue: SpecValue;
  specKey: string;
  userLocation?: LocationData | null;
  bestSpecs?: BestSpecDefinition[];
};

const SpecData = ({
  className,
  children,
  productId,
  bestSpecs,
  specValue,
  specKey,
  userLocation,
}: SpecDataProps) => {
  const isAvailableField = specKey === "available_regions";
  const isOrderedSpec = !bestSpecs
    ? undefined
    : bestSpecs.find((bestSpec) => bestSpec.key === specKey);
  const isBestProduct =
    isOrderedSpec?.bestProduct &&
    String(isOrderedSpec.bestProduct.id) === productId;
  const tdClassName = `text-center w-min ${isBestProduct ? "bg-green-800/25" : "bg-inherit"}`;

  if (isAvailableField && userLocation && Array.isArray(specValue)) {
    return (
      <td key={`${productId}-${specKey}`} className={tdClassName}>
        <div className="flex flex-col items-center justify-center">
          {isAvailable(userLocation, specValue) ? <Check /> : <Times />}
          <div className="flex flex-col items-center justify-center">
            {specValue.map((spec) => (
              <>
                <span>{spec}</span>
                <br />
              </>
            ))}
          </div>
        </div>
      </td>
    );
  }
  return (
    <td key={`${productId}-${specKey}`} className={tdClassName}>
      <div className="flex flex-col items-center justify-center">
        {Array.isArray(specValue)
          ? specValue.join(", ")
          : specValue?.toString() || "N/A"}
      </div>
    </td>
  );
};

export default SpecData;
