import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // TODO: Implement status proxy
    return NextResponse.json({ status: "DATASET_PROCESSING_COMPLETED" });
}
