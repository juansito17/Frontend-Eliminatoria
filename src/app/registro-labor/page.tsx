'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import LaborForm from '../components/LaborForm';
import { useLaboresAgricolas } from '../hooks/useLaboresAgricolas';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function RegistroLaborPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { cultivos, trabajadores, tiposLabor, lotes, loadLabores } = useLaboresAgricolas();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ensure master lists are loaded (hook already does on token change)
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (payload: any) => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/labores-agricolas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('Labor registrada correctamente', 'success');
        await loadLabores();
        router.push('/mis-labores');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Error al registrar la labor', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al registrar la labor', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  return (
    <ProtectedRoute roles={[3]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-3xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Registro de Labor</h1>
            <p className="text-sm text-gray-600">Formulario optimizado para captura en campo</p>
          </header>

          <LaborForm
            cultivos={cultivos}
            trabajadores={trabajadores}
            tiposLabor={tiposLabor}
            lotes={lotes}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/dashboard')}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
