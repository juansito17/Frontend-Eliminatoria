'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../DashboardLayout';
import StatsCards from './components/StatsCards';
import {
  RendimientoTable,
  HistoricalChart,
  AlertsList,
  QuickActions,
} from './components/DashboardParts';
import { useDashboardData } from './hooks/useDashboardData';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import type { RendimientoItem } from './types';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const handleLogout = () => logout();

  const { dashboardData, loading, error } = useDashboardData();
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'diario' | 'semanal' | 'mensual'>('semanal');
  const [alerts, setAlerts] = useState<any[]>([]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {String(error)}</div>;
  }

  // Roles: 1=Admin, 2=Supervisor, 3=Operario
  const rol = user?.rol;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar rol={rol} username={user?.username} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de vuelta!</h2>
            <p className="text-lg text-gray-600">Panel personalizado según tu rol</p>
          </div>

          {/* Administrador: acceso total */}
          {rol === 1 && (
            <>
              <StatsCards dashboardData={dashboardData} />
              <RendimientoTable rendimiento={dashboardData?.rendimiento_por_lote as RendimientoItem[] | undefined} />
              <HistoricalChart
                historicalData={historicalData}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
              <AlertsList alerts={alerts} />
              <QuickActions />
            </>
          )}

          {/* Supervisor: dashboard, labores, reportes, asignaciones, alertas */}
          {rol === 2 && (
            <>
              <StatsCards dashboardData={dashboardData} />
              <RendimientoTable rendimiento={dashboardData?.rendimiento_por_lote as RendimientoItem[] | undefined} />
              <HistoricalChart
                historicalData={historicalData}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
              <AlertsList alerts={alerts} />
            </>
          )}

          {/* Operario: solo labores propias y notificaciones personales */}
          {rol === 3 && (
            <>
              <AlertsList alerts={alerts} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
