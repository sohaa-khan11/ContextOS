import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // TODO: Implement extension auth
    return NextResponse.json({ session_token: 'mock-token', expires_at: new Date().toISOString() });
}
