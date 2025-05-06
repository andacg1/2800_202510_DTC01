import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { useEffect, useState } from "react";

export const loader: LoaderFunction = async ({ request }) => {
    await authenticate.admin(request);
    return json({});
};

export default function RegionsSetup() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const setupRegions = async () => {
        setStatus('loading');
        try {
            const response = await fetch('/api/regions/setup', {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setMessage(data.message);
            } else {
                setStatus('error');
                setMessage(data.message);
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to set up regions');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Regions Setup</h1>
            <p>Click the button below to set up the regions data in your shop's metafields.</p>
            <button
                onClick={setupRegions}
                disabled={status === 'loading'}
                style={{
                    padding: '10px 20px',
                    backgroundColor: status === 'loading' ? '#ccc' : '#008060',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                }}
            >
                {status === 'loading' ? 'Setting up...' : 'Set up Regions'}
            </button>
            {status !== 'idle' && (
                <p style={{
                    marginTop: '20px',
                    color: status === 'error' ? '#d82c0d' : status === 'success' ? '#008060' : 'inherit'
                }}>
                    {message}
                </p>
            )}
        </div>
    );
} 