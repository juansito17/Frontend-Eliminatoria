import React from 'react';

interface TrabajadoresFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: 'todos' | 'activos' | 'inactivos';
  onStatusFilterChange: (status: 'todos' | 'activos' | 'inactivos') => void;
}

const TrabajadoresFilters: React.FC<TrabajadoresFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Campo de búsqueda */}
        <div className="flex-1 w-full md:w-auto">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar trabajadores
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Filtro de estado */}
        <div className="w-full md:w-auto">
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'todos' | 'activos' | 'inactivos')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="todos">Todos los trabajadores</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="mt-3 text-sm text-gray-600">
        {searchTerm || statusFilter !== 'todos' ? (
          <p>
            Filtros aplicados: {searchTerm && `Búsqueda: "${searchTerm}"`}
            {searchTerm && statusFilter !== 'todos' && ' | '}
            {statusFilter !== 'todos' && `Estado: ${statusFilter === 'activos' ? 'Activos' : 'Inactivos'}`}
          </p>
        ) : (
          <p>Mostrando todos los trabajadores</p>
        )}
      </div>
    </div>
  );
};

export default TrabajadoresFilters;
