import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000';
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ message: 'Token no proporcionado' }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/api/trabajadores`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json({ message: data.message || 'Error al obtener trabajadores' }, { status: response.status });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
