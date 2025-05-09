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

window.addEventListener("load", (event) => {
  const dropdownEl = document.getElementById("active-comparison");
  dropdownEl.addEventListener("change", (e) => {
    console.log({ newValue: e.target.value });
    const handle = e.target.value;
    const tableEl = document.getElementById("comparison-dropdown-table");
    const elementsToHide = tableEl.querySelectorAll(
      `td:not([data-handle='${handle}']),th:not([data-handle='${handle}'])`,
    );
    const elementsToShow = tableEl.querySelectorAll(
      `td[data-handle='${handle}'],th[data-handle='${handle}']`,
    );

    for (const element of elementsToShow) {
      element.classList.remove("hide");
    }

    for (const element of elementsToHide) {
      const isFirstColumn = !element.dataset.handle;
      if (isFirstColumn) {
        continue;
      }
      element.classList.add("hide");
    }
  });
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
  const specValueEls = regionsRow.querySelectorAll(".spec-value");
  console.log({ specValue: specValueEls, specName: specNameEl });

  for (const specValueEl of specValueEls) {
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
}
