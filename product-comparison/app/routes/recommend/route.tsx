import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const client = new OpenAI();
const ProductRecommendation = z.object({
  recommendedProductId: z.string(),
  recommendedProductTitle: z.string(),
  reason: z.string(),
});

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();
  const query = `
  ${body.query}

  Here is a JSON array of the products I'm interested in:
  ${JSON.stringify(body.products, null, 2)}
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
