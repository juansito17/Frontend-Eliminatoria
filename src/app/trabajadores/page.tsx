'use client';

import React, { useState, useEffect } from 'react';
import { useTrabajadores } from '@/app/hooks/useTrabajadores';
import TrabajadoresTable from '@/app/components/TrabajadoresTable';
import TrabajadorForm from '@/app/components/TrabajadorForm';
import TrabajadoresFilters from '@/app/components/TrabajadoresFilters';
import ProtectedRoute from '@/app/components/ProtectedRoute';

interface Trabajador {
  id: number;
  nombre_completo: string;
  codigo_trabajador: string;
  activo: boolean;
  fecha_creacion: string;
}

const TrabajadoresPage: React.FC = () => {
  const {
    trabajadores,
    loading,
    error,
    fetchTrabajadores,
    createTrabajador,
    updateTrabajador,
    deleteTrabajador
  } = useTrabajadores();

  const [filteredTrabajadores, setFilteredTrabajadores] = useState<Trabajador[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState<Trabajador | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  // Aplicar filtros de búsqueda y estado
  useEffect(() => {
    let filtered = trabajadores;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(trabajador =>
        trabajador.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trabajador.codigo_trabajador.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(trabajador =>
        statusFilter === 'activos' ? trabajador.activo : !trabajador.activo
      );
    }

    setFilteredTrabajadores(filtered);
  }, [trabajadores, searchTerm, statusFilter]);

  const handleCreateTrabajador = async (trabajadorData: Omit<Trabajador, 'id' | 'fecha_creacion'>) => {
    try {
      await createTrabajador(trabajadorData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error al crear trabajador:', error);
    }
  };

  const handleEditTrabajador = (trabajador: Trabajador) => {
    setEditingTrabajador(trabajador);
    setIsFormOpen(true);
  };

  const handleUpdateTrabajador = async (trabajadorData: Omit<Trabajador, 'id' | 'fecha_creacion'>) => {
    if (!editingTrabajador) return;

    try {
      await updateTrabajador(editingTrabajador.id, trabajadorData);
      setIsFormOpen(false);
      setEditingTrabajador(null);
    } catch (error) {
      console.error('Error al actualizar trabajador:', error);
    }
  };

  const handleDeleteTrabajador = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este trabajador? Esta acción no se puede deshacer.')) {
      try {
        await deleteTrabajador(id);
      } catch (error) {
        console.error('Error al eliminar trabajador:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTrabajador(null);
  };

  if (loading && trabajadores.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Trabajadores
          </h1>
          <p className="text-gray-600">
            Administra la información de los trabajadores del sistema agrícola
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <TrabajadoresFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Tabla de trabajadores */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <TrabajadoresTable
            trabajadores={filteredTrabajadores}
            loading={loading}
            onEdit={handleEditTrabajador}
            onDelete={handleDeleteTrabajador}
          />
        </div>

        {/* Botón para añadir trabajador */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
          >
            + Añadir Trabajador
          </button>
        </div>

        {/* Modal del formulario */}
        {isFormOpen && (
          <TrabajadorForm
            trabajador={editingTrabajador}
            onSubmit={editingTrabajador ? handleUpdateTrabajador : handleCreateTrabajador}
            onClose={handleCloseForm}
          />
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default TrabajadoresPage;
