"use strict";
//@ts-check
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
});
