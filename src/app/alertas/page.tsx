'use client';

import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../DashboardLayout';

interface Alerta {
  id: number;
  id_labor: number | null;
  id_lote: number | null;
  tipo_alerta: string;
  descripcion: string;
  nivel_severidad: string;
  resuelta: boolean;
  fecha_creacion: string;
}

function AlertasContent() {
  const { user, logout } = useAuth();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [alertasFiltradas, setAlertasFiltradas] = useState<Alerta[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroSeveridad, setFiltroSeveridad] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleLogout = () => {
    logout();
  };

  // Obtener alertas del servidor
  const fetchAlertas = async () => {
    try {
      const response = await fetch('/api/alertas', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Algunos endpoints devuelven directamente un array; soportar ambos formatos
        const listaAlertas = Array.isArray(data) ? data : data.alertas || [];
        setAlertas(listaAlertas);
        setAlertasFiltradas(listaAlertas);
      } else {
        console.error('Error al obtener alertas:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Inicializar socket y obtener alertas al montar el componente
  useEffect(() => {
    fetchAlertas();

    // Inicializar conexión WebSocket
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Escuchar nuevas alertas
    newSocket.on('nueva-alerta', (nuevaAlerta: Alerta) => {
      setAlertas((prevAlertas) => [nuevaAlerta, ...prevAlertas]);
    });

    // Escuchar actualizaciones de alertas
    newSocket.on('actualizacion-alerta', (alertaActualizada: Alerta) => {
      setAlertas((prevAlertas) =>
        prevAlertas.map((alerta) =>
          alerta.id === alertaActualizada.id ? alertaActualizada : alerta
        )
      );
    });

    // Escuchar eliminaciones de alertas
    newSocket.on('eliminacion-alerta', (data: { id: number }) => {
      setAlertas((prevAlertas) =>
        prevAlertas.filter((alerta) => alerta.id !== data.id)
      );
    });

    // Limpiar conexión al desmontar
    return () => {
      newSocket.close();
    };
  }, []);

  // Filtrar alertas cuando cambien los filtros o la búsqueda
  useEffect(() => {
    let filtradas = alertas;

    // Filtrar por tipo
    if (filtroTipo !== 'todos') {
      filtradas = filtradas.filter((alerta) => alerta.tipo_alerta === filtroTipo);
    }

    // Filtrar por severidad
    if (filtroSeveridad !== 'todos') {
      filtradas = filtradas.filter((alerta) => alerta.nivel_severidad === filtroSeveridad);
    }

    // Filtrar por búsqueda
    if (busqueda.trim() !== '') {
      filtradas = filtradas.filter((alerta) =>
        alerta.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        alerta.tipo_alerta.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    setAlertasFiltradas(filtradas);
  }, [alertas, filtroTipo, filtroSeveridad, busqueda]);

  // Marcar alerta como resuelta
  const marcarComoResuelta = async (id: number) => {
    try {
      const response = await fetch(`/api/alertas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ resuelta: true }),
      });

      if (response.ok) {
        // La actualización se reflejará automáticamente a través del WebSocket
        console.log('Alerta marcada como resuelta');
      } else {
        console.error('Error al actualizar alerta:', response.statusText);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  // Eliminar alerta
  const eliminarAlerta = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta alerta?')) {
      return;
    }

    try {
      const response = await fetch(`/api/alertas/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // La eliminación se reflejará automáticamente a través del WebSocket
        console.log('Alerta eliminada');
      } else {
        console.error('Error al eliminar alerta:', response.statusText);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  // Obtener tipos únicos de alerta para el filtro
  const tiposAlerta = Array.from(new Set(alertas.map((alerta) => alerta.tipo_alerta)));

  // Obtener niveles únicos de severidad para el filtro
  const nivelesSeveridad = Array.from(new Set(alertas.map((alerta) => alerta.nivel_severidad)));

  // Función para obtener el color según la severidad
  const getColorSeveridad = (severidad: string) => {
    switch (severidad.toLowerCase()) {
      case 'alto':
      case 'alta':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'medio':
      case 'media':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'bajo':
      case 'baja':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Función para obtener el ícono según el tipo de alerta
  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'BAJO_RENDIMIENTO':
        return '⚠️';
      case 'FALLO_PESAJE':
        return '⚖️';
      case 'RETRASO_COSECHA':
        return '⏰';
      default:
        return '📢';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando alertas...</p>
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
                <p className="text-sm text-gray-600">Gestión de Alertas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Volver al Dashboard
              </a>
              <a
                href="/cultivos"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Gestión de Cultivos
              </a>
              <a
                href="/labores-agricolas"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Gestión de Labores
              </a>
              <span className="text-sm text-gray-700">Hola, {user?.username || 'Usuario'}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
              <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user?.username?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Alertas</h2>
          <p className="text-lg text-gray-600">Monitorea y administra las alertas de tu sistema agrícola</p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar alertas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por tipo */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Alerta
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los tipos</option>
                {tiposAlerta.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por severidad */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severidad
              </label>
              <select
                value={filtroSeveridad}
                onChange={(e) => setFiltroSeveridad(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todas las severidades</option>
                {nivelesSeveridad.map((nivel) => (
                  <option key={nivel} value={nivel}>
                    {nivel}
                  </option>
                ))}
              </select>
            </div>

            {/* Información de resultados */}
            <div className="md:col-span-1 flex items-end">
              <div className="text-sm text-gray-600">
                <p>Total: {alertas.length}</p>
                <p>Mostrando: {alertasFiltradas.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alertas Totales</p>
                <p className="text-2xl font-bold text-gray-900">{alertas.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{alertas.filter(a => !a.resuelta).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resueltas</p>
                <p className="text-2xl font-bold text-gray-900">{alertas.filter(a => a.resuelta).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alta Severidad</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alertas.filter(a => a.nivel_severidad.toLowerCase() === 'alto' || a.nivel_severidad.toLowerCase() === 'alta').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de alertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alertasFiltradas.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas</h3>
              <p className="text-gray-600">No hay alertas que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            alertasFiltradas.map((alerta) => (
              <div
                key={alerta.id}
                className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${alerta.resuelta ? 'opacity-70' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{getIconoTipo(alerta.tipo_alerta)}</span>
                    <h3 className="font-bold text-lg text-gray-900">
                      {alerta.tipo_alerta.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alerta.nivel_severidad.toLowerCase() === 'alto' || alerta.nivel_severidad.toLowerCase() === 'alta'
                      ? 'bg-red-200 text-red-800'
                      : alerta.nivel_severidad.toLowerCase() === 'medio' || alerta.nivel_severidad.toLowerCase() === 'media'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-green-200 text-green-800'
                  }`}>
                    {alerta.nivel_severidad}
                  </span>
                </div>

                <p className="text-gray-700 mb-3">{alerta.descripcion}</p>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span>
                    {new Date(alerta.fecha_creacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {alerta.resuelta && (
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Resuelta
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  {!alerta.resuelta && (
                    <button
                      onClick={() => marcarComoResuelta(alerta.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Marcar como Resuelta
                    </button>
                  )}
                  <button
                    onClick={() => eliminarAlerta(alerta.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

function AlertasPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AlertasContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default AlertasPage;
