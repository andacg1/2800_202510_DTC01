import { useEffect, useState } from "react";
import { getMockLocation, type LocationData } from "../product.ts";

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    (async () => {
      //const location = await getLocation();
      const location = await getMockLocation();
      setUserLocation(location);
    })();
  }, []);

  return {
    userLocation,
    setUserLocation,
  };
};
