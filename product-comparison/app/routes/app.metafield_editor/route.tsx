import { authenticate } from "../../shopify.server";
import ProductMetafieldManager from "./ProductMetafieldManager";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  return { admin };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  console.log({ action });
};

export default function App() {
  const actionData = useActionData<typeof action>();
  const { admin } = useLoaderData<typeof loader>();

  return <ProductMetafieldManager actionData={actionData} admin={admin} />;
}
