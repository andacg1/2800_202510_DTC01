import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { Media, Specs, Variant } from "../../../frontend/src/product";

const client = new OpenAI();
const ProductRecommendation = z.object({
  recommendedProductId: z.string(),
  recommendedProductTitle: z.string(),
  reason: z.string(),
});

export type Product = {
  id: number;
  title: string;
  handle: string;
  description: string;
  published_at: string;
  created_at: string;
  vendor: string;
  type: string;
  tags: string[];
  price: number;
  price_min: number;
  price_max: number;
  available: boolean;
  price_varies: boolean;
  compare_at_price: number;
  compare_at_price_min: number;
  compare_at_price_max: number;
  compare_at_price_varies: boolean;
  variants: Variant[];
  images: string[];
  featured_image: string;
  options: string[];
  media: Media[];
  requires_selling_plan: boolean;
  selling_plan_groups: any[];
  content: string;
  specs: Specs;
};

type RequestBody = {
  query: string;
  products: Product[];
};

function buildQuery(request: RequestBody) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CAD",
    }).format(price / 100);
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  let prompt = "";
  for (const product of request.products) {
    prompt += `- ${product.title}\n`;
    prompt += `    - ID: ${product.id}\n`;
    prompt += `    - Title: ${product.title}\n`;
    prompt += `    - Description: ${product.description}\n`;
    prompt += `    - Type: ${product.type}\n`;
    prompt += `    - Price: ${formatPrice(product.price)}\n`;
    prompt += `    - Tags: ${product.tags.join(", ")}\n`;
    prompt += `    - Options: ${product.options.join(", ")}\n`;
    prompt += `    - Created At: ${product.created_at}\n`;
    for (const [key, value] of Object.entries(product.specs)) {
      prompt += `    - ${key
        .split("_")
        .map((s) => capitalize(s))
        .join(" ")}: ${value}\n`;
    }
  }
  return prompt;
}

export const action: ActionFunction = async ({ request }) => {
  const body: RequestBody = await request.json();
  const query = `
  ${body.query}

  Here is a Markdown list of the products I'm interested in:
  ${buildQuery(body)}
  `;

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "system",
        content:
          "Compare the products inside the JSON array based on the user's use case.",
      },
      {
        role: "user",
        content: query,
      },
    ],
    text: {
      format: zodTextFormat(ProductRecommendation, "recommendation"),
    },
  });

  const outputJson = JSON.parse(response.output_text);
  console.log(outputJson);

  return json(
    {
      success: true,
      outputJson,
      message: response,
    },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
};
