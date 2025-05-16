/**
 * Extracts the short product ID from a Shopify GID (Global ID) or number.
 * Removes the "gid://shopify/Product/" prefix if present.
 * 
 * @param {string | number} gid - The Shopify Global ID or numeric product ID
 * @returns {string} The short product ID as a string
 */
export const getShortId = (gid: string | number): string => {
  if (typeof gid === "number") {
    return String(gid);
  }
  return gid.replace("gid://shopify/Product/", "");
};
