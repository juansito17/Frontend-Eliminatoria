'use client';

import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import ProtectedRoute from '../components/ProtectedRoute';

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

const AlertasPage = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [alertasFiltradas, setAlertasFiltradas] = useState<Alerta[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroSeveridad, setFiltroSeveridad] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Obtener alertas del servidor
  const fetchAlertas = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/alertas', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAlertas(data.alertas);
        setAlertasFiltradas(data.alertas);
      } else {
        console.error('Error al obtener alertas:', response.statusText);
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
    const newSocket = io('http://localhost:3001');
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
      const response = await fetch(`http://localhost:3001/api/alertas/${id}`, {
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
      const response = await fetch(`http://localhost:3001/api/alertas/${id}`, {
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
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Alertas y Notificaciones</h1>

        {/* Filtros y búsqueda */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Lista de alertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alertasFiltradas.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No hay alertas que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            alertasFiltradas.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-4 rounded-lg shadow-md border-l-4 ${getColorSeveridad(alerta.nivel_severidad)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{getIconoTipo(alerta.tipo_alerta)}</span>
                    <h3 className="font-bold text-lg">
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
      </div>
    </ProtectedRoute>
  );
};

export default AlertasPage;
