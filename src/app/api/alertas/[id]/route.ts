import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;

    const response = await fetch(`${BACKEND_URL}/api/alertas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al actualizar alerta' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating alerta:', error);
    return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/api/alertas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al eliminar alerta' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    return NextResponse.json({ message: 'Alerta eliminada' });
  } catch (error: any) {
    console.error('Error deleting alerta:', error);
    return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 });
  }
}
