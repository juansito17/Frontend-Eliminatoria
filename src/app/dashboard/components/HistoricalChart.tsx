
import React from 'react';
import { Line } from 'react-chartjs-2';
import { HistoricalData } from '../types';
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Producción Histórica</h3>
      <div className="flex justify-end mb-4">
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value as 'diario' | 'semanal' | 'mensual')}
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
  );
}
