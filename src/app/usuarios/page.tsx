'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';

interface Usuario {
  id: number;
  username: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  rol: number;
  estado: 'activo' | 'inactivo' | string;
}

export default function UsuariosPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const showConfirm = useConfirm();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState({
    username: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: '3',
    estado: 'activo',
  });

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/usuarios', {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarios || data || []);
      } else {
        showToast('Error cargando usuarios', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      username: '',
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: '3',
      estado: 'activo',
    });
    setShowModal(true);
  };

  const openEdit = (u: Usuario) => {
    setEditing(u);
    setForm({
      username: u.username || '',
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      email: u.email || '',
      password: '',
      rol: String(u.rol || 3),
      estado: u.estado || 'activo',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        username: form.username,
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        rol: parseInt(form.rol, 10),
        estado: form.estado,
      };
      if (form.password) payload.password = form.password;

      const url = editing ? `/api/usuarios/${editing.id}` : '/api/usuarios';
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(editing ? 'Usuario actualizado' : 'Usuario creado', 'success');
        setShowModal(false);
        await loadUsuarios();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Error al guardar usuario', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al guardar usuario', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await showConfirm('¿Eliminar usuario?', { title: 'Eliminar usuario', confirmText: 'Eliminar', cancelText: 'Cancelar' });
    if (!ok) return;

    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (res.ok) {
        showToast('Usuario eliminado', 'success');
        await loadUsuarios();
      } else {
        showToast('Error al eliminar usuario', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al eliminar usuario', 'error');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-sm text-gray-600">Crear, editar y administrar usuarios y roles</p>
            </div>
            <div>
              <button
                onClick={openCreate}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700"
              >
                Nuevo Usuario
              </button>
            </div>
          </header>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Cargando usuarios...</div>
            ) : usuarios.length === 0 ? (
              <div className="p-8 text-center">No hay usuarios registrados.</div>
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
                    {usuarios.map(u => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{u.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{u.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{u.nombre} {u.apellido}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{u.rol}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{u.estado}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(u)} className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-md border border-blue-200">Editar</button>
                            <button onClick={() => handleDelete(u.id)} className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-md border border-red-200">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input required placeholder="Usuario" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="px-3 py-2 border rounded-md" />
                  <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="px-3 py-2 border rounded-md" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} className="px-3 py-2 border rounded-md" />
                  <input placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({...form, apellido: e.target.value})} className="px-3 py-2 border rounded-md" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder={editing ? 'Dejar en blanco para mantener contraseña' : 'Contraseña'} type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="px-3 py-2 border rounded-md" />
                  <select value={form.rol} onChange={(e) => setForm({...form, rol: e.target.value})} className="px-3 py-2 border rounded-md">
                    <option value="3">Operario (3)</option>
                    <option value="2">Supervisor (2)</option>
                    <option value="1">Administrador (1)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
