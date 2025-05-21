import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

/**
 * Action function that tracks product comparison events
 * Records when users compare products by storing the comparison data in a database
 *
 * @param {Object} params - Action function parameters
 * @param {Request} params.request - The incoming request object containing:
 *   - collectionId: The ID of the collection containing the products
 *   - originalProductId: The ID of the main product being compared
 *   - comparedProducts: Array of product IDs being compared against
 *   - sessionId: Unique identifier for the user session
 * @returns {Promise<Response>} JSON response indicating success/failure of the operation
 */
export const action: ActionFunction = async ({ request }) => {
  try {
    const { collectionId, originalProductId, comparedProducts, sessionId } =
      await request.json();
    if (!originalProductId || !comparedProducts) {
      return json(
        { success: false, message: "Missing product IDs" },
        { status: 400 },
      );
    }
    await prisma.productComparison.create({
      data: {
        collectionId,
        originalProductId: String(originalProductId),
        comparedProducts: comparedProducts.map((id: number) => String(id)),
        sessionId,
      },
    });
    return json(
      { success: true, message: "Comparison tracked" },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("Error tracking comparison:", error);
    return json(
      { success: false, message: "Failed to track comparison" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
};
