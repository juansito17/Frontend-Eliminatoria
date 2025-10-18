'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext';

export interface LaborTipo {
  id_labor_tipo: number;
  nombre_labor: string;
  descripcion_labor?: string;
  requiere_cantidad: boolean;
  requiere_peso: boolean;
  fecha_creacion: string;
}

export interface CreateLaborTipoData {
  nombre_labor: string;
  descripcion_labor?: string;
  requiere_cantidad: boolean;
  requiere_peso: boolean;
}

export interface UpdateLaborTipoData extends CreateLaborTipoData {
  id_labor_tipo: number;
}

export const useLaboresTipos = () => {
  const [laboresTipos, setLaboresTipos] = useState<LaborTipo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener token desde AuthContext, cookies o localStorage
  const { token: authToken } = useAuth();
  const getAuthToken = (): string | null => {
    if (authToken) return authToken;
    const cookieToken = Cookies.get('token');
    if (cookieToken) return cookieToken;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Función para obtener todos los tipos de labores
  const fetchLaboresTipos = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('No se encontró token de autenticación');
        setLoading(false);
        return;
      }

      // Aseguramos una URL base válida con fallback local (puerto 3001) y sin sufijo /api
      const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const baseUrl = rawBase.replace(/\/+$/,'').replace(/\/api\/?$/i,'');
      const response = await fetch(`${baseUrl}/api/labores-tipos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido o expirado');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      setLaboresTipos(data.tiposLabor || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar tipos de labores';
      setError(errorMessage);
      console.error('Error al obtener tipos de labores:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo tipo de labor
  const createLaborTipo = async (data: CreateLaborTipoData): Promise<boolean> => {
    try {
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('No se encontró token de autenticación');
        return false;
      }

      const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const baseUrl = rawBase.replace(/\/+$/,'').replace(/\/api\/?$/i,'');
      const response = await fetch(`${baseUrl}/api/labores-tipos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Ya existe un tipo de labor con ese nombre');
        }
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido o expirado');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor: ${response.status}`);
      }

      // Recargar la lista después de crear
      await fetchLaboresTipos();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear tipo de labor';
      setError(errorMessage);
      console.error('Error al crear tipo de labor:', err);
      return false;
    }
  };

  // Actualizar un tipo de labor existente
  const updateLaborTipo = async (data: UpdateLaborTipoData): Promise<boolean> => {
    try {
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('No se encontró token de autenticación');
        return false;
      }

      const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const baseUrl = rawBase.replace(/\/+$/,'').replace(/\/api\/?$/i,'');
      const response = await fetch(`${baseUrl}/api/labores-tipos/${data.id_labor_tipo}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_labor: data.nombre_labor,
          descripcion_labor: data.descripcion_labor,
          requiere_cantidad: data.requiere_cantidad,
          requiere_peso: data.requiere_peso,
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Tipo de labor no encontrado');
        }
        if (response.status === 409) {
          throw new Error('Ya existe otro tipo de labor con ese nombre');
        }
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido o expirado');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor: ${response.status}`);
      }

      // Recargar la lista después de actualizar
      await fetchLaboresTipos();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al actualizar tipo de labor';
      setError(errorMessage);
      console.error('Error al actualizar tipo de labor:', err);
      return false;
    }
  };

  // Eliminar un tipo de labor
  const deleteLaborTipo = async (id: number): Promise<boolean> => {
    try {
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('No se encontró token de autenticación');
        return false;
      }

      const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const baseUrl = rawBase.replace(/\/+$/,'').replace(/\/api\/?$/i,'');
      const response = await fetch(`${baseUrl}/api/labores-tipos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Tipo de labor no encontrado');
        }
        if (response.status === 409) {
          throw new Error('No se puede eliminar el tipo de labor porque tiene labores agrícolas asociadas');
        }
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido o expirado');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor: ${response.status}`);
      }

      // Recargar la lista después de eliminar
      await fetchLaboresTipos();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al eliminar tipo de labor';
      setError(errorMessage);
      console.error('Error al eliminar tipo de labor:', err);
      return false;
    }
  };

  // Cargar los tipos de labores al montar el componente
  useEffect(() => {
    fetchLaboresTipos();
  }, []);

  return {
    laboresTipos,
    loading,
    error,
    createLaborTipo,
    updateLaborTipo,
    deleteLaborTipo,
    refetch: fetchLaboresTipos,
  };
};
