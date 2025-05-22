import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { Media, Specs, Variant } from "../../../frontend/src/product";

const client = new OpenAI();

/**
 * Zod schema for validating product recommendations
 */
const ProductRecommendation = z.object({
  recommendedProductId: z.string(),
  recommendedProductTitle: z.string(),
  reason: z.string(),
});

/**
 * Type definition for a product in the recommendation system
 */
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

/**
 * Type definition for the request body of the recommendation endpoint
 */
type RequestBody = {
  query: string;
  products: Product[];
};

/**
 * Builds a formatted product description string for the AI prompt
 * Includes product details like title, price, specs, etc.
 *
 * @param {Product[]} products - Array of products to format
 * @returns {string} Formatted product descriptions
 */
function buildQuery(products: Product[]) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CAD",
    }).format(price / 100);
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  let prompt = "";
  for (const product of products) {
    prompt += `* ${product.title}\n`;
    prompt += `    * ID: ${product.id}\n`;
    prompt += `    * Title: ${product.title}\n`;
    prompt += `    * Description: ${product.description}\n`;
    prompt += `    * Type: ${product.type}\n`;
    prompt += `    * Price: ${formatPrice(product.price)}\n`;
    prompt += `    * Tags: ${product.tags.join(", ")}\n`;
    prompt += `    * Options: ${product.options.join(", ")}\n`;
    prompt += `    * Created At: ${product.created_at}\n`;
    for (const [key, value] of Object.entries(product.specs)) {
      prompt += `    * ${key
        .split("_")
        .map((s) => capitalize(s))
        .join(" ")}: ${value}\n`;
    }
  }
  return prompt;
}

/**
 * Generates instructions for the AI model about how to recommend products
 *
 * @param {Product[]} products - Array of products to include in the instructions
 * @returns {string} Formatted instruction string for the AI
 */
const instructions = (products: Product[]) => `
# Identity

You are a helpful customer service agent working for an online store. You want to sell products to customers.
Customers will tell you about their current needs in life, and you will recommend products based on the user's current situation.
Carefully read the issue and think hard about a plan to improve the user's life using one of our products.


# Instructions

* Only consider products inside the products list.
* Be witty and funny with your responses.
* Explain your reasoning in detail, and relate it back to the customer's current needs.
* Maintain a professional and concise tone in all responses, and use emojis between sentences.
* End the message by explaining how much better their life will be if they buy the recommended product.

<products>
${buildQuery(products)}
</products>
`;

/**
 * Remix action function that handles product recommendation requests
 * Uses OpenAI to generate personalized product recommendations based on user query
 *
 * @param {Object} params - Action function parameters
 * @param {Request} params.request - The incoming request object
 * @returns {Promise<Response>} JSON response containing the recommendation
 */
export const action: ActionFunction = async ({ request }) => {
  const body: RequestBody = await request.json();

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "developer",
        content: instructions(body.products),
      },
      {
        role: "user",
        content: body.query,
      },
    ],
    text: {
      format: zodTextFormat(ProductRecommendation, "recommendation"),
    },
    temperature: 0.8,
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
