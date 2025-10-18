'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../DashboardLayout';
import { useLaboresAgricolas, LaborAgricola } from '../hooks/useLaboresAgricolas';
import LaboresTable from '../components/LaboresTable';
import LaborForm from '../components/LaborForm';
import LaboresFilters from '../components/LaboresFilters';
import Pagination from '../components/Pagination';
import { useConfirm } from '../components/ConfirmModal';
import { useToast } from '../components/Toast';

function LaboresAgricolasContent() {
  const { user, logout, token } = useAuth();
  const {
    labores,
    cultivos,
    trabajadores,
    tiposLabor,
    lotes,
    isLoading,
    currentPage,
    totalPages,
    searchTerm,
    setCurrentPage,
    setSearchTerm,
    filtroCultivo,
    setFiltroCultivo,
    filtroTipoLabor,
    setFiltroTipoLabor,
    loadLabores,
    setLabores,
    loadLotes
  } = useLaboresAgricolas();

  const [showModal, setShowModal] = useState(false);
  const [editingLabor, setEditingLabor] = useState<LaborAgricola | null>(null);

  const showConfirm = useConfirm();
  const { showToast } = useToast();

  const handleSubmit = async (formData: any) => {
    try {
      const authToken = token || '';
      const url = editingLabor
        ? `/api/labores-agricolas/${editingLabor.id}`
        : '/api/labores-agricolas';

      const method = editingLabor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingLabor(null);
        loadLabores(); // Reload the table
        showToast('Labor guardada correctamente', 'success');
      } else {
        console.error('Error saving labor');
        showToast('Error al guardar la labor', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de conexión al guardar la labor', 'error');
    }
  };

  const handleEdit = (labor: LaborAgricola) => {
    setEditingLabor(labor);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm('¿Estás seguro de que deseas eliminar esta labor?', { title: 'Eliminar labor', confirmText: 'Eliminar', cancelText: 'Cancelar' });
    if (!confirmed) return;

    try {
      const authToken = token || '';
      const response = await fetch(`/api/labores-agricolas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        loadLabores(); // Reload the table
        showToast('Labor eliminada', 'success');
      } else {
        console.error('Error deleting labor');
        showToast('Error al eliminar la labor', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de conexión al eliminar la labor', 'error');
    }
  };

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Labores Agrícolas</h1>
            <p className="text-sm text-gray-600">Registro y seguimiento de actividades de campo</p>
          </div>
          <div className="flex items-center gap-3">
            {(user?.rol === 1 || user?.rol === 2 || user?.rol === 3) && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Labor
              </button>
            )}
          </div>
        </div>
        <LaboresFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          cultivos={cultivos}
          tiposLabor={tiposLabor}
          filtroCultivo={filtroCultivo}
          onFiltroCultivoChange={setFiltroCultivo}
          filtroTipoLabor={filtroTipoLabor}
          onFiltroTipoLaborChange={setFiltroTipoLabor}
        />

        <LaboresTable
          labores={labores}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentUser={user} // Pasar el usuario actual a LaboresTable
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      {/* Modal Form */}
      {showModal && (
        <LaborForm
          labor={editingLabor}
          cultivos={cultivos}
          trabajadores={trabajadores}
          tiposLabor={tiposLabor}
          lotes={lotes}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingLabor(null);
          }}
        />
      )}
    </>
  );
}

export default function LaboresAgricolasPage() {
  return (
    <ProtectedRoute roles={[1,2]}>
      <DashboardLayout>
        <LaboresAgricolasContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
