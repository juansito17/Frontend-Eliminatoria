import { NextRequest, NextResponse } from 'next/server';

const RAW_BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';
const BACKEND_URL = RAW_BACKEND.replace(/\/+$/,'').replace(/\/api\/?$/i,'');

// PUT /api/lotes/:id/supervisor
export async function PUT(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const parts = pathname.split('/');
    // .../lotes/[id]/supervisor
    const id = parts[parts.length - 2];

    const authHeader = request.headers.get('Authorization');
    const body = await request.json();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/lotes/${id}/supervisor`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Error al asignar supervisor' }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en API route PUT /api/lotes/:id/supervisor:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
