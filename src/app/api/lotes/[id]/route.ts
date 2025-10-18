import { NextRequest, NextResponse } from 'next/server';

const RAW_BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';
const BACKEND_URL = RAW_BACKEND.replace(/\/+$/,'').replace(/\/api\/?$/i,'');

function mapLotePayload(body: any) {
  return {
    nombre_lote: body.nombre ?? body.nombre_lote ?? null,
    area_hectareas: typeof body.area !== 'undefined' ? body.area : body.area_hectareas ?? null,
    id_cultivo: typeof body.id_cultivo !== 'undefined' ? body.id_cultivo : null,
    ubicacion_gps_poligono: body.ubicacion_gps_poligono ?? null,
    id_supervisor: typeof body.id_supervisor !== 'undefined' ? body.id_supervisor : null,
  };
}

// GET /api/lotes/:id
export async function GET(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const parts = pathname.split('/');
    const id = parts[parts.length - 1];

    const authHeader = request.headers.get('Authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/lotes/${id}`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ message: errorData.message || 'Error al obtener lote' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en API route GET /api/lotes/:id:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/lotes/:id
export async function PUT(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const parts = pathname.split('/');
    const id = parts[parts.length - 1];

    const authHeader = request.headers.get('Authorization');
    const body = await request.json();
    const backendBody = mapLotePayload(body);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/lotes/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(backendBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ message: errorData.message || 'Error al actualizar lote' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en API route PUT /api/lotes/:id:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/lotes/:id
export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const parts = pathname.split('/');
    const id = parts[parts.length - 1];

    const authHeader = request.headers.get('Authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/lotes/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ message: errorData.message || 'Error al eliminar lote' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en API route DELETE /api/lotes/:id:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
