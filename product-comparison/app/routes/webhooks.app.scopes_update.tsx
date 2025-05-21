import type { ActionFunctionArgs } from "@remix-run/node";
import db from "../db.server";
import { authenticate } from "../shopify.server";

/**
 * Action function that handles app scope update webhooks
 * Updates the session scope in the database when app permissions change
 *
 * @param {ActionFunctionArgs} params - Action function arguments
 * @param {Request} params.request - The incoming webhook request containing:
 *   - payload: Object containing current scopes
 *   - session: Current session data
 *   - topic: Webhook topic
 *   - shop: Shop domain
 * @returns {Promise<Response>} Empty response after processing
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  const current = payload.current as string[];
  if (session) {
    await db.session.update({
      where: {
        id: session.id,
      },
      data: {
        scope: current.toString(),
      },
    });
  }
  return new Response();
};
