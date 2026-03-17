/**
 * Diagnostic route — confirms that the Next.js Node process can reach the Django backend.
 * Visit /test-api in the browser after restarting the dev server.
 * Remove this file once the connectivity is confirmed.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"

export default async function TestApiPage() {
    let result: unknown = null
    let error: string | null = null

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)

        const res = await fetch(`${API_URL}/brands/`, {
            cache: "no-store",
            signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!res.ok) {
            error = `HTTP ${res.status}: ${await res.text()}`
        } else {
            result = await res.json()
        }
    } catch (err: unknown) {
        error = err instanceof Error ? err.message : String(err)
    }

    return (
        <main style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
                🔍 API Connectivity Diagnostic
            </h1>

            <p>
                <strong>Target:</strong> <code>{API_URL}/brands/</code>
            </p>

            {error ? (
                <>
                    <p style={{ color: "crimson", marginTop: "1rem" }}>
                        ❌ <strong>FETCH FAILED</strong> — backend is not reachable.
                    </p>
                    <pre
                        style={{
                            background: "#1e1e1e",
                            color: "#f44336",
                            padding: "1rem",
                            borderRadius: "6px",
                            overflowX: "auto",
                        }}
                    >
                        {error}
                    </pre>
                    <p style={{ marginTop: "1rem" }}>
                        <strong>Next steps:</strong> Make sure the Django dev server is running on{" "}
                        <code>http://127.0.0.1:8000</code> and that CORS allows the Next.js origin.
                    </p>
                </>
            ) : (
                <>
                    <p style={{ color: "green", marginTop: "1rem" }}>
                        ✅ <strong>BACKEND REACHABLE</strong> — fetch succeeded.
                    </p>
                    <pre
                        style={{
                            background: "#1e1e1e",
                            color: "#a5d6a7",
                            padding: "1rem",
                            borderRadius: "6px",
                            overflowX: "auto",
                        }}
                    >
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </>
            )}
        </main>
    )
}
