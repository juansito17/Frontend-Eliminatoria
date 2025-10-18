import React from 'react';

export function AlertsList({ alerts }: { alerts: any[] }) {
  return (
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
  );
}
