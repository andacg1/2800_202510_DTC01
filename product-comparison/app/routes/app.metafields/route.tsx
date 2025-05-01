import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";
import { SeparateValidationErrorExample } from "./MetafieldForm";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // if (url.searchParams.get("shop")) {
  //   throw redirect(`/app?${url.searchParams.toString()}`);
  // }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return <SeparateValidationErrorExample />;
}
