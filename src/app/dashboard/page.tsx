'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import io from 'socket.io-client';
import DashboardHeader from './components/DashboardHeader';
import StatsCards from './components/StatsCards';
import {
  DashboardData as DashboardDataType,
  HistoricalData,
  RendimientoItem,
  RendimientoTable,
  HistoricalChart,
  AlertsList,
  QuickActions,
} from './components/DashboardParts';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'diario' | 'semanal' | 'mensual'>('semanal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  // filtros maestros
  const [cultivos, setCultivos] = useState<{ id: number; nombre: string }[]>([]);
  const [lotes, setLotes] = useState<{ id: number; nombre: string }[]>([]);
  const [filtroCultivo, setFiltroCultivo] = useState<string>('');
  const [filtroLote, setFiltroLote] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const socketRef = useRef<any | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Error al obtener los datos del dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistoricalData = useCallback(async () => {
    try {
      const response = await fetch(`/api/dashboard/historical?periodo=${selectedPeriod}`);
      if (!response.ok) throw new Error('Error al obtener datos históricos');
      const data = await response.json();
      setHistoricalData(data);
    } catch (err) {
      console.error('Error fetching historical data:', err);
    }
  }, [selectedPeriod]);

  const fetchCultivos = useCallback(async () => {
    try {
      const res = await fetch('/api/cultivos');
      if (res.ok) {
        const data = await res.json();
        setCultivos(data.cultivos || data || []);
      }
    } catch (err) {
      console.error('Error cargando cultivos:', err);
    }
  }, []);

  const fetchLotes = useCallback(async () => {
    try {
      const res = await fetch('/api/lotes');
      if (res.ok) {
        const data = await res.json();
        setLotes(data.lotes || data || []);
      }
    } catch (err) {
      console.error('Error cargando lotes:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchHistoricalData();
    fetchCultivos();
    fetchLotes();

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Conectado al servidor de Socket.io');
    });

    socket.on('nueva-produccion-diaria', (data: any) => {
      console.log('Nueva producción diaria recibida:', data);
      fetchDashboardData();
    });

    socket.on('actualizacion-produccion-diaria', (data: any) => {
      console.log('Actualización de producción diaria recibida:', data);
      fetchDashboardData();
    });

    socket.on('eliminacion-produccion-diaria', (data: any) => {
      console.log('Eliminación de producción diaria recibida:', data);
      fetchDashboardData();
    });

    socket.on('nueva-alerta', (newAlert: any) => {
      console.log('Nueva alerta recibida:', newAlert);
      setAlerts((prev) => [...prev, newAlert]);
    });

    const polling = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor de Socket.io');
    });

    return () => {
      clearInterval(polling);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchDashboardData, fetchHistoricalData, fetchCultivos, fetchLotes]);

  const handleLogout = () => logout();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de vuelta!</h2>
          <p className="text-lg text-gray-600">Aquí tienes un resumen de tu actividad agrícola</p>
        </div>

        <StatsCards dashboardData={dashboardData} />

        <RendimientoTable rendimiento={dashboardData?.rendimiento_por_lote as RendimientoItem[] | undefined} />

        <HistoricalChart
          historicalData={historicalData}
          selectedPeriod={selectedPeriod}
          onPeriodChange={(p) => setSelectedPeriod(p)}
        />

        <AlertsList alerts={alerts} />

        <QuickActions />
      </main>
    </div>
  );
}
