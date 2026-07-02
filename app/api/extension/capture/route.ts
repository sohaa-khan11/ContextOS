import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // TODO: Implement extension capture
    return NextResponse.json({ remembered: 0, skipped: 0, summary: "mock" });
}
