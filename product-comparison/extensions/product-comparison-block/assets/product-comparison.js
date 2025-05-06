"use strict";
// @ts-check
console.log("product-comparison.js was loaded!");
const getLocation = async () => {
  const ipResp = await fetch("https://ipapi.co/json/");
  return await ipResp.json();
};
const getMockLocation = async () => {
  const mockResponse = {
    ip: "8.8.8.8",
    network: "8.8.8.8/20",
    version: "IPv4",
    city: "Vancouver",
    region: "British Columbia",
    region_code: "BC",
    country: "CA",
    country_name: "Canada",
    country_code: "CA",
    country_code_iso3: "CAN",
    country_capital: "Ottawa",
    country_tld: ".ca",
    continent_code: "NA",
    in_eu: false,
    postal: "V6L",
    latitude: 49.251,
    longitude: -123.1623,
    timezone: "America/Vancouver",
    utc_offset: "-0700",
    country_calling_code: "+1",
    currency: "CAD",
    currency_name: "Dollar",
    languages: "en-CA,fr-CA,iu",
    country_area: 9984670,
    country_population: 37058856,
    asn: "AS6327",
    org: "SHAW",
  };
  return mockResponse;
};
window.addEventListener("load", async (e) => {
  const location = await getMockLocation();
  console.log({ location });
  console.log(window?.regions);
  updateAvailableStatus(location, window?.regions);
});

function updateAvailableStatus(location, regions) {
  if (!location) {
    return console.error("Failed to get location data.");
  }
  if (!regions) {
    return console.error("Failed to get country region data.");
  }
  const regionsRow = document.querySelector(".row-available_regions");
  const specNameEl = regionsRow.querySelector(".spec-name");
  const specValueEl = regionsRow.querySelector(".spec-value");
  console.log({ specValue: specValueEl, specName: specNameEl });

  if (
    specValueEl.innerText.toUpperCase() === "YES" ||
    specValueEl.innerText.toUpperCase() === "NO"
  ) {
    return;
  }

  const availableRegions = specValueEl.innerText
    .split(",")
    .map((region) => region.trim());
  console.log({ availableRegions });
  const userRegionData = regions.find(
    (data) => data["alpha-2"] === location.country,
  );
  console.log({ userRegionData });
  const isAvailableInUsersRegion = availableRegions.some(
    (region) =>
      region === userRegionData.region ||
      region === userRegionData["sub-region"],
  );
  specNameEl.innerText = `Available in ${location.country_name}?`;
  specValueEl.innerText = isAvailableInUsersRegion ? "YES" : "NO";
}
