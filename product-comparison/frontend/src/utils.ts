export const getShortId = (gid: string | number): string => {
  if (typeof gid === "number") {
    return String(gid);
  }
  return gid.replace("gid://shopify/Product/", "");
};
