import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export interface LaborAgricola {
  id: number;
  fecha: string;
  cultivo: string;
  lote: string;
  trabajador: string;
  tipoLabor: string;
  cantidadRecolectada: number;
  peso: number;
  hora: string;
  ubicacionGPS?: string;
  id_usuario_registro: number; // Añadido para permisos de operario
}

export interface Cultivo {
  id: number;
  nombre: string;
}

export interface Trabajador {
  id: number;
  nombre: string;
}

export interface TipoLabor {
  id: number;
  nombre: string;
}

export interface Lote {
  id: number;
  nombre: string;
}

export function useLaboresAgricolas() {
  const { token } = useAuth();

  const [labores, setLabores] = useState<LaborAgricola[]>([]);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [tiposLabor, setTiposLabor] = useState<TipoLabor[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCultivo, setFiltroCultivo] = useState<string>('');
  const [filtroTipoLabor, setFiltroTipoLabor] = useState<string>('');
  const itemsPerPage = 10;

  const loadLabores = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      let url = `/api/labores-agricolas?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`;
      if (filtroCultivo) {
        url += `&cultivoId=${filtroCultivo}`;
      }
      if (filtroTipoLabor) {
        url += `&tipoLaborId=${filtroTipoLabor}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLabores(data.labores || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading labores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCultivos = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/cultivos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCultivos(data.cultivos || []);
      }
    } catch (error) {
      console.error('Error loading cultivos:', error);
    }
  };

  const loadTrabajadores = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/trabajadores', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrabajadores(data.trabajadores || []);
      }
    } catch (error) {
      console.error('Error loading trabajadores:', error);
    }
  };

  const loadTiposLabor = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/labores-tipos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTiposLabor(data.tiposLabor || []);
      }
    } catch (error) {
      console.error('Error loading tipos de labor:', error);
    }
  };

  const loadLotes = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/lotes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Esperamos { lotes: [...] } o directamente array
        setLotes(data.lotes || data || []);
      }
    } catch (error) {
      console.error('Error loading lotes:', error);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reiniciar a la primera página cuando cambian los filtros
  }, [searchTerm, filtroCultivo, filtroTipoLabor]);

  useEffect(() => {
    loadLabores();
  }, [currentPage, searchTerm, filtroCultivo, filtroTipoLabor, token]);

  useEffect(() => {
    loadCultivos();
    loadTrabajadores();
    loadTiposLabor();
    loadLotes();
  }, [token]);

  return {
    labores,
    cultivos,
    trabajadores,
    tiposLabor,
    lotes,
    isLoading,
    currentPage,
    totalPages,
    searchTerm,
    setCurrentPage,
    setSearchTerm,
    filtroCultivo,
    setFiltroCultivo,
    filtroTipoLabor,
    setFiltroTipoLabor,
    loadLabores,
    setLabores,
    loadLotes,
    setLotes
  };
}
