import { NextResponse } from 'next/server';
import { config } from '@/backend/utils/config';
import { validateExtensionToken } from '@/backend/middleware/auth';

export async function POST(request: Request) {
    try {
        const user = await validateExtensionToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const body = await request.json();
        
        if (!body.project_id || !body.text) {
            return NextResponse.json({ error: 'Missing project_id or text' }, { status: 400 });
        }
        
        const pythonUrl = config.pythonService.url();
        const response = await fetch(`${pythonUrl}/memory/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                project_id: body.project_id,
                raw_text: body.text
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
