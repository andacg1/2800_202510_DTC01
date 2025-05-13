import React, { useContext, useEffect, useState } from "react";
import {
  Recommendation,
  RecommendationContext,
  RecommendationQueryProps,
  RecommendationResponse,
} from "./RecommendationContext.ts";

async function mockOpenApiResponse() {
  return {
    success: true,
    outputJson: {
      recommendedProductId: "9962241655059",
      recommendedProductTitle: "Copper Light",
      reason:
        "As a level 5 kobold working in dim mines, your primary issue is inadequate illumination from your head-candle. Of all the products you listed, the 'Copper Light' is the only item that is actually designed to produce light. Snowboards, wax, sofas, and plant pots do not provide any illumination for your underground activities. The 'Copper Light' is a bedside lamp, but it’s portable and much brighter than a typical kobold candle—making it the most logical upgrade for lighting up mine tunnels. Just make sure you find a way to power it underground!",
    },
    message: {
      id: "resp_681fca9d95d4819183c0eb7d807722830abf5240ac5e06eb",
      object: "response",
      created_at: 1746913949,
      status: "completed",
      error: null,
      incomplete_details: null,
      instructions: null,
      max_output_tokens: null,
      model: "gpt-4.1-2025-04-14",
      output: [
        {
          id: "msg_681fca9f324c8191af5b99dee4988ebe0abf5240ac5e06eb",
          type: "message",
          status: "completed",
          content: [
            {
              type: "output_text",
              annotations: [],
              text: '{"recommendedProductId":"9962241655059","recommendedProductTitle":"Copper Light","reason":"As a level 5 kobold working in dim mines, your primary issue is inadequate illumination from your head-candle. Of all the products you listed, the \'Copper Light\' is the only item that is actually designed to produce light. Snowboards, wax, sofas, and plant pots do not provide any illumination for your underground activities. The \'Copper Light\' is a bedside lamp, but it’s portable and much brighter than a typical kobold candle—making it the most logical upgrade for lighting up mine tunnels. Just make sure you find a way to power it underground!"}',
            },
          ],
          role: "assistant",
        },
      ],
      parallel_tool_calls: true,
      previous_response_id: null,
      reasoning: {
        effort: null,
        summary: null,
      },
      service_tier: "default",
      store: true,
      temperature: 1,
      text: {
        format: {
          type: "json_schema",
          description: null,
          name: "recommendation",
          schema: {
            type: "object",
            properties: {
              recommendedProductId: { type: "string" },
              recommendedProductTitle: { type: "string" },
              reason: { type: "string" },
            },
            required: [
              "recommendedProductId",
              "recommendedProductTitle",
              "reason",
            ],
            additionalProperties: false,
          },
          strict: true,
        },
      },
      tool_choice: "auto",
      tools: [],
      top_p: 1,
      truncation: "disabled",
      usage: {
        input_tokens: 21795,
        input_tokens_details: { cached_tokens: 0 },
        output_tokens: 138,
        output_tokens_details: { reasoning_tokens: 0 },
        total_tokens: 21933,
      },
      user: null,
      metadata: {},
      output_text:
        '{"recommendedProductId":"9962241655059","recommendedProductTitle":"Copper Light","reason":"As a level 5 kobold working in dim mines, your primary issue is inadequate illumination from your head-candle. Of all the products you listed, the \'Copper Light\' is the only item that is actually designed to produce light. Snowboards, wax, sofas, and plant pots do not provide any illumination for your underground activities. The \'Copper Light\' is a bedside lamp, but it’s portable and much brighter than a typical kobold candle—making it the most logical upgrade for lighting up mine tunnels. Just make sure you find a way to power it underground!"}',
    },
  };
}

const RecommendationQuery = ({
  className,
  children,
  products,
}: RecommendationQueryProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { recommendation, setRecommendation } = useContext(
    RecommendationContext,
  );
  useEffect(() => {}, []);

  return (
    <div>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "end",
        }}
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const query = data.get("query");
          // TODO: define this port in the shopify CLI config, if possible
          if (!process.env.APP_BACKEND_URL) {
            return console.error("Could not find APP_BACKEND_URL");
          }
          const url = `${process.env.APP_BACKEND_URL}/recommend`;
          console.log(url);
          setIsLoading(true);

          let body: RecommendationResponse;

          const MOCK_OPENAI_REQUEST = false;
          if (MOCK_OPENAI_REQUEST) {
            body = await mockOpenApiResponse();
          } else {
            const resp = await fetch(url, {
              method: "POST",
              body: JSON.stringify({
                query,
                products,
              }),
            });
            body = await resp.json();
          }
          setIsLoading(false);
          setRecommendation(body.outputJson);
        }}
      >
        <textarea
          className="textarea w-full"
          placeholder={"Tell us about your use case"}
          name="query"
          style={{ width: "100%" }}
        />
        <button type="submit" style={{ width: "100px", marginTop: "8px" }}>
          Submit
        </button>
      </form>
      {isLoading ? "Loading..." : null}
      {recommendation?.reason ? <p>{recommendation.reason}</p> : null}
    </div>
  );
};

export default RecommendationQuery;
