import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import prisma from "../db.server";

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
