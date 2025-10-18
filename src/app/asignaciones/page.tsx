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
    <ProtectedRoute roles={[1]}>
      <DashboardLayout>
        <RedirectToAdminAssign />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function RedirectToAdminAssign() {
  const { token } = useAuth();
  useEffect(() => {
    if (!token) return;
    // Redirigimos a la nueva página de solo admin
    window.location.replace('/asignar-supervisores');
  }, [token]);
  return <div className="text-sm text-gray-600">Redirigiendo…</div>;
}

function AsignacionesContent() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();

  // Si el usuario no es admin, por defecto mostrar "labores"
  const [tab, setTab] = useState<'lotes'|'labores'>(user?.rol === 1 ? 'lotes' : 'labores');

  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [labores, setLabores] = useState<Labor[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id_lote: '', id_supervisor: '' });

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
      // Usamos el endpoint específico para asignar supervisor (solo admin)
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asignaciones</h1>
          <p className="mt-2 text-sm text-gray-600">Asignar supervisores a lotes y reasignar labores a trabajadores</p>
        </div>
        <button 
          onClick={() => { setShowModal(true); setFormData({ id_lote: '', id_supervisor: '' }); }}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700 font-medium transition-all"
        >
          + Agregar Asignación
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-2">
          {user?.rol === 1 && (
            <button 
              onClick={() => setTab('lotes')} 
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                tab==='lotes' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              Lotes
            </button>
          )}
          <button 
            onClick={() => setTab('labores')} 
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              tab==='labores' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            Labores
          </button>
        </div>
      </div>

      {tab === 'lotes' && user?.rol === 1 && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Supervisores por Lote</h2>
            <p className="text-sm text-gray-600">Asigna un supervisor a cada lote para gestionar las labores</p>
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
                {lotes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="font-medium">No hay lotes disponibles</p>
                        <p className="text-xs mt-1">Los lotes aparecerán aquí cuando se creen</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  lotes.map(l => (
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
                        <button 
                          onClick={() => loadLotes()} 
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refrescar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'labores' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Reasignación de Labores</h2>
            <p className="text-sm text-gray-600">Reasigna labores existentes a diferentes trabajadores</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tipo de Labor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trabajador</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {labores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="font-medium">No hay labores disponibles</p>
                        <p className="text-xs mt-1">Las labores aparecerán aquí cuando se registren</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  labores.map(lb => (
                    <tr key={lb.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lb.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(lb.fecha).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lb.tipoLabor}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <select
                          onChange={(e) => handleReasignarLabor(lb.id, parseInt(e.target.value,10))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                          defaultValue={trabajadores.find(t => t.nombre === lb.trabajador)?.id || ''}
                          disabled={loading}
                        >
                          <option value="" disabled>-- Seleccionar trabajador --</option>
                          {trabajadores.map(t => (
                            <option key={t.id} value={String(t.id)}>{t.nombre}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button 
                          onClick={() => loadLabores()} 
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refrescar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Modal para agregar asignación (solo Admin) */}
      {showModal && user?.rol === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Asignación</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!formData.id_lote || !formData.id_supervisor) {
                showToast('Por favor completa todos los campos', 'error');
                return;
              }
              try {
                setLoading(true);
                const res = await fetch(`/api/lotes/${formData.id_lote}/supervisor`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', ...authHeader },
                  body: JSON.stringify({ id_supervisor: parseInt(formData.id_supervisor, 10) })
                });
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}));
                  showToast(data.message || 'Error al asignar supervisor', 'error');
                  return;
                }
                showToast('Asignación creada correctamente', 'success');
                setShowModal(false);
                await loadLotes();
              } catch (err) {
                console.error(err);
                showToast('Error de conexión', 'error');
              } finally { setLoading(false); }
            }} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Seleccionar Lote</label>
                <select 
                  value={formData.id_lote} 
                  onChange={(e) => setFormData({ ...formData, id_lote: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  disabled={loading}
                >
                  <option value="" className="text-gray-900">-- Seleccionar lote --</option>
                  {lotes.map(l => (
                    <option key={l.id} value={String(l.id)} className="text-gray-900">{l.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Seleccionar Supervisor</label>
                <select 
                  value={formData.id_supervisor} 
                  onChange={(e) => setFormData({ ...formData, id_supervisor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  disabled={loading}
                >
                  <option value="" className="text-gray-900">-- Seleccionar supervisor --</option>
                  {supervisores.map(s => (
                    <option key={s.id} value={String(s.id)} className="text-gray-900">{s.username || s.email || `Supervisor ${s.id}`}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 font-medium hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={loading}
                >
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
