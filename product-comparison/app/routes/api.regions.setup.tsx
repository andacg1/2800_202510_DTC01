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
    region: string | null;
    "sub-region": string | null;
    "intermediate-region": string | null;
    "region-code": string | null;
    "sub-region-code": string | null;
    "intermediate-region-code": string | null;
}

export const action: ActionFunction = async ({ request }) => {
    await authenticate.admin(request);
    try {

        const regionsPath = path.join(process.cwd(), 'extensions', 'product-comparison-block', 'snippets', 'regions.liquid');
        const regionsContent = fs.readFileSync(regionsPath, 'utf-8');
        const regionsMatch = regionsContent.match(/window\.regions = (\[[\s\S]*?\]);/);

        if (!regionsMatch) {
            throw new Error('Could not find regions data in the liquid file');
        }

        const regions: Country[] = JSON.parse(regionsMatch[1]);


        const uniqueRegions = new Set<string>();
        const uniqueSubRegions = new Set<string>();

        regions.forEach(country => {
            if (country.region) uniqueRegions.add(country.region);
            if (country["sub-region"]) uniqueSubRegions.add(country["sub-region"]);
        });


        const allRegions = [...uniqueRegions, ...uniqueSubRegions];


        const response = await fetch(`/admin/api/2024-01/metafields.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                metafield: {
                    namespace: "product_comparison",
                    key: "regions",
                    value: JSON.stringify(allRegions),
                    type: "json",
                    owner_resource: "shop"
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to create metafield: ${response.statusText}`);
        }

        return json({ success: true, message: "Regions data stored in metafields" });
    } catch (error) {
        console.error("Error setting up regions:", error);
        return json({ success: false, message: "Failed to set up regions" }, { status: 500 });
    }
}; 