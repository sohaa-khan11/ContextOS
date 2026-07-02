import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // TODO: Implement forget proxy
    return NextResponse.json({ forgotten: true });
}
