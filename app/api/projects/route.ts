import { NextResponse } from 'next/server';

export async function GET() {
    // TODO: Implement GET projects
    return NextResponse.json([{ id: '1', name: 'Mock Project' }]);
}

export async function POST(request: Request) {
    // TODO: Implement POST project
    return NextResponse.json({ id: 'new-id' });
}
