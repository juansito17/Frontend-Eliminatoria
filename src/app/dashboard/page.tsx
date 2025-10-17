'use client';

import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  total_peso_kg: number;
  trabajadores_activos: number;
  cultivos_activos: number;
  eficiencia_porcentaje: number;
  rendimiento_por_lote: { nombre_lote: string; peso_total_lote: number }[];
  costo_total_aproximado: number;
}

interface HistoricalData {
  periodo: string;
  total_peso_kg: number;
  trabajadores_unicos: number;
  productividad_promedio_dia: number;
  costo_total_aproximado: number;
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'diario' | 'semanal' | 'mensual'>('semanal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]); // Estado para las alertas

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Error al obtener los datos del dashboard');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(`/api/dashboard/historical?periodo=${selectedPeriod}`);
        if (!response.ok) {
          throw new Error('Error al obtener datos históricos');
        }
        const data = await response.json();
        setHistoricalData(data);
      } catch (err: any) {
        console.error('Error fetching historical data:', err);
        // setError(err.message); // Podrías manejar este error por separado si quieres
      }
    };

    fetchDashboardData();
    fetchHistoricalData();

    // Socket.io connection for real-time updates
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001');

    socket.on('connect', () => {
      console.log('Conectado al servidor de Socket.io');
    });

    socket.on('nueva-produccion-diaria', (data: any) => {
      console.log('Nueva producción diaria recibida:', data);
      fetchDashboardData(); // Recargar datos al recibir una actualización
    });

    socket.on('actualizacion-produccion-diaria', (data: any) => {
      console.log('Actualización de producción diaria recibida:', data);
      fetchDashboardData(); // Recargar datos al recibir una actualización
    });

    socket.on('eliminacion-produccion-diaria', (data: any) => {
      console.log('Eliminación de producción diaria recibida:', data);
      fetchDashboardData(); // Recargar datos al recibir una actualización
    });

    socket.on('nueva-alerta', (newAlert: any) => {
      console.log('Nueva alerta recibida:', newAlert);
      setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor de Socket.io');
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedPeriod]); // Dependencia para recargar datos históricos cuando cambie el período

  const handleLogout = () => {
    logout();
  };

  const chartData = {
    labels: historicalData.map((data) => data.periodo),
    datasets: [
      {
        label: 'Producción Total (kg)',
        data: historicalData.map((data) => data.total_peso_kg),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Producción Histórica',
      },
    },
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
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
                <p className="text-sm text-gray-600">Panel de Control</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de vuelta!</h2>
          <p className="text-lg text-gray-600">Aquí tienes un resumen de tu actividad agrícola</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Producción Diaria</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.total_peso_kg || 0} kg</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trabajadores Activos</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.trabajadores_activos || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cultivos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.cultivos_activos || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Eficiencia</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.eficiencia_porcentaje || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3 .895-3 2 1.343 2 3 2m0-8c1.11 0 2.08.402 2.592 1M12 8c-1.11 0-2.08.402-2.592 1m2.592-1V3m0 2c0 2.21-1.79 4-4 4H12c2.21 0 4-1.79 4-4v2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Costo Total Aprox.</p>
                <p className="text-2xl font-bold text-gray-900">${dashboardData?.costo_total_aproximado || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rendimiento por Lote */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Lote (Hoy)</h3>
          {dashboardData?.rendimiento_por_lote && dashboardData.rendimiento_por_lote.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lote
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peso Total (kg)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.rendimiento_por_lote.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.nombre_lote}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.peso_total_lote.toFixed(2)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay datos de rendimiento por lote para hoy.</p>
          )}
        </div>

        {/* Producción Histórica */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Producción Histórica</h3>
          <div className="flex justify-end mb-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'diario' | 'semanal' | 'mensual')}
              className="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
          {historicalData.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p className="text-sm text-gray-500">No hay datos históricos disponibles.</p>
          )}
        </div>

        {/* Alerts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h3>
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">{alert.tipo_alerta}: {alert.descripcion}</p>
                    <p className="text-xs text-red-600">Nivel: {alert.nivel_severidad}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay alertas activas.</p>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-4">
              <a href="/labores-agricolas" className="p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg border border-green-200 transition-all duration-200 group">
                <div className="flex flex-col items-center text-center">
                  <svg className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">Nueva Labor</span>
                </div>
              </a>
              <a href="/api/reportes/labores/excel" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 transition-all duration-200 group">
                <div className="flex flex-col items-center text-center">
                  <svg className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">Ver Reportes</span>
                </div>
              </a>
              <button className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border border-purple-200 transition-all duration-200 group">
                <div className="flex flex-col items-center text-center">
                  <svg className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-800">Programar</span>
                </div>
              </button>
              <button className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-lg border border-yellow-200 transition-all duration-200 group">
                <div className="flex flex-col items-center text-center">
                  <svg className="h-8 w-8 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-yellow-800">Alertas</span>
                </div>
              </button>
            </div>
          </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
