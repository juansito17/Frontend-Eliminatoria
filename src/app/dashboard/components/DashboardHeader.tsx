'use client';

import React from 'react';


interface Props {
  user?: { username?: string | null; rol?: number | null } | null;
  onLogout: () => void;
  className?: string;
}

export default function DashboardHeader({ user, onLogout, className }: Props) {
  const rol = user?.rol;
  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className || ''}`}>
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
            {/* Admin: todos los accesos */}
            {rol === 1 && (
              <>
                <a href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Dashboard Global</a>
                <a href="/usuarios" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Gestión de Usuarios</a>
                <a href="/roles" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Gestión de Roles</a>
                <a href="/cultivos" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Cultivos</a>
                <a href="/lotes" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Lotes</a>
                <a href="/labores-tipos" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Tipos de Labor</a>
                <a href="/labores-agricolas" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Labores Agrícolas</a>
                <a href="/reportes" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Reportes</a>
                <a href="/alertas" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Alertas</a>
              </>
            )}
            {/* Supervisor: dashboard, labores, reportes, asignaciones, alertas */}
            {rol === 2 && (
              <>
                <a href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Dashboard</a>
                <a href="/labores-agricolas" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Labores Agrícolas</a>
                <a href="/reportes" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Reportes</a>
                <a href="/asignaciones" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Asignar Labores/Lotes</a>
                <a href="/alertas" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Alertas</a>
              </>
            )}
            {/* Operario: solo registro y consulta de labores propias, notificaciones personales */}
            {rol === 3 && (
              <>
                <a href="/registro-labor" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Registrar Labor</a>
                <a href="/mis-labores" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Mis Labores</a>
                <a href="/alertas" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Notificaciones</a>
              </>
            )}
            <span className="text-sm text-gray-700">Hola, {user?.username || 'Usuario'}</span>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Cerrar sesión"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{user?.username?.charAt(0)?.toUpperCase?.() || ''}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
