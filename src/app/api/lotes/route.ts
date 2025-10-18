import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';

function mapLotePayload(body: any) {
  return {
    nombre_lote: body.nombre ?? body.nombre_lote ?? null,
    area_hectareas: typeof body.area !== 'undefined' ? body.area : body.area_hectareas ?? null,
    id_cultivo: typeof body.id_cultivo !== 'undefined' ? body.id_cultivo : null,
    ubicacion_gps_poligono: body.ubicacion_gps_poligono ?? null,
    id_supervisor: typeof body.id_supervisor !== 'undefined' ? body.id_supervisor : null,
  };
}

// GET /api/lotes - Obtener todos los lotes
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/lotes`, {
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Error al obtener lotes' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en API route GET /api/lotes:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/lotes - Crear un nuevo lote
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const body = await request.json();

    const backendBody = mapLotePayload(body);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/lotes`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(backendBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Error al crear lote' },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Backend devuelve { message, id } con status 201
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error en API route POST /api/lotes:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
