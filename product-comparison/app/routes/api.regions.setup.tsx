import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import fs from 'fs';
import path from 'path';

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

export const action: ActionFunction = async ({ request }) => {
    await authenticate.admin(request);
    try {
        const regionsPath = path.join(process.cwd(), 'extensions', 'product-comparison-block', 'snippets', 'regions.liquid');

        if (!fs.existsSync(regionsPath)) {
            throw new Error('Regions data file not found');
        }

        const regionsContent = fs.readFileSync(regionsPath, 'utf-8');
        const regionsMatch = regionsContent.match(/window\.regions = (\[[\s\S]*?\]);/);

        if (!regionsMatch) {
            throw new Error('Could not find regions data in the liquid file');
        }

        let regions: Country[];
        try {
            regions = JSON.parse(regionsMatch[1]);
        } catch (error) {
            throw new Error('Invalid JSON format in regions data');
        }

        // Validate region data structure
        if (!Array.isArray(regions) || regions.length === 0) {
            throw new Error('Regions data must be a non-empty array');
        }

        const uniqueRegions = new Set<string>();
        const uniqueSubRegions = new Set<string>();

        regions.forEach(country => {
            if (country.region) uniqueRegions.add(country.region);
            if (country["sub-region"]) uniqueSubRegions.add(country["sub-region"]);
        });

        const regionData: RegionData = {
            regions: Array.from(uniqueRegions),
            subRegions: Array.from(uniqueSubRegions)
        };

        const response = await fetch(`/admin/api/2024-01/metafields.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                metafield: {
                    namespace: "product_comparison",
                    key: "regions",
                    value: JSON.stringify(regionData),
                    type: "json",
                    owner_resource: "shop"
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`Failed to create metafield: ${errorData?.message || response.statusText}`);
        }

        return json({
            success: true,
            message: "Regions data stored in metafields",
            data: {
                regionCount: uniqueRegions.size,
                subRegionCount: uniqueSubRegions.size
            }
        });
    } catch (error) {
        console.error("Error setting up regions:", error);
        return json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to set up regions",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}; 