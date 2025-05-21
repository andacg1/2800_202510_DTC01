import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { boundary } from "@shopify/shopify-app-remix/server";

import { authenticate } from "../shopify.server";

/**
 * Links array for stylesheet imports
 * @returns {Array<{rel: string, href: string}>} Array of link objects
 */
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/**
 * Loader function for the app route
 * Authenticates admin requests and provides the Shopify API key
 *
 * @param {LoaderFunctionArgs} args - Loader function arguments
 * @param {Request} args.request - The incoming request object
 * @returns {Promise<{apiKey: string}>} Object containing the Shopify API key
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

/**
 * Main app component that provides the app layout and navigation
 * Wraps the app content in Shopify's AppProvider and includes navigation menu
 *
 * @returns {JSX.Element} The rendered app component
 */
export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
        <Link to="/app/metafield_editor">Product Specs</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

/**
 * Error boundary component for handling route errors
 * Uses Shopify's boundary helper to properly handle errors in the admin context
 *
 * @returns {JSX.Element} The rendered error boundary
 */
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

/**
 * Headers function for the app route
 * Uses Shopify's boundary helper to add necessary headers for admin requests
 *
 * @param {Object} headersArgs - Headers function arguments
 * @returns {Headers} Headers object with Shopify-specific headers
 */
export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
