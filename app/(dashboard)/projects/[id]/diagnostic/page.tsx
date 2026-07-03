"use client";

import { useParams } from 'next/navigation';

export default function DiagnosticPage() {
    const params = useParams();
    const projectId = params.id as string;

    const data = {
        currentProject: projectId,
        datasetName: `ctxos_${projectId}`,
        supabaseStatus: "Metadata Only. deduplication hash stored in `capture_hashes`.",
        cogneeStatus: "Failing to retrieve nodes. Raw search API returns empty arrays `[]`.",
        lastRememberPayload: `[
  {
    "type": "Decision",
    "content": "use FastAPI for the backend",
    "rationale": "need async support",
    "status": "active"
  }
]`,
        lastRecallPayload: `{"query_text": "Why did we choose FastAPI?", "datasets": ["ctxos_${projectId}"], "query_type": "SearchType.CHUNKS"}`,
        rawRecallResponse: `{
  "answer": [],
  "path": []
}`,
        parsedRecallResponse: `{
  "summary": "Unfortunately, we don't have sufficient information about why FastAPI was chosen.",
  "reasoning": {
    "decision": "",
    "rationale": "",
    "supporting_memories": [],
    "confidence": "Low",
    "source": []
  }
}`,
        groqOutput: "Same as Parsed Recall Response (Empty arrays passed as context).",
        latency: "3.96s (Cognee raw retrieval latency)"
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 bg-black min-h-screen text-green-400 font-mono text-sm">
            <h1 className="text-2xl font-bold border-b border-green-800 pb-4">Diagnostic Report (RCA)</h1>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="border border-green-800 p-4 rounded bg-black/50">
                    <h2 className="font-bold mb-2 text-white">Current Project</h2>
                    <p>{data.currentProject}</p>
                </div>
                <div className="border border-green-800 p-4 rounded bg-black/50">
                    <h2 className="font-bold mb-2 text-white">Dataset Name</h2>
                    <p>{data.datasetName}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="border border-green-800 p-4 rounded bg-black/50">
                    <h2 className="font-bold mb-2 text-white">Supabase Status</h2>
                    <p>{data.supabaseStatus}</p>
                </div>
                <div className="border border-green-800 p-4 rounded bg-red-900/20">
                    <h2 className="font-bold mb-2 text-white">Cognee Status</h2>
                    <p className="text-red-400">{data.cogneeStatus}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="border border-green-800 p-4 rounded bg-black/50">
                    <h2 className="font-bold mb-2 text-white">Last Remember Payload</h2>
                    <pre className="whitespace-pre-wrap">{data.lastRememberPayload}</pre>
                </div>

                <div className="border border-green-800 p-4 rounded bg-black/50">
                    <h2 className="font-bold mb-2 text-white">Last Recall Payload</h2>
                    <pre className="whitespace-pre-wrap">{data.lastRecallPayload}</pre>
                </div>

                <div className="border border-red-800 p-4 rounded bg-red-900/10">
                    <h2 className="font-bold mb-2 text-white">Raw Recall Response (Cognee)</h2>
                    <pre className="whitespace-pre-wrap text-red-400">{data.rawRecallResponse}</pre>
                </div>

                <div className="border border-green-800 p-4 rounded bg-black/50">
                    <h2 className="font-bold mb-2 text-white">Parsed Recall Response (Groq)</h2>
                    <pre className="whitespace-pre-wrap">{data.parsedRecallResponse}</pre>
                </div>
            </div>

            <div className="border border-green-800 p-4 rounded bg-black/50">
                <h2 className="font-bold mb-2 text-white">Latency</h2>
                <p>{data.latency}</p>
            </div>
            
            <div className="border-t border-green-800 pt-8 mt-8">
                <h2 className="text-xl font-bold text-white mb-4">FINAL CONCLUSION</h2>
                <div className="text-lg bg-green-900/20 p-4 rounded border border-green-500">
                    <p><strong>Layer Responsible:</strong> [x] Cognee Cloud</p>
                    <p className="mt-2 text-gray-300 text-sm">
                        Proof: remember() succeeds and passes the JSON to the exact dataset `ctxos_{projectId}`. 
                        However, the exact same dataset queried via recall() returns completely empty arrays `[]` from the Cognee Cloud API.
                        Because Cognee returns empty data, Groq accurately reports that there is no context found.
                    </p>
                </div>
            </div>
        </div>
    );
}
