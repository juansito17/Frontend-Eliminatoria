'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="h-9 w-9 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">AgroTech</h1>
              <p className="text-xs text-gray-500">Sistema Agrícola Inteligente</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">Dashboard</Link>

            {/* Operarios: acceso a registro y mis labores */}
            {user?.rol === 3 && (
              <>
                <Link href="/registro-labor" className="text-sm text-blue-600 hover:text-blue-800">Registrar Labor</Link>
                <Link href="/mis-labores" className="text-sm text-blue-600 hover:text-blue-800">Mis Labores</Link>
              </>
            )}

            {/* Supervisores: acceso a labores y alertas */}
            {user?.rol === 2 && (
              <>
                <Link href="/labores-agricolas" className="text-sm text-blue-600 hover:text-blue-800">Gestión de Labores</Link>
                <Link href="/alertas" className="text-sm text-blue-600 hover:text-blue-800">Alertas</Link>
                <Link href="/reportes" className="text-sm text-blue-600 hover:text-blue-800">Reportes</Link>
              </>
            )}

            {/* Administradores: acceso completo */}
            {user?.rol === 1 && (
              <>
                <Link href="/usuarios" className="text-sm text-blue-600 hover:text-blue-800">Usuarios</Link>
                <Link href="/cultivos" className="text-sm text-blue-600 hover:text-blue-800">Cultivos</Link>
                <Link href="/lotes" className="text-sm text-blue-600 hover:text-blue-800">Lotes</Link>
                <Link href="/labores-tipos" className="text-sm text-blue-600 hover:text-blue-800">Tipos de Labor</Link>
                <Link href="/reportes" className="text-sm text-blue-600 hover:text-blue-800">Reportes</Link>
                <Link href="/alertas" className="text-sm text-blue-600 hover:text-blue-800">Alertas</Link>
              </>
            )}

            {/* Common user info / logout */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <span className="text-sm text-gray-700">Hola, {user?.username || 'Usuario'}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
                title="Cerrar sesión"
              >
                Cerrar
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
