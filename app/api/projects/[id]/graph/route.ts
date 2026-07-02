import { NextResponse } from 'next/server';
import { config } from '@/backend/utils/config';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    try {
        const pythonUrl = config.pythonService.url();
        const response = await fetch(`${pythonUrl}/memory/graph/${id}`);

        if (!response.ok) {
            return NextResponse.json({ error: 'Python service error' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json(
            { error: 'Internal Server Error', message: e.message || String(e) },
            { status: 500 }
        );
    }
}
