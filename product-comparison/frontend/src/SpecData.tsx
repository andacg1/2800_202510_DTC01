import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { isAvailable, LocationData } from "./product.ts";

export type SpecValue = string | number | string[] | undefined;

type SpecDataProps = {
  className?: string;
  children?: React.ReactNode;
  productId: string;
  specKey: string;
  userLocation?: LocationData;
  specValue: SpecValue;
};

const SpecData = ({
  className,
  children,
  productId,
  specKey,
  userLocation,
  specValue,
}: SpecDataProps) => {
  useEffect(() => {}, []);

  const isAvailableField = specKey === "available_regions";

  if (isAvailableField && userLocation && Array.isArray(specValue)) {
    return (
      <td key={`${productId}-${specKey}`} className="text-center">
        {isAvailable(userLocation, specValue) ? (
          <FontAwesomeIcon
            icon={faCheck}
            color={"rgba(31,255,0,0.5)"}
            size={"2x"}
            fixedWidth
          />
        ) : (
          <FontAwesomeIcon
            icon={faX}
            color={"#b02525"}
            size={"2x"}
            fixedWidth
          />
        )}
      </td>
    );
  }
  return (
    <td
      key={`${productId}-${specKey}`}
      className="text-center"
    >
      {Array.isArray(specValue)
        ? specValue.join(", ")
        : specValue?.toString() || "N/A"}
    </td>
  );
};

export default SpecData;
