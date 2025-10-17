'use client';

import { Cultivo, TipoLabor } from '../hooks/useLaboresAgricolas';

interface LaboresFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  cultivos: Cultivo[];
  tiposLabor: TipoLabor[];
}

export default function LaboresFilters({ searchTerm, onSearchChange, cultivos, tiposLabor }: LaboresFiltersProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Buscar por trabajador, cultivo o lote..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      <div className="flex gap-2">
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">Todos los cultivos</option>
          {cultivos.map(cultivo => (
            <option key={cultivo.id} value={cultivo.id}>{cultivo.nombre}</option>
          ))}
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">Todos los tipos</option>
          {tiposLabor.map(tipo => (
            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
