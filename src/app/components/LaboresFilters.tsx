'use client';

import { Cultivo, TipoLabor } from '../hooks/useLaboresAgricolas';

interface LaboresFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  cultivos: Cultivo[];
  tiposLabor: TipoLabor[];
  filtroCultivo: string;
  onFiltroCultivoChange: (cultivoId: string) => void;
  filtroTipoLabor: string;
  onFiltroTipoLaborChange: (tipoLaborId: string) => void;
}

export default function LaboresFilters({
  searchTerm,
  onSearchChange,
  cultivos,
  tiposLabor,
  filtroCultivo,
  onFiltroCultivoChange,
  filtroTipoLabor,
  onFiltroTipoLaborChange,
}: LaboresFiltersProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Buscar por trabajador, cultivo o lote..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
        />
      </div>
      <div className="flex gap-2">
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white appearance-none shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
          value={filtroCultivo || ''}
          onChange={(e) => onFiltroCultivoChange(e.target.value === '' ? '' : e.target.value)}
        >
          <option className="text-black" value="">Todos los cultivos</option>
          {cultivos.map(cultivo => (
            <option className="text-black" key={cultivo.id} value={cultivo.id}>{cultivo.nombre}</option>
          ))}
        </select>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white appearance-none shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
          value={filtroTipoLabor || ''}
          onChange={(e) => onFiltroTipoLaborChange(e.target.value === '' ? '' : e.target.value)}
        >
          <option className="text-black" value="">Todos los tipos</option>
          {tiposLabor.map(tipo => (
            <option className="text-black" key={tipo.id_labor_tipo} value={tipo.id_labor_tipo}>{tipo.nombre_labor}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
