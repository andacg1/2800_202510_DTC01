import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const action: ActionFunction = async ({ request }) => {
    await authenticate.admin(request);
    try {
        const { productAId, productBId, userId, shop } = await request.json();
        if (!productAId || !productBId) {
            return json({ success: false, message: "Missing product IDs" }, { status: 400 });
        }
        await prisma.productComparison.create({
            data: {
                productAId,
                productBId,
                userId,
                shop,
            },
        });
        return json({ success: true, message: "Comparison tracked" });
    } catch (error) {
        console.error("Error tracking comparison:", error);
        return json({ success: false, message: "Failed to track comparison" }, { status: 500 });
    }
}; 