"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useConfirm } from "../components/ConfirmModal";

interface Usuario { id: number; username?: string; email?: string; rol?: number }
interface Lote { id: number; nombre: string; id_supervisor?: number | null; supervisor_nombre?: string | null }
interface Trabajador { id: number; nombre: string }
interface Labor { id: number; fecha: string; trabajador: string; tipoLabor: string }

export default function AsignacionesPage() {
  return (
    <ProtectedRoute roles={[1,2]}>
      <DashboardLayout>
        <AsignacionesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function AsignacionesContent() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [tab, setTab] = useState<'lotes'|'labores'>('lotes');

  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [labores, setLabores] = useState<Labor[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);

  // Supervisores (rol === 2)
  const supervisores = useMemo(() => usuarios.filter(u => u.rol === 2), [usuarios]);

  useEffect(() => {
    if (!token) return;
    // cargar datos iniciales
    loadLotes();
    loadUsuarios();
    loadTrabajadores();
    loadLabores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token || ''}` }), [token]);

  async function loadLotes() {
    try {
      const res = await fetch('/api/lotes', { headers: { ...authHeader }});
      if (res.ok) {
        const data = await res.json();
        setLotes(data.lotes || data || []);
      }
    } catch (e) { console.error(e); }
  }

  async function loadUsuarios() {
    try {
      const res = await fetch('/api/usuarios', { headers: { ...authHeader }});
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarios || data || []);
      }
    } catch (e) { console.error(e); }
  }

  async function loadTrabajadores() {
    try {
      const res = await fetch('/api/trabajadores', { headers: { ...authHeader }});
      if (res.ok) {
        const data = await res.json();
        setTrabajadores(data.trabajadores || data || []);
      }
    } catch (e) { console.error(e); }
  }

  async function loadLabores() {
    try {
      // Para supervisores, backend ya filtra por su equipo; admin ve todas
      const res = await fetch('/api/labores-agricolas?page=1&limit=20', { headers: { ...authHeader }});
      if (res.ok) {
        const data = await res.json();
        setLabores(data.labores || []);
      }
    } catch (e) { console.error(e); }
  }

  async function handleAsignarSupervisor(loteId: number, id_supervisor: number | null) {
    try {
      setLoading(true);
      const res = await fetch(`/api/lotes/${loteId}`, {
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
    } catch (e) {
      console.error(e);
      showToast('Error de conexión', 'error');
    } finally { setLoading(false); }
  }

  async function handleReasignarLabor(laborId: number, nuevoTrabajadorId: number) {
    const ok = await confirm('¿Confirmas reasignar esta labor al nuevo trabajador?', { title: 'Reasignar labor', confirmText: 'Reasignar' });
    if (!ok) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/labores-agricolas/${laborId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ id_trabajador: nuevoTrabajadorId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'No se pudo reasignar la labor', 'error');
        return;
      }
      showToast('Labor reasignada', 'success');
      await loadLabores();
    } catch (e) {
      console.error(e);
      showToast('Error de conexión', 'error');
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asignaciones</h1>
          <p className="text-sm text-gray-600">Asignar supervisores a lotes y reasignar labores a trabajadores</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('lotes')} className={`px-4 py-2 rounded-md border ${tab==='lotes' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>Lotes</button>
          <button onClick={() => setTab('labores')} className={`px-4 py-2 rounded-md border ${tab==='labores' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>Labores</button>
        </div>
      </header>

      {tab === 'lotes' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Lote</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supervisor</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lotes.map(l => (
                  <tr key={l.id}>
                    <td className="px-6 py-4 text-sm">{l.id}</td>
                    <td className="px-6 py-4 text-sm">{l.nombre}</td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        defaultValue={l.id_supervisor ? String(l.id_supervisor) : ''}
                        onChange={(e) => handleAsignarSupervisor(l.id, e.target.value ? parseInt(e.target.value,10) : null)}
                        className="px-2 py-1 border rounded-md"
                        disabled={loading}
                      >
                        <option value="">-- Ninguno --</option>
                        {supervisores.map(s => (
                          <option key={s.id} value={String(s.id)}>{s.username || s.email || `Supervisor ${s.id}`}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => loadLotes()} className="text-xs px-3 py-1 border rounded-md">Refrescar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'labores' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trabajador</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {labores.map(lb => (
                  <tr key={lb.id}>
                    <td className="px-6 py-4 text-sm">{lb.id}</td>
                    <td className="px-6 py-4 text-sm">{new Date(lb.fecha).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{lb.tipoLabor}</td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        onChange={(e) => handleReasignarLabor(lb.id, parseInt(e.target.value,10))}
                        className="px-2 py-1 border rounded-md"
                        defaultValue={trabajadores.find(t => t.nombre === lb.trabajador)?.id || ''}
                        disabled={loading}
                      >
                        <option value="" disabled>-- Seleccionar trabajador --</option>
                        {trabajadores.map(t => (
                          <option key={t.id} value={String(t.id)}>{t.nombre}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => loadLabores()} className="text-xs px-3 py-1 border rounded-md">Refrescar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
