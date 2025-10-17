import { useState, useCallback } from 'react';

export interface Cultivo {
  id_cultivo: number;
  nombre_cultivo: string;
  descripcion_cultivo: string;
  fecha_creacion: string;
}

export interface CultivoFormData {
  nombre_cultivo: string;
  descripcion_cultivo: string;
}

export interface UseCultivosReturn {
  cultivos: Cultivo[];
  loading: boolean;
  error: string | null;
  fetchCultivos: () => Promise<void>;
  createCultivo: (data: CultivoFormData) => Promise<void>;
  updateCultivo: (id: number, data: CultivoFormData) => Promise<void>;
  deleteCultivo: (id: number) => Promise<void>;
}

export const useCultivos = (): UseCultivosReturn => {
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCultivos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cultivos');

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      setCultivos(data);
    } catch (err: any) {
      console.error('Error al obtener cultivos:', err);
      setError(err.message || 'Error desconocido al cargar los cultivos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCultivo = useCallback(async (data: CultivoFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cultivos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      // Recargar la lista después de crear
      await fetchCultivos();
    } catch (err: any) {
      console.error('Error al crear cultivo:', err);
      setError(err.message || 'Error desconocido al crear el cultivo');
      throw err; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [fetchCultivos]);

  const updateCultivo = useCallback(async (id: number, data: CultivoFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cultivos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      // Recargar la lista después de actualizar
      await fetchCultivos();
    } catch (err: any) {
      console.error('Error al actualizar cultivo:', err);
      setError(err.message || 'Error desconocido al actualizar el cultivo');
      throw err; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [fetchCultivos]);

  const deleteCultivo = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cultivos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      // Recargar la lista después de eliminar
      await fetchCultivos();
    } catch (err: any) {
      console.error('Error al eliminar cultivo:', err);
      setError(err.message || 'Error desconocido al eliminar el cultivo');
      throw err; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [fetchCultivos]);

  return {
    cultivos,
    loading,
    error,
    fetchCultivos,
    createCultivo,
    updateCultivo,
    deleteCultivo,
  };
};
