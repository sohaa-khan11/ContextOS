import { NextResponse, NextRequest } from 'next/server';
import { config } from '@/backend/utils/config';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    try {
        const pythonUrl = config.pythonService.url();
        const response = await fetch(`${pythonUrl}/memory/diagnostic`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ project_id: id })
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Python diagnostic failed' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
