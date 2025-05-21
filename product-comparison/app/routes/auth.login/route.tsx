import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import { useState } from "react";

import { login } from "../../shopify.server";

import { loginErrorMessage } from "./error.server";

/**
 * Returns stylesheet links for the login page
 *
 * @returns {Array<{rel: string, href: string}>} Array of stylesheet link objects
 */
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/**
 * Loader function for the login page
 * Attempts to log in and returns any error messages
 *
 * @param {LoaderFunctionArgs} params - Loader function arguments
 * @param {Request} params.request - The incoming request object
 * @returns {Promise<{errors: Object, polarisTranslations: Object}>} Login errors and translations
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors, polarisTranslations };
};

/**
 * Action function that handles login form submission
 * Processes the login attempt and returns any error messages
 *
 * @param {ActionFunctionArgs} params - Action function arguments
 * @param {Request} params.request - The incoming request object
 * @returns {Promise<{errors: Object}>} Object containing any login errors
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

/**
 * Auth component that renders the login page
 * Provides a form for shop owners to log in to their Shopify store
 *
 * @returns {JSX.Element} The rendered login page component
 */
export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <PolarisAppProvider i18n={loaderData.polarisTranslations}>
      <Page>
        <Card>
          <Form method="post">
            <FormLayout>
              <Text variant="headingMd" as="h2">
                Log in
              </Text>
              <TextField
                type="text"
                name="shop"
                label="Shop domain"
                helpText="example.myshopify.com"
                value={shop}
                onChange={setShop}
                autoComplete="on"
                error={errors.shop}
              />
              <Button submit>Log in</Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}
