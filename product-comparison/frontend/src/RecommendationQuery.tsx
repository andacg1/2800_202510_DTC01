import React, { useEffect, useState } from "react";
import type { Product } from "./product.ts";

type RecommendationQueryProps = {
  className?: string;
  children?: React.ReactNode;
  products?: Product[];
};

type Recommendation = {
  recommendedProductId: string;
  recommendedProductTitle: string;
  reason: string;
};

type RecommendationResponse = {
  outputJson: Recommendation;
};

const RecommendationQuery = ({
  className,
  children,
  products,
}: RecommendationQueryProps) => {
  const [response, setResponse] = useState<Recommendation>();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {}, []);
  // I'm a retired snowboarded who just lost everything after my 7th divorce. What kind of gear should I buy?

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
          const resp = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
              query,
              products,
            }),
          });
          const body: RecommendationResponse = await resp.json();
          setIsLoading(false);
          setResponse(body.outputJson);
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
      {response?.reason ? <p>{response.reason}</p> : null}
    </div>
  );
};

export default RecommendationQuery;
