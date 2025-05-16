import { createContext } from "react";
import type { LocationData } from "./product.ts";

/**
 * Type definition for the Location context value
 * @typedef {Object} LocationContextType
 * @property {LocationData | null} location - The current location data or null if not available
 */
type LocationContextType = {
  location: LocationData | null;
};

/**
 * Default value for the Location context
 */
const defaultLocationContext: LocationContextType = {
  location: null,
};

/**
 * React context for managing and sharing location data throughout the application
 * Provides access to the user's location information to child components
 */
export const LocationContext = createContext(defaultLocationContext);
