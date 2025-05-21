import type { ActionFunctionArgs } from "@remix-run/node";
import db from "../db.server";
import { authenticate } from "../shopify.server";

/**
 * Action function that handles app uninstallation webhooks
 * Cleans up session data when the app is uninstalled from a shop
 * Can be triggered multiple times, so checks if session exists before deletion
 *
 * @param {ActionFunctionArgs} params - Action function arguments
 * @param {Request} params.request - The incoming webhook request containing:
 *   - shop: Shop domain
 *   - session: Current session data (if exists)
 *   - topic: Webhook topic
 * @returns {Promise<Response>} Empty response after cleanup
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response();
};
