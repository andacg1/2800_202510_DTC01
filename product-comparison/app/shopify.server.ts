import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

/**
 * Shopify app configuration instance.
 * Initializes and configures the Shopify app with necessary settings and hooks.
 * @type {ReturnType<typeof shopifyApp>}
 */
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  hooks: {
    afterAuth: async ({ session }) => {
      await shopify.registerWebhooks({ session });
    },
  },
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
});

export default shopify;

/** Current Shopify API version being used by the app */
export const apiVersion = ApiVersion.January25;

/** Function to add Shopify-specific response headers to documents
 * @param {Request} request - The incoming request object
 * @param {Headers} headers - The headers object to modify
 */
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;

/** Authentication middleware for protected routes
 * @param {Request} request - The incoming request object
 * @returns {Promise<Response>} Authentication response
 */
export const authenticate = shopify.authenticate;

/** Middleware for routes that don't require authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<Response>} Response for unauthenticated routes
 */
export const unauthenticated = shopify.unauthenticated;

/** Function to handle Shopify login process
 * @param {Request} request - The incoming request object
 * @returns {Promise<Response>} Login response
 */
export const login = shopify.login;

/** Function to register Shopify webhooks
 * @param {Object} options - Webhook registration options
 * @returns {Promise<void>}
 */
export const registerWebhooks = shopify.registerWebhooks;

/** Session storage instance for managing Shopify sessions
 * @type {PrismaSessionStorage}
 */
export const sessionStorage = shopify.sessionStorage;
