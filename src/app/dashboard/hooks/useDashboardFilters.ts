import { useState } from 'react';

export function useDashboardFilters() {
  const [filtroCultivo, setFiltroCultivo] = useState<string>('');
  const [filtroLote, setFiltroLote] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  return {
    filtroCultivo,
    setFiltroCultivo,
    filtroLote,
    setFiltroLote,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  };
}
