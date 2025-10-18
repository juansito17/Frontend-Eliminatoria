'use client';

import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLaboresAgricolas } from '../hooks/useLaboresAgricolas';
import LaboresTable from '../components/LaboresTable';
import Pagination from '../components/Pagination';

export default function MisLaboresPage() {
  const { user } = useAuth();
  const {
    labores,
    cultivos,
    trabajadores,
    tiposLabor,
    lotes,
    isLoading,
    currentPage,
    totalPages,
    setCurrentPage,
    loadLabores,
  } = useLaboresAgricolas();

  // Filtrar en frontend por id_usuario_registro; idealmente hacerlo en backend
  const misLabores = labores.filter(l => l.id_usuario_registro === user?.id);
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mis Labores</h1>
              <p className="text-sm text-gray-600">Histórico de tus registros</p>
            </header>
            <LaboresTable
              labores={misLabores}
              isLoading={isLoading}
              currentUser={user}
              onEdit={(l) => {
                // redirigir a la página de edición modal en gestión si se desea
                // por ahora no implementamos edición desde aquí
                console.log('Editar', l);
              }}
              onDelete={async (id) => {
                // recomendación: reusar lógica de eliminación con confirm y toast
                try {
                  const token = localStorage.getItem('token') || '';
                  const res = await fetch(`/api/labores-agricolas/${id}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  });
                  if (res.ok) {
                    await loadLabores();
                  } else {
                    console.error('Error al eliminar');
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
