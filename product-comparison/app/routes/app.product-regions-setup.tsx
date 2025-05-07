import { useState } from "react";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";


export const loader: LoaderFunction = async ({ request }) => {
    await authenticate.admin(request);
    return json({ shop: process.env.SHOPIFY_SHOP });
};

export default function ProductRegionsSetupPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [details, setDetails] = useState<string | null>(null);

    const setupProductRegions = async () => {
        setStatus('loading');
        setMessage('');
        setDetails(null);

        try {
            const response = await fetch('/api/product-regions/setup', {
                method: 'POST',
            });
            const responseData = await response.json();

            if (response.ok && responseData.success) {
                setStatus('success');
                setMessage(responseData.message);
            } else {
                setStatus('error');
                setMessage(responseData.message || "Failed to set up product regions. Check server logs for details.");
                if (responseData.error) {
                    setDetails(responseData.error.toString());
                }
            }
        } catch (error) {
            setStatus('error');
            setMessage('An unexpected error occurred. Check browser console and server logs.');
            if (error instanceof Error) {
                setDetails(error.message);
            }
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif' }}>
            <h1>Setup Product Available Regions</h1>
            <p>
                Click the button below to randomly assign a set of available regions/sub-regions
                (from the master list in <code>regions.liquid</code>) to the
                <code>product_specs.available_regions</code> metafield for all products in your store.
            </p>
            <p>
                <strong>Important:</strong> This is a one-time setup action for development or testing.
                It will iterate through all products and update their metafields. This might take some time for stores with many products.
            </p>

            <button
                onClick={setupProductRegions}
                disabled={status === 'loading'}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: status === 'loading' ? '#d1d5db' : '#1f2937',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    marginBottom: '20px',
                    transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                    if (status !== 'loading') {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#374151';
                    }
                }}
                onMouseOut={(e) => {
                    if (status !== 'loading') {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#1f2937';
                    }
                }}
            >
                {status === 'loading' ? 'Processing Products...' : 'Set Product Available Regions'}
            </button>

            {status !== 'idle' && (
                <div style={{
                    padding: '15px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: status === 'error' ? '#fca5a5' : (status === 'success' ? '#6ee7b7' : '#e5e7eb'),
                    backgroundColor: status === 'error' ? '#fef2f2' : (status === 'success' ? '#f0fdf4' : '#f9fafb'),
                    color: status === 'error' ? '#b91c1c' : (status === 'success' ? '#065f46' : '#374151'),
                }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: '600', fontSize: '1.1em' }}>
                        {status === 'error' ? 'Error' : status === 'success' ? 'Success' : 'Status'}
                    </p>
                    <p style={{ margin: 0 }}>{message}</p>
                    {details && (
                        <pre style={{
                            marginTop: '10px',
                            padding: '10px',
                            backgroundColor: status === 'error' ? '#fee2e2' : '#f3f4f6',
                            borderRadius: '4px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            fontSize: '0.9em'
                        }}>
                            {details}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}