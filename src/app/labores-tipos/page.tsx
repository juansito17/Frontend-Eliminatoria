'use client';

import { useState } from 'react';
import { useLaboresTipos, LaborTipo, CreateLaborTipoData, UpdateLaborTipoData } from '../hooks/useLaboresTipos';
import { LaboresTiposTable } from '../components/LaboresTiposTable';
import { LaborTipoForm } from '../components/LaborTipoForm';
import Sidebar from '../dashboard/components/Sidebar';
import DashboardHeader from '../dashboard/components/DashboardHeader';
import { useAuth } from '../context/AuthContext';

export default function LaboresTiposPage() {
  const { laboresTipos, loading, error, createLaborTipo, updateLaborTipo, deleteLaborTipo } = useLaboresTipos();
  const { user, logout } = useAuth();
  const rol = user?.rol;
  const [showForm, setShowForm] = useState(false);
  const [editingLaborTipo, setEditingLaborTipo] = useState<LaborTipo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleCreateSuccess = () => {
    setShowForm(false);
  };

  const handleEdit = (laborTipo: LaborTipo) => {
    setEditingLaborTipo(laborTipo);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      const success = await deleteLaborTipo(showDeleteConfirm);
      if (success) {
        setShowDeleteConfirm(null);
      }
    }
  };

  const handleFormSubmit = async (data: CreateLaborTipoData | UpdateLaborTipoData): Promise<boolean> => {
    let success = false;

    if (editingLaborTipo) {
      success = await updateLaborTipo(data as UpdateLaborTipoData);
      if (success) {
        setEditingLaborTipo(null);
        setShowForm(false);
      }
    } else {
      success = await createLaborTipo(data as CreateLaborTipoData);
      if (success) {
        setShowForm(false);
      }
    }

    return success;
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingLaborTipo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar rol={rol} username={user?.username} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={user} onLogout={logout} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg border mb-8">
              <div className="px-6 py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Tipos de Labores</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Administra los diferentes tipos de labores agrícolas disponibles en el sistema
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Tipo de Labor
                  </button>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Modal/Card */}
            {showForm && (
              <div className="mb-8">
                <LaborTipoForm
                  laborTipo={editingLaborTipo}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancelForm}
                  loading={loading}
                />
              </div>
            )}

            {/* Table */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Tipos de Labores Registrados</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Lista de todos los tipos de labores configurados en el sistema
                </p>
              </div>
              <div className="p-6">
                <LaboresTiposTable
                  laboresTipos={laboresTipos}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={loading}
                />
              </div>
            </div>

            {/* Statistics Card */}
            {!loading && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Total de Tipos</h3>
                      <p className="text-2xl font-semibold text-blue-600">{laboresTipos.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Con Registro de Cantidad</h3>
                      <p className="text-2xl font-semibold text-green-600">
                        {laboresTipos.filter(l => l.requiere_cantidad).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Con Registro de Peso</h3>
                      <p className="text-2xl font-semibold text-purple-600">
                        {laboresTipos.filter(l => l.requiere_peso).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Confirmar Eliminación</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que deseas eliminar este tipo de labor? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="items-center px-4 py-3 flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
