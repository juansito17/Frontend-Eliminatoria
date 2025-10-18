'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useRoles } from '../hooks/useUsuariosRoles';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';

interface RoleFormData {
  nombre_rol: string;
  descripcion_rol?: string;
}

function RolesContent() {
  const { user, logout, isLoading, token } = useAuth();
  const { roles, loading, error, fetchRoles, createRole, updateRole, deleteRole } = useRoles();
  const { showToast } = useToast();
  const showConfirm = useConfirm();

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [form, setForm] = useState<RoleFormData>({ nombre_rol: '', descripcion_rol: '' });
  const [formErrors, setFormErrors] = useState<Partial<RoleFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && token) {
      fetchRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, token]);

  const resetForm = () => {
    setForm({ nombre_rol: '', descripcion_rol: '' });
    setFormErrors({});
    setEditingRole(null);
  };

  const openModal = (role?: any) => {
    if (role) {
      setEditingRole(role);
      setForm({ nombre_rol: role.nombre || '', descripcion_rol: role.descripcion || '' });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const validate = (): boolean => {
    const errs: Partial<RoleFormData> = {};
    if (!form.nombre_rol || !form.nombre_rol.trim()) errs.nombre_rol = 'El nombre del rol es requerido';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, form);
        showToast('Rol actualizado', 'success');
      } else {
        await createRole(form);
        showToast('Rol creado', 'success');
      }
      closeModal();
    } catch (err: any) {
      showToast(err?.message || 'Error al guardar rol', 'error');
    } finally {
      setIsSubmitting(false);
      await fetchRoles();
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await showConfirm('¿Eliminar rol?', { title: 'Eliminar rol', confirmText: 'Eliminar', cancelText: 'Cancelar' });
    if (!ok) return;
    try {
      await deleteRole(id);
      showToast('Rol eliminado', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error al eliminar rol', 'error');
    } finally {
      await fetchRoles();
    }
  };

  // El header global y logout se manejan en DashboardLayout

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando roles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-900">Error</h3>
            </div>
            <p className="text-red-700">{error}</p>
            <button onClick={fetchRoles} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Roles</h2>
            <p className="text-lg text-gray-600">Crear, editar y administrar roles</p>
          </div>
          <button onClick={() => openModal()} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center">
            Nuevo Rol
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Roles Registrados ({roles.length})</h3>
          </div>

          {roles.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay roles registrados</h3>
              <p className="text-gray-600 mb-6">Agrega roles para gestionar permisos.</p>
              <button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">Agregar Rol</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{r.nombre || r.nombre_rol || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{r.descripcion || 'Sin descripción'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => openModal(r)} className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors" title="Editar rol">Editar</button>
                          <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors" title="Eliminar rol">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{editingRole ? 'Editar Rol' : 'Nuevo Rol'}</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="nombre_rol" className="block text-sm font-medium text-gray-700 mb-2">Nombre del Rol *</label>
<input id="nombre_rol" value={form.nombre_rol} onChange={(e) => setForm({...form, nombre_rol: e.target.value})} className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${formErrors.nombre_rol ? 'border-red-300' : ''}`} placeholder="Ej: Administrador" required />
                {formErrors.nombre_rol && <p className="mt-1 text-sm text-red-600">{formErrors.nombre_rol}</p>}
              </div>

              <div className="mb-6">
                <label htmlFor="descripcion_rol" className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
<textarea id="descripcion_rol" rows={3} value={form.descripcion_rol} onChange={(e) => setForm({...form, descripcion_rol: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none" placeholder="Descripción opcional del rol..." />
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">
                  {isSubmitting ? 'Guardando...' : (editingRole ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
  );
}

export default function Page() {
  return (
    <ProtectedRoute roles={[1]}>
      <DashboardLayout>
        <RolesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
