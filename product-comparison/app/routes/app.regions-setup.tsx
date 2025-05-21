import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { authenticate } from "../shopify.server";

/**
 * Loader function for the regions setup page
 * Authenticates admin requests and initializes the page
 *
 * @param {LoaderFunctionArgs} params - Loader function arguments
 * @param {Request} params.request - The incoming request object
 * @returns {Promise<Response>} Empty JSON response after authentication
 */
export const loader: LoaderFunction = async ({ request }) => {
  await authenticate.admin(request);
  return json({});
};

/**
 * RegionsSetup component that provides UI for setting up shop regions
 * Allows initializing region data in shop metafields
 *
 * @returns {JSX.Element} The rendered regions setup page component
 */
export default function RegionsSetup() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [data, setData] = useState<{
    regionCount?: number;
    subRegionCount?: number;
  } | null>(null);

  /**
   * Sets up regions data in shop metafields
   * Makes an API call to process and store region information
   * Updates the UI state based on the operation result
   */
  const setupRegions = async () => {
    setStatus("loading");
    setMessage("");
    setData(null);

    try {
      const response = await fetch("/api/regions/setup", {
        method: "POST",
      });
      const responseData = await response.json();

      if (responseData.success) {
        setStatus("success");
        setMessage(responseData.message);
        setData(responseData.data);
      } else {
        setStatus("error");
        setMessage(responseData.message || "Failed to set up regions");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to set up regions");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Regions Setup</h1>
      <p>
        Click the button below to set up the regions data in your shop's
        metafields.
      </p>
      <button
        onClick={setupRegions}
        disabled={status === "loading"}
        style={{
          padding: "10px 20px",
          backgroundColor: status === "loading" ? "#ccc" : "#008060",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          marginBottom: "20px",
        }}
      >
        {status === "loading" ? "Setting up..." : "Set up Regions"}
      </button>

      {status !== "idle" && (
        <div
          style={{
            padding: "15px",
            borderRadius: "4px",
            backgroundColor:
              status === "error"
                ? "#fef2f2"
                : status === "success"
                  ? "#f0fdf4"
                  : "#f8fafc",
            border: `1px solid ${status === "error" ? "#fecaca" : status === "success" ? "#bbf7d0" : "#e2e8f0"}`,
            color:
              status === "error"
                ? "#dc2626"
                : status === "success"
                  ? "#16a34a"
                  : "#1e293b",
          }}
        >
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
            {status === "error"
              ? "Error"
              : status === "success"
                ? "Success"
                : "Status"}
          </p>
          <p style={{ margin: "0 0 10px 0" }}>{message}</p>

          {status === "success" && data && (
            <div style={{ marginTop: "10px" }}>
              <p style={{ margin: "5px 0" }}>
                <strong>Regions:</strong> {data.regionCount}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Sub-regions:</strong> {data.subRegionCount}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
