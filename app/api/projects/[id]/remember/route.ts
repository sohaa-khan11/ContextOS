import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // TODO: Implement remember proxy
    return NextResponse.json({ remembered: 0, skipped: 0, summary: "mock" });
}
