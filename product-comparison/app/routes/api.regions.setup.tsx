import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import fs from "fs";
import path from "path";

interface Country {
  name: string;
  "alpha-2": string;
  "alpha-3": string;
  "country-code": string;
  "iso_3166-2": string;
  region: string;
  "sub-region": string;
  "intermediate-region": string;
  "region-code": string;
  "sub-region-code": string;
  "intermediate-region-code": string;
}

interface RegionData {
  regions: string[];
  subRegions: string[];
}

/**
 * Action function that sets up region data for the Shopify store
 * Reads region data from a liquid template file and stores it as shop metafields
 * Processes regions and sub-regions from country data and creates a consolidated list
 *
 * @param {Object} params - Action function parameters
 * @param {Request} params.request - The incoming request object
 * @returns {Promise<Response>} JSON response containing success status and region counts
 * @throws {Error} If regions data file is not found or contains invalid data
 */
export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  try {
    // Fetch regions data directly from GitHub
    const response = await fetch(
      "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/refs/heads/master/all/all.json",
    );
    if (!response.ok) {
      throw new Error("Failed to fetch regions data from GitHub");
    }

    const regions: Country[] = await response.json();

    if (!Array.isArray(regions) || regions.length === 0) {
      throw new Error("Regions data must be a non-empty array");
    }

    const uniqueRegions = new Set<string>();
    const uniqueSubRegions = new Set<string>();

    regions.forEach((country) => {
      if (country.region) uniqueRegions.add(country.region);
      if (country["sub-region"]) uniqueSubRegions.add(country["sub-region"]);
    });

    const regionData: RegionData = {
      regions: Array.from(uniqueRegions),
      subRegions: Array.from(uniqueSubRegions),
    };

    const shopQuery = await admin.graphql(`
            query {
                shop {
                    id
                }
            }
        `);

    const shopData = await shopQuery.json();
    const shopId = shopData.data.shop.id;

    const responseGraphql = await admin.graphql(
      `
            mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
                metafieldsSet(metafields: $metafields) {
                    metafields {
                        id
                        namespace
                        key
                        value
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `,
      {
        variables: {
          metafields: [
            {
              namespace: "product_comparison",
              key: "regions",
              value: JSON.stringify(regionData),
              type: "json",
              ownerId: shopId,
            },
          ],
        },
      },
    );

    const responseJson = await responseGraphql.json();

    if (responseJson.data?.metafieldsSet?.userErrors?.length > 0) {
      throw new Error(
        `Failed to create metafield: ${responseJson.data.metafieldsSet.userErrors[0].message}`,
      );
    }

    return json({
      success: true,
      message: "Regions data stored in metafields",
      data: {
        regionCount: uniqueRegions.size,
        subRegionCount: uniqueSubRegions.size,
      },
    });
  } catch (error) {
    console.error("Error setting up regions:", error);
    return json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to set up regions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
