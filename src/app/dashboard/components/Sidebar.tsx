import React from 'react';

interface SidebarProps {
  rol?: number | null;
  username?: string | null;
}

import { useState } from 'react';

export default function Sidebar({ rol, username }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white shadow-lg z-40 flex flex-col justify-between transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div>
        <div className="flex items-center px-2 py-6 border-b border-gray-200">
          <button
            className="mr-2 p-2 rounded hover:bg-blue-100"
            title={collapsed ? 'Expandir menú' : 'Recoger menú'}
            onClick={() => setCollapsed((c) => !c)}
          >
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16m-7-7l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m7-7l-7 7 7 7" />
              )}
            </svg>
          </button>
          {!collapsed && (
            <>
              <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-xl font-bold">{username?.charAt(0)?.toUpperCase() || ''}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">AgroNexo</h2>
                <p className="text-xs text-gray-500">Panel de Control</p>
              </div>
            </>
          )}
        </div>
        <nav className={`mt-8 ${collapsed ? 'px-1' : 'px-6'} space-y-2`}>
          {/* Admin */}
          {rol === 1 && (
            <>
              <SidebarLink href="/dashboard" label="Dashboard Global" collapsed={collapsed} />
              <SidebarLink href="/usuarios" label="Gestión de Usuarios" collapsed={collapsed} />
              <SidebarLink href="/roles" label="Gestión de Roles" collapsed={collapsed} />
              <SidebarLink href="/cultivos" label="Cultivos" collapsed={collapsed} />
              <SidebarLink href="/lotes" label="Lotes" collapsed={collapsed} />
              <SidebarLink href="/labores-tipos" label="Tipos de Labor" collapsed={collapsed} />
              <SidebarLink href="/labores-agricolas" label="Labores Agrícolas" collapsed={collapsed} />
              <SidebarLink href="/reportes" label="Reportes" collapsed={collapsed} />
              <SidebarLink href="/alertas" label="Alertas" collapsed={collapsed} />
            </>
          )}
          {/* Supervisor */}
          {rol === 2 && (
            <>
              <SidebarLink href="/dashboard" label="Dashboard" collapsed={collapsed} />
              <SidebarLink href="/labores-agricolas" label="Labores Agrícolas" collapsed={collapsed} />
              <SidebarLink href="/reportes" label="Reportes" collapsed={collapsed} />
              <SidebarLink href="/asignaciones" label="Asignar Labores/Lotes" collapsed={collapsed} />
              <SidebarLink href="/alertas" label="Alertas" collapsed={collapsed} />
            </>
          )}
          {/* Operario */}
          {rol === 3 && (
            <>
              <SidebarLink href="/registro-labor" label="Registrar Labor" collapsed={collapsed} />
              <SidebarLink href="/mis-labores" label="Mis Labores" collapsed={collapsed} />
              <SidebarLink href="/alertas" label="Notificaciones" collapsed={collapsed} />
            </>
          )}
        </nav>
      </div>
      <div className={`py-4 border-t border-gray-200 ${collapsed ? 'px-1' : 'px-6'}`}>
        {!collapsed && (
          <span className="text-xs text-gray-500">Hola, {username || 'Usuario'} | Rol: {rol ?? 'Sin rol'}</span>
        )}
      </div>
    </aside>
  );
}

const icons: Record<string, React.ReactNode> = {
  'Dashboard Global': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" /></svg>,
  'Dashboard': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" /></svg>,
  'Gestión de Usuarios': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>,
  'Gestión de Roles': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  'Cultivos': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>,
  'Lotes': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>,
  'Tipos de Labor': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  'Labores Agrícolas': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'Reportes': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  'Alertas': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'Asignar Labores/Lotes': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  'Registrar Labor': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'Mis Labores': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>,
  'Notificaciones': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" /></svg>
};

function SidebarLink({ href, label, collapsed }: { href: string; label: string; collapsed?: boolean }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-2 py-2 ${collapsed ? 'px-2 justify-center' : 'px-4'} rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors`}
      title={label}
    >
      {icons[label]}
      {!collapsed && label}
    </a>
  );
}
