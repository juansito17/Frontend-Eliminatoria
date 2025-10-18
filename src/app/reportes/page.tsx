'use client';

import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ProduccionDiaria {
  fecha: string;
  cantidad_total: number;
  peso_total: number;
  numero_labores: number;
  nombre_cultivo: string;
}

interface RendimientoLote {
  nombre_lote: string;
  nombre_cultivo: string;
  cantidad_total: number;
  peso_total: number;
  promedio_cantidad: number;
  numero_labores: number;
}

interface EficienciaTrabajador {
  trabajador: string;
  numero_labores: number;
  cantidad_total: number;
  peso_total: number;
  promedio_cantidad: number;
  costo_total: number;
}

interface HistoricoLabores {
  fecha: string;
  nombre_labor: string;
  numero_labores: number;
  cantidad_total: number;
  peso_total: number;
}

interface LaboresDetallado {
  fecha_labor: string;
  nombre_labor: string;
  nombre_cultivo: string;
  nombre_lote: string;
  trabajador: string;
  cantidad_recolectada: number;
  peso_kg: number;
  costo_aproximado: number;
  usuario_registro: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Cultivo {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_creacion: string;
}

interface Trabajador {
  id: number;
  nombre: string;
}

interface LaborTipo {
  id: number;
  nombre: string;
}

function ReportesContent() {
  const { user, token, logout } = useAuth();
  const [produccionDiaria, setProduccionDiaria] = useState<ProduccionDiaria[]>([]);
  const [rendimientoLote, setRendimientoLote] = useState<RendimientoLote[]>([]);
  const [eficienciaTrabajador, setEficienciaTrabajador] = useState<EficienciaTrabajador[]>([]);
  const [historicoLabores, setHistoricoLabores] = useState<HistoricoLabores[]>([]);
  const [laboresDetallado, setLaboresDetallado] = useState<LaboresDetallado[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Estados para datos de filtros
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [tiposLabor, setTiposLabor] = useState<LaborTipo[]>([]);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    cultivoId: '',
    laborId: '',
    trabajadorId: '',
    page: 1,
    limit: 10
  });

  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos de producción diaria
  const fetchProduccionDiaria = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);
      if (filtros.cultivoId) queryParams.append('cultivoId', filtros.cultivoId);
      if (filtros.laborId) queryParams.append('laborId', filtros.laborId);
      if (filtros.trabajadorId) queryParams.append('trabajadorId', filtros.trabajadorId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/reportes/produccion-diaria?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener producción diaria');
      }
      const data = await response.json();
      setProduccionDiaria(data);
    } catch (err: any) {
      console.error('Error:', err);
    }
  };

  // Función para obtener datos de rendimiento por lote
  const fetchRendimientoLote = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);
      if (filtros.cultivoId) queryParams.append('cultivoId', filtros.cultivoId);
      if (filtros.laborId) queryParams.append('laborId', filtros.laborId);
      if (filtros.trabajadorId) queryParams.append('trabajadorId', filtros.trabajadorId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/reportes/rendimiento-lote?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener rendimiento por lote');
      const data = await response.json();
      setRendimientoLote(data);
    } catch (err: any) {
      console.error('Error:', err);
    }
  };

  // Función para obtener datos de eficiencia por trabajador
  const fetchEficienciaTrabajador = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);
      if (filtros.cultivoId) queryParams.append('cultivoId', filtros.cultivoId);
      if (filtros.laborId) queryParams.append('laborId', filtros.laborId);
      if (filtros.trabajadorId) queryParams.append('trabajadorId', filtros.trabajadorId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/reportes/eficiencia-trabajador?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener eficiencia por trabajador');
      const data = await response.json();
      setEficienciaTrabajador(data);
    } catch (err: any) {
      console.error('Error:', err);
    }
  };

  // Función para obtener datos de histórico de labores
  const fetchHistoricoLabores = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);
      if (filtros.cultivoId) queryParams.append('cultivoId', filtros.cultivoId);
      if (filtros.laborId) queryParams.append('laborId', filtros.laborId);
      if (filtros.trabajadorId) queryParams.append('trabajadorId', filtros.trabajadorId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/reportes/historico-labores?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener histórico de labores');
      const data = await response.json();
      setHistoricoLabores(data);
    } catch (err: any) {
      console.error('Error:', err);
    }
  };

  // Función para obtener datos detallados con paginación
  const fetchLaboresDetallado = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);
      if (filtros.cultivoId) queryParams.append('cultivoId', filtros.cultivoId);
      if (filtros.laborId) queryParams.append('laborId', filtros.laborId);
      if (filtros.trabajadorId) queryParams.append('trabajadorId', filtros.trabajadorId);
      queryParams.append('page', filtros.page.toString());
      queryParams.append('limit', filtros.limit.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/reportes/labores-detallado?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener labores detalladas');
      const data = await response.json();
      setLaboresDetallado(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error('Error:', err);
    }
  };

  // Función para cargar datos de filtros
  const fetchFilterData = async () => {
    if (!token) return;

    try {
      const [cultivosResponse, trabajadoresResponse, tiposLaborResponse] = await Promise.all([
        fetch('/api/cultivos', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/trabajadores', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/labores-tipos', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (cultivosResponse.ok) {
        const cultivosData = await cultivosResponse.json();
        setCultivos(cultivosData.cultivos || []);
      }

      if (trabajadoresResponse.ok) {
        const trabajadoresData = await trabajadoresResponse.json();
        setTrabajadores(trabajadoresData.trabajadores || []);
      }

      if (tiposLaborResponse.ok) {
        const tiposLaborData = await tiposLaborResponse.json();
        setTiposLabor(tiposLaborData.tiposLabor || []);
      }
    } catch (error) {
      console.error('Error al cargar datos de filtros:', error);
    }
  };

  // Cargar datos de filtros al montar el componente
  useEffect(() => {
    if (token) {
      fetchFilterData();
    }
  }, [token]);

  // Cargar todos los datos cuando cambien los filtros
  useEffect(() => {
    const loadAllData = async () => {
      if (!token) { // Solo cargar datos si hay un token
        setLoading(false);
        return;
      }
      setIsFetching(true);
      await Promise.all([
        fetchProduccionDiaria(),
        fetchRendimientoLote(),
        fetchEficienciaTrabajador(),
        fetchHistoricoLabores(),
        fetchLaboresDetallado()
      ]);
      if (loading) {
        setLoading(false);
      }
      setIsFetching(false);
    };

    loadAllData();
  }, [filtros, token]);

  const handleLogout = () => {
    logout();
  };

  const handleFiltroChange = (key: string, value: string) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Resetear página cuando cambien filtros
    }));
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    // fallback to cookie token if context token is null
    const cookieToken = Cookies.get('token');
    const authToken = token || cookieToken;

    if (!authToken) {
      alert('No autorizado: inicia sesión para exportar.');
      return;
    }

    try {
      const params = new URLSearchParams({
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
        cultivoId: filtros.cultivoId,
        laborId: filtros.laborId,
        trabajadorId: filtros.trabajadorId
      });

      const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/reportes/labores/${type}?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = errData?.message || 'Error al generar exportación';
        alert(msg);
        return;
      }

      const blob = await res.blob();
      const filename = type === 'pdf' ? `reportes_${Date.now()}.pdf` : `reportes_${Date.now()}.xlsx`;
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error exportando:', err);
      alert('Error al exportar. Revisa la consola para más detalles.');
    }
  };

  // Datos para gráficos
  const produccionDiariaChartData = {
    labels: produccionDiaria.map(item => new Date(item.fecha).toLocaleDateString()),
    datasets: [
      {
        label: 'Peso Total (kg)',
        data: produccionDiaria.map(item => item.peso_total),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const rendimientoLoteChartData = {
    labels: rendimientoLote.map(item => item.nombre_lote),
    datasets: [
      {
        label: 'Peso Total (kg)',
        data: rendimientoLote.map(item => item.peso_total),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  const eficienciaTrabajadorChartData = {
    labels: eficienciaTrabajador.map(item => item.trabajador),
    datasets: [
      {
        label: 'Peso Total (kg)',
        data: eficienciaTrabajador.map(item => item.peso_total),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  const historicoLaboresChartData = {
    labels: historicoLabores.map(item => new Date(item.fecha).toLocaleDateString()),
    datasets: [
      {
        label: 'Número de Labores',
        data: historicoLabores.map(item => item.numero_labores),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
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
    },
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 text-black px-4 py-3 rounded-md shadow">
            Cargando...
          </div>
        </div>
      )}
      {isFetching && !loading && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white bg-opacity-95 text-black px-3 py-2 rounded-md shadow flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Actualizando...
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema Agrícola Inteligente</h1>
                <p className="text-sm text-gray-600">Reportes y Estadísticas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Dashboard
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
        <div className={`transition-all duration-200 ${isFetching ? 'opacity-70 blur-sm' : 'opacity-100 blur-0'}`}>
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cultivo</label>
              <select
                value={filtros.cultivoId}
                onChange={(e) => handleFiltroChange('cultivoId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option className="text-black" value="">Todos</option>
                {cultivos.map(cultivo => (
                  <option className="text-black" key={cultivo.id} value={cultivo.id.toString()}>
                    {cultivo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Labor</label>
              <select
                value={filtros.laborId}
                onChange={(e) => handleFiltroChange('laborId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option className="text-black" value="">Todos</option>
                {tiposLabor.map(tipo => (
                  <option className="text-black" key={tipo.id} value={tipo.id.toString()}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trabajador</label>
              <select
                value={filtros.trabajadorId}
                onChange={(e) => handleFiltroChange('trabajadorId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option className="text-black" value="">Todos</option>
                {trabajadores.map(trabajador => (
                  <option className="text-black" key={trabajador.id} value={trabajador.id.toString()}>
                    {trabajador.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Producción Diaria */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Producción Diaria</h3>
            {produccionDiaria.length > 0 ? (
              <Line data={produccionDiariaChartData} options={chartOptions} />
            ) : (
              <p className="text-sm text-gray-500">No hay datos disponibles</p>
            )}
          </div>

          {/* Rendimiento por Lote */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Lote</h3>
            {rendimientoLote.length > 0 ? (
              <Bar data={rendimientoLoteChartData} options={chartOptions} />
            ) : (
              <p className="text-sm text-gray-500">No hay datos disponibles</p>
            )}
          </div>

          {/* Eficiencia por Trabajador */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Eficiencia por Trabajador</h3>
            {eficienciaTrabajador.length > 0 ? (
              <Doughnut data={eficienciaTrabajadorChartData} options={chartOptions} />
            ) : (
              <p className="text-sm text-gray-500">No hay datos disponibles</p>
            )}
          </div>

          {/* Histórico de Labores */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Labores</h3>
            {historicoLabores.length > 0 ? (
              <Line data={historicoLaboresChartData} options={chartOptions} />
            ) : (
              <p className="text-sm text-gray-500">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Tabla de Datos Detallados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Datos Detallados</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                Exportar PDF
              </button>
              <button
                type="button"
                onClick={() => handleExport('excel')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Exportar Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Labor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cultivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trabajador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {laboresDetallado.map((labor, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(labor.fecha_labor).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {labor.nombre_labor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {labor.nombre_cultivo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {labor.nombre_lote}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {labor.trabajador}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {labor.cantidad_recolectada}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {labor.peso_kg}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${labor.costo_aproximado}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFiltroChange('page', (pagination.page - 1).toString())}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <button
                  onClick={() => handleFiltroChange('page', (pagination.page + 1).toString())}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}


import DashboardLayout from '../DashboardLayout';

export default function ReportesPage() {
  return (
    <ProtectedRoute roles={[1,2]}>
      <DashboardLayout>
        <ReportesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
