'use client';

import { useState } from 'react';

export default function GenkitTestPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);

    const runTest = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch('/api/genkit-job-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    industry: 'Healthcare',
                    department: 'Nursing',
                    jobRole: 'Charge Nurse',
                    description: 'An experienced RN who oversees a specific unit or shift. They manage patient flow, assign nursing staff to patients, handle immediate administrative issues, serve as a clinical resource, and ensure smooth communication between staff, physicians, and management. They maintain clinical duties while taking on leadership responsibilities',
                    subInstituteId: "3",
                }),
            });

            if (!res.ok) {
                throw new Error(`API failed with status ${res.status}`);
            }

            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600 }}>
                Genkit Competency Flow – Test Page
            </h1>

            <p style={{ marginTop: '8px', color: '#666' }}>
                This page calls the Genkit Job Role Competency flow via the Next.js API
                bridge.
            </p>

            <button
                onClick={runTest}
                disabled={loading}
                style={{
                    marginTop: '16px',
                    padding: '10px 16px',
                    backgroundColor: '#000',
                    color: '#fff',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                }}
            >
                {loading ? 'Generating…' : 'Run Genkit Flow'}
            </button>

            {error && (
                <div
                    style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#ffe5e5',
                        color: '#b00020',
                        borderRadius: '6px',
                    }}
                >
                    ❌ {error}
                </div>
            )}

            {result && (
                <pre
                    style={{
                        marginTop: '24px',
                        padding: '16px',
                        backgroundColor: '#111',
                        color: '#0f0',
                        borderRadius: '8px',
                        overflowX: 'auto',
                        fontSize: '13px',
                    }}
                >
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </div>
    );
}
