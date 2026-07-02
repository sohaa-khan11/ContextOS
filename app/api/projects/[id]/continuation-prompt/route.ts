import { NextResponse } from 'next/server';
import { config } from '@/backend/utils/config';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    try {
        const body = await request.json().catch(() => ({}));
        
        const pythonUrl = config.pythonService.url();
        const response = await fetch(`${pythonUrl}/memory/continuation-prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                project_id: id,
                since_source: body.since_source
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: 'Python service error', details: errorData },
                { status: response.status }
            );
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
