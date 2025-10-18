'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useUsuarios, useRoles } from '../hooks/useUsuariosRoles';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';

interface UsuarioForm {
  username: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  rol?: number;
  estado?: string;
}

function UsuariosContent() {
  const { user, logout, isLoading, token } = useAuth();
  const { usuarios, loading, error, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario } = useUsuarios();
  const { roles, fetchRoles } = useRoles();
  const { showToast } = useToast();
  const showConfirm = useConfirm();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<UsuarioForm>({
    username: '',
    email: '',
    password: '',
    rol: 3,
    estado: 'activo',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && token) {
      // Cargar roles y usuarios cuando haya token
      fetchRoles().catch(() => {});
      fetchUsuarios().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, token]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      username: '',
      email: '',
      password: '',
      rol: 3,
      estado: 'activo',
    });
    setShowModal(true);
  };

  const openEdit = (u: any) => {
    setEditing(u);
    // Evitar poblar el username con el email: si username contiene '@' lo ignoramos
    const candidateUsername = u.nombre_usuario || u.username || '';
    const safeUsername = candidateUsername && candidateUsername.includes('@') ? (u.nombre_usuario || '') : candidateUsername;
    setForm({
      username: safeUsername || '',
      email: u.email || '',
      password: '',
      rol: u.rol || 3,
      estado: u.estado || 'activo',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        nombre_usuario: form.username,
        email: form.email,
        id_rol: form.rol,
        activo: form.estado === 'activo' ? 1 : 0,
      };
      if (form.password) payload.password = form.password;

      if (editing) {
        await updateUsuario(editing.id, payload);
        showToast('Usuario actualizado', 'success');
      } else {
        await createUsuario(payload);
        showToast('Usuario creado', 'success');
      }
      setShowModal(false);
    } catch (err: any) {
      showToast(err?.message || 'Error guardando usuario', 'error');
    } finally {
      setIsSubmitting(false);
      await fetchUsuarios();
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await showConfirm('¿Eliminar usuario?', { title: 'Eliminar usuario', confirmText: 'Eliminar', cancelText: 'Cancelar' });
    if (!ok) return;
    try {
      await deleteUsuario(id);
      showToast('Usuario eliminado', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error al eliminar usuario', 'error');
    } finally {
      await fetchUsuarios();
    }
  };

  const handleLogout = () => logout();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
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
            <button onClick={fetchUsuarios} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema Agrícola Inteligente</h1>
                <p className="text-sm text-gray-600">Gestión de Usuarios</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 font-medium">← Volver al Dashboard</a>
              <a href="/labores-agricolas" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Gestión de Labores</a>
              <span className="text-sm text-gray-700">Hola, {user?.username || 'Usuario'}</span>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Cerrar sesión">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
              <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user?.username?.charAt(0)?.toUpperCase?.() || ''}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h2>
            <p className="text-lg text-gray-600">Crear, editar y administrar usuarios y roles</p>
          </div>
          <button onClick={openCreate} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center">
            Nuevo Usuario
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Usuarios Registrados ({usuarios.length})</h3>
          </div>

          {usuarios.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios registrados</h3>
              <p className="text-gray-600 mb-6">Agrega usuarios para gestionar accesos.</p>
              <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">Agregar Usuario</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map(u => {
                    const roleId = u.id_rol ?? u.rol;
                    const roleNameFromList = roles?.find(r => r.id === roleId)?.nombre;
                    const roleLabels: Record<number, string> = { 1: 'Administrador', 2: 'Supervisor', 3: 'Operario' };
                    const roleName = roleNameFromList || (typeof roleId === 'number' && roleLabels[roleId]) || (typeof roleId === 'number' ? String(roleId) : '—');

                    const username = u.username || u.nombre || u.nombre_usuario || u.email || '—';
                    let nombreFull = ((u.nombre || u.nombre_usuario || '').trim() + ' ' + (u.apellido || '')).trim();
                    if (!nombreFull) nombreFull = username;

                    const estadoText = u.activo !== undefined ? (u.activo ? 'Activo' : 'Inactivo') : (u.estado || '—');

                    return (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{u.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{username}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{nombreFull}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{u.email || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{roleName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{estadoText}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => openEdit(u)} className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors" title="Editar usuario">Editar</button>
                            <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors" title="Eliminar usuario">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Usuario *</label>
<input id="username" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="usuario" required />
              </div>

              

              <div className="mb-4 grid md:grid-cols-2 gap-4">
<input
  placeholder="Email"
  type="email"
  value={form.email}
  onChange={(e) => setForm({ ...form, email: e.target.value })}
  disabled={!!editing}
  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${editing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
 />
<input
  placeholder={editing ? 'Dejar en blanco' : 'Contraseña'}
  type="password"
  value={form.password}
  onChange={(e) => setForm({ ...form, password: e.target.value })}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
/>
              </div>

              <div className="mb-4 grid md:grid-cols-2 gap-4">
<select value={String(form.rol)} onChange={(e) => setForm({...form, rol: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option value={3}>Operario (3)</option>
                  <option value={2}>Supervisor (2)</option>
                  <option value={1}>Administrador (1)</option>
                </select>
<select value={form.estado} onChange={(e) => setForm({...form, estado: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">
                  {isSubmitting ? 'Guardando...' : (editing ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsuariosPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UsuariosContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
