'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { useCultivos } from '../hooks/useCultivos';
import DashboardLayout from '../DashboardLayout';

interface Lote {
  id: number;
  nombre: string;
  area?: number | null;
  id_cultivo?: number | null;
  cultivo_nombre?: string;
}

function LotesContent() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const showConfirm = useConfirm();

  const { cultivos } = useCultivos();

  const [lotes, setLotes] = useState<Lote[]>([]);
  const [supervisores, setSupervisores] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Lote | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    area: '',
    id_cultivo: '',
    id_supervisor: ''
  });

  const loadLotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/lotes', {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLotes(data.lotes || data || []);
      } else {
        showToast('Error cargando lotes', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al cargar lotes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar supervisores (filtramos usuarios con rol === 2)
  const loadSupervisores = async () => {
    try {
      const res = await fetch('/api/usuarios', {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const users = data.usuarios || data || [];
        setSupervisores(users.filter((u: any) => u.rol === 2));
      }
    } catch (err) {
      console.error('Error cargando supervisores:', err);
    }
  };

  useEffect(() => {
    loadLotes();
    loadSupervisores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', area: '', id_cultivo: '', id_supervisor: '' });
    setShowModal(true);
  };

  const openEdit = (l: Lote) => {
    setEditing(l);
    setForm({
      nombre: l.nombre || '',
      area: l.area != null ? String(l.area) : '',
      id_cultivo: l.id_cultivo ? String(l.id_cultivo) : '',
      id_supervisor: (l as any).id_supervisor ? String((l as any).id_supervisor) : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = {
        nombre: form.nombre,
        area: form.area ? parseFloat(form.area) : null,
        id_cultivo: form.id_cultivo ? parseInt(form.id_cultivo, 10) : null,
        id_supervisor: form.id_supervisor ? parseInt(form.id_supervisor, 10) : null,
      };

      const url = editing ? `/api/lotes/${editing.id}` : '/api/lotes';
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
        showToast(editing ? 'Lote actualizado' : 'Lote creado', 'success');
        setShowModal(false);
        await loadLotes();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Error al guardar lote', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al guardar lote', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await showConfirm('¿Eliminar lote?', { title: 'Eliminar lote', confirmText: 'Eliminar', cancelText: 'Cancelar' });
    if (!ok) return;

    try {
      const res = await fetch(`/api/lotes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (res.ok) {
        showToast('Lote eliminado', 'success');
        await loadLotes();
      } else {
        showToast('Error al eliminar lote', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al eliminar lote', 'error');
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Lotes</h1>
              <p className="text-sm text-gray-600">Crear, editar y asignar lotes a cultivos</p>
            </div>
            <div>
              <button
                onClick={openCreate}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700"
              >
                Nuevo Lote
              </button>
            </div>
          </header>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Cargando lotes...</div>
            ) : lotes.length === 0 ? (
              <div className="p-8 text-center">No hay lotes registrados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cultivo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área (ha)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lotes.map(l => (
                      <tr key={l.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{l.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{l.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{l.cultivo_nombre || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{l.area != null ? Number(l.area).toFixed(2) : '-'}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(l)} className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-md border border-blue-200">Editar</button>
                            <button onClick={() => handleDelete(l.id)} className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-md border border-red-200">Eliminar</button>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Editar Lote' : 'Nuevo Lote'}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="Nombre del lote"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400"
                  />
                  <input
                    placeholder="Área (ha)"
                    type="number"
                    step="0.01"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-2">Asignar a Cultivo (opcional)</label>
                  <select value={form.id_cultivo} onChange={(e) => setForm({ ...form, id_cultivo: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                    <option value="">-- Ninguno --</option>
                    {cultivos.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-2">Asignar Supervisor (opcional)</label>
                  <select value={form.id_supervisor} onChange={(e) => setForm({ ...form, id_supervisor: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                    <option value="">-- Ninguno --</option>
                    {supervisores.map(s => (
                      <option key={s.id} value={String(s.id)}>{s.username || s.nombre_usuario || s.email}</option>
                    ))}
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
    );
}

export default function LotesPage() {
  return (
    <ProtectedRoute roles={[1]}>
      <DashboardLayout>
        <LotesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
