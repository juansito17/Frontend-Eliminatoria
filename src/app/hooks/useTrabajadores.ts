import { useState, useEffect, useCallback } from 'react';

interface Trabajador {
  id: number;
  nombre_completo: string;
  codigo_trabajador: string;
  activo: boolean;
  fecha_creacion: string;
}

interface TrabajadorInput {
  nombre_completo: string;
  codigo_trabajador: string;
  activo?: boolean;
}

export const useTrabajadores = () => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Función para hacer peticiones a la API
  const makeApiCall = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Obtener todos los trabajadores
  const fetchTrabajadores = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await makeApiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/trabajadores`);
      setTrabajadores(data.trabajadores || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al obtener trabajadores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo trabajador
  const createTrabajador = async (trabajadorData: TrabajadorInput) => {
    setLoading(true);
    setError(null);

    try {
      const data = await makeApiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/trabajadores`, {
        method: 'POST',
        body: JSON.stringify(trabajadorData),
      });

      // Recargar la lista de trabajadores
      await fetchTrabajadores();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear trabajador');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un trabajador existente
  const updateTrabajador = async (id: number, trabajadorData: TrabajadorInput) => {
    setLoading(true);
    setError(null);

    try {
      const data = await makeApiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/trabajadores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(trabajadorData),
      });

      // Recargar la lista de trabajadores
      await fetchTrabajadores();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar trabajador');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un trabajador
  const deleteTrabajador = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const data = await makeApiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/trabajadores/${id}`, {
        method: 'DELETE',
      });

      // Recargar la lista de trabajadores
      await fetchTrabajadores();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar trabajador');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar trabajadores al montar el componente
  useEffect(() => {
    fetchTrabajadores();
  }, [fetchTrabajadores]);

  return {
    trabajadores,
    loading,
    error,
    fetchTrabajadores,
    createTrabajador,
    updateTrabajador,
    deleteTrabajador,
  };
};
