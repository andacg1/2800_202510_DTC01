import { createContext } from "react";
import type { LocationData } from "./product.ts";

type LocationContextType = {
  location: LocationData | null;
};
const defaultLocationContext: LocationContextType = {
  location: null,
};

export const LocationContext = createContext(defaultLocationContext);
