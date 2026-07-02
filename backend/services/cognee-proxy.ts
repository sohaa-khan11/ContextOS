export const proxyToCognee = async (endpoint: string, payload: any) => {
    // const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    // const response = await fetch(`${PYTHON_SERVICE_URL}${endpoint}`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(payload)
    // });
    // return response.json();
    return {};
}

export const getCogneeStatus = async (projectId: string) => {
    // const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    // const response = await fetch(`${PYTHON_SERVICE_URL}/memory/status/${projectId}`);
    // return response.json();
    return { status: "DATASET_PROCESSING_COMPLETED" };
}
