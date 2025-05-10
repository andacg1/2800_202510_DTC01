import React, { useContext, useEffect, useState } from "react";
import {
  Recommendation,
  RecommendationContext,
  RecommendationQueryProps,
} from "./RecommendationContext.ts";

async function mockOpenApiResponse() {
  return {
    success: true,
    outputJson: {
      recommendedProductId: "gid://shopify/Product/9962241917203",
      recommendedProductTitle: "Antique Drawers",
      reason:
        "As an eccentric socialite with a flair for the dramatic and a history as colorful as your love story, the 'Antique Drawers' are the perfect choice. Their vintage charm aligns perfectly with your unique, attention-grabbing lifestyle. Whether you're stashing love letters, mementos from wild nights, or just need a conversation piece everyone asks about at your next high-society gathering, these antique drawers bring a sense of style and story that fits your persona. Plus, the mysterious \"55 GB RAM\" detail only adds to the quirkiness—perfect for someone who's always keeping people guessing!",
    },
    message: {
      id: "resp_681eb7ef17848191855ed3792615cbf00005c863e3c5e74e",
      object: "response",
      created_at: 1746843631,
      status: "completed",
      error: null,
      incomplete_details: null,
      instructions: null,
      max_output_tokens: null,
      model: "gpt-4.1-2025-04-14",
      output: [
        {
          id: "msg_681eb7ef539c8191912bd3a3f4832fd00005c863e3c5e74e",
          type: "message",
          status: "completed",
          content: [
            {
              type: "output_text",
              annotations: [],
              text: '{"recommendedProductId":"gid://shopify/Product/9962241917203","recommendedProductTitle":"Antique Drawers","reason":"As an eccentric socialite with a flair for the dramatic and a history as colorful as your love story, the \'Antique Drawers\' are the perfect choice. Their vintage charm aligns perfectly with your unique, attention-grabbing lifestyle. Whether you\'re stashing love letters, mementos from wild nights, or just need a conversation piece everyone asks about at your next high-society gathering, these antique drawers bring a sense of style and story that fits your persona. Plus, the mysterious \\"55 GB RAM\\" detail only adds to the quirkiness—perfect for someone who\'s always keeping people guessing!"}',
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
              recommendedProductId: {
                type: "string",
              },
              recommendedProductTitle: {
                type: "string",
              },
              reason: {
                type: "string",
              },
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
        input_tokens: 696,
        input_tokens_details: {
          cached_tokens: 0,
        },
        output_tokens: 151,
        output_tokens_details: {
          reasoning_tokens: 0,
        },
        total_tokens: 847,
      },
      user: null,
      metadata: {},
      output_text:
        '{"recommendedProductId":"gid://shopify/Product/9962241917203","recommendedProductTitle":"Antique Drawers","reason":"As an eccentric socialite with a flair for the dramatic and a history as colorful as your love story, the \'Antique Drawers\' are the perfect choice. Their vintage charm aligns perfectly with your unique, attention-grabbing lifestyle. Whether you\'re stashing love letters, mementos from wild nights, or just need a conversation piece everyone asks about at your next high-society gathering, these antique drawers bring a sense of style and story that fits your persona. Plus, the mysterious \\"55 GB RAM\\" detail only adds to the quirkiness—perfect for someone who\'s always keeping people guessing!"}',
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
          const url = `${process.env.APP_BACKEND_URL}/recommend`;
          console.log(url);
          if (!url) {
            return console.error("Could not find APP_BACKEND_URL");
          }
          setIsLoading(true);
          // const resp = await fetch(url, {
          //   method: "POST",
          //   body: JSON.stringify({
          //     query,
          //     products,
          //   }),
          // });
          //const body: RecommendationResponse = await resp.json();
          const body = await mockOpenApiResponse();
          setIsLoading(false);
          setRecommendation(body.outputJson);
        }}
      >
        <textarea
          className="w-full"
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
