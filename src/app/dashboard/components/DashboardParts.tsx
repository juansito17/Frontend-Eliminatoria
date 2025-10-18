'use client';

import React from 'react';
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

/**
 * Tipos
 */
export interface RendimientoItem {
  nombre_lote: string;
  peso_total_lote: number;
}

export interface DashboardData {
  total_peso_kg: number;
  trabajadores_activos: number;
  cultivos_activos: number;
  eficiencia_porcentaje: number;
  rendimiento_por_lote: RendimientoItem[];
  costo_total_aproximado: number;
}

export interface HistoricalData {
  periodo: string;
  total_peso_kg: number;
  trabajadores_unicos: number;
  productividad_promedio_dia: number;
  costo_total_aproximado: number;
}

/**
 * Rendimiento por lote (tabla)
 */
export function RendimientoTable({ rendimiento }: { rendimiento?: RendimientoItem[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Rendimiento por Lote (Hoy)</h3>
      {rendimiento && rendimiento.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
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
              {rendimiento.map((item, index) => (
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
  );
}

/**
 * Gráfica de producción histórica
 */
export function HistoricalChart({
  historicalData,
  selectedPeriod,
  onPeriodChange,
}: {
  historicalData: HistoricalData[];
  selectedPeriod: 'diario' | 'semanal' | 'mensual';
  onPeriodChange: (p: 'diario' | 'semanal' | 'mensual') => void;
}) {
  const formatPeriodo = (p: string) => {
    if (!p) return p;
    if (/\d{4}-\d{2}-\d{2}T/.test(p)) {
      const d = new Date(p);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }
    return p;
  };

  const chartData = {
    labels: historicalData.map((data) => formatPeriodo(String(data.periodo))),
    datasets: [
      {
        label: 'Producción Total (kg)',
        data: historicalData.map((data) => Number(data.total_peso_kg) || 0),
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Producción Histórica</h3>
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mb-3 sm:mb-4">
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value as 'diario' | 'semanal' | 'mensual')}
          className="mt-1 block w-full sm:w-40 pl-3 pr-10 py-2 text-xs sm:text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
        >
          <option value="diario">Diario</option>
          <option value="semanal">Semanal</option>
          <option value="mensual">Mensual</option>
        </select>
      </div>
      {historicalData.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <p className="text-xs sm:text-sm text-gray-500">No hay datos históricos disponibles.</p>
      )}
    </div>
  );
}

/**
 * Lista de alertas
 */
export function AlertsList({ alerts }: { alerts: any[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Alertas</h3>
      {alerts.length > 0 ? (
        <div className="space-y-2 sm:space-y-4">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-red-900">{alert.tipo_alerta}: {alert.descripcion}</p>
                <p className="text-xs text-red-600">Nivel: {alert.nivel_severidad}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-gray-500">No hay alertas activas.</p>
      )}
    </div>
  );
}

/**
 * Acciones rápidas
 */
export function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Acciones Rápidas</h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <a href="/labores-agricolas" className="p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg border border-green-200 transition-all duration-200 group">
          <div className="flex flex-col items-center text-center">
            <svg className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium text-green-800">Nueva Labor</span>
          </div>
        </a>
        <a href="/reportes" className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 transition-all duration-200 group">
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
        <a href="/alertas" className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-lg border border-yellow-200 transition-all duration-200 group">
          <div className="flex flex-col items-center text-center">
            <svg className="h-8 w-8 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-yellow-800">Alertas</span>
          </div>
        </a>
      </div>
    </div>
  );
}
