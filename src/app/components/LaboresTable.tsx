'use client';

import { LaborAgricola } from '../hooks/useLaboresAgricolas';
import { User } from '../context/AuthContext'; // Importar la interfaz User

interface LaboresTableProps {
  labores: LaborAgricola[];
  isLoading: boolean;
  onEdit: (labor: LaborAgricola) => void;
  onDelete: (id: number) => void;
  currentUser: User | null; // Añadir currentUser a las props
}

export default function LaboresTable({ labores, isLoading, onEdit, onDelete, currentUser }: LaboresTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando labores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Cultivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Lote
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Trabajador
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tipo Labor
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Peso (kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Hora
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {labores.map((labor) => (
              <tr key={labor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(labor.fecha).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {labor.cultivo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {labor.lote}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {labor.trabajador}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {labor.tipoLabor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {labor.cantidadRecolectada}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {labor.peso}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {labor.hora}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {(currentUser?.rol === 1 || currentUser?.rol === 2 || (currentUser?.rol === 3 && currentUser?.id === labor.id_usuario_registro)) && (
                      <button
                        onClick={() => onEdit(labor)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 px-3 py-1 rounded-md text-xs font-medium transition-colors border border-blue-200"
                      >
                        Editar
                      </button>
                    )}
                    {currentUser?.rol === 1 && ( // Solo el Administrador (rol 1) puede eliminar
                      <button
                        onClick={() => onDelete(labor.id)}
                        className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 px-3 py-1 rounded-md text-xs font-medium transition-colors border border-red-200"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {labores.length === 0 && (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay labores registradas</h3>
            <p className="text-gray-600">Comienza registrando una nueva labor agrícola.</p>
          </div>
        )}
      </div>
    </div>
  );
}
