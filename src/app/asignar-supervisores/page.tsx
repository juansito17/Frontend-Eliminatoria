"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

interface Usuario { id: number; username?: string; email?: string; rol?: number }
interface Lote { id: number; nombre: string; id_supervisor?: number | null }

function Content() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [lotes, setLotes] = useState<Lote[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token || ''}` }), [token]);
  const supervisores = useMemo(() => usuarios.filter(u => u.rol === 2), [usuarios]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      await Promise.all([loadLotes(), loadUsuarios()]);
    })();
  }, [token]);

  async function loadLotes() {
    try {
      const res = await fetch('/api/lotes', { headers: { ...authHeader } });
      if (res.ok) {
        const data = await res.json();
        setLotes(data.lotes || data || []);
      }
    } catch {}
  }

  async function loadUsuarios() {
    try {
      const res = await fetch('/api/usuarios', { headers: { ...authHeader } });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarios || data || []);
      }
    } catch {}
  }

  async function handleAsignarSupervisor(loteId: number, id_supervisor: number | null) {
    try {
      setLoading(true);
      const res = await fetch(`/api/lotes/${loteId}/supervisor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ id_supervisor })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Error al asignar supervisor', 'error');
        return;
      }
      showToast('Supervisor asignado correctamente', 'success');
      await loadLotes();
    } catch {
      showToast('Error de conexión', 'error');
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Asignar Supervisores</h1>
        <p className="text-sm text-gray-600">Solo administradores</p>
      </div>
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Supervisores por Lote</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Lote</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Supervisor</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lotes.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{l.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{l.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <select
                      defaultValue={l.id_supervisor ? String(l.id_supervisor) : ''}
                      onChange={(e) => handleAsignarSupervisor(l.id, e.target.value ? parseInt(e.target.value,10) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      <option value="">-- Sin asignar --</option>
                      {supervisores.map(s => (
                        <option key={s.id} value={String(s.id)}>{s.username || s.email || `Supervisor ${s.id}`}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button onClick={() => loadLotes()} className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Refrescar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute roles={[1]}>
      <DashboardLayout>
        <Content />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
