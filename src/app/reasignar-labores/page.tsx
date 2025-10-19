'use client';

import React from 'react';
import Link from 'next/link';

export default function ReasignarLaboresPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Reasignar Labores</h1>
        <p className="text-gray-600 mb-6">
          Página de reasignación de labores. Actualmente es una vista placeholder para evitar 404.
          Implementa aquí la UI para listar labores y reasignarlas a supervisores/trabajadores.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
