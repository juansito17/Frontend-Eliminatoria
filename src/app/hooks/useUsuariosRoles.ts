import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export interface Usuario {
  id: number;
  username?: string;
  nombre?: string;
  nombre_usuario?: string;
  apellido?: string;
  email?: string;
  rol?: number;
  id_rol?: number;
  estado?: string;
  activo?: number | boolean;
  fecha_creacion?: string;
}

export interface UsuarioFormData {
  username: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  rol?: number;
  estado?: string;
}

export interface UseUsuariosReturn {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;
  fetchUsuarios: () => Promise<void>;
  createUsuario: (data: UsuarioFormData) => Promise<void>;
  updateUsuario: (id: number, data: UsuarioFormData) => Promise<void>;
  deleteUsuario: (id: number) => Promise<void>;
}

export const useUsuarios = (): UseUsuariosReturn => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    if (!token) {
      setError('No hay token de autenticación disponible.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/usuarios', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error HTTP: ${res.status}`);
      }
      const data = await res.json();
      // Normalizar campos para evitar que falten nombres/roles según respuesta del backend
      const normalizedUsuarios = (data.usuarios || []).map((u: any) => {
        const nombre_completo = u.nombre_completo || u.full_name || `${u.nombre || u.nombre_usuario || ''} ${u.apellido || ''}`.trim();
        return {
          ...u,
          id: Number(u.id ?? u.user_id ?? 0),
          username: u.username || u.nombre_usuario || u.email || nombre_completo || '',
          nombre: u.nombre || u.nombre_usuario || (nombre_completo ? nombre_completo.split(' ')[0] : '') || '',
          apellido: u.apellido || u.apellido_usuario || (nombre_completo ? nombre_completo.split(' ').slice(1).join(' ') : '') || '',
          nombre_completo,
          id_rol: Number(u.id_rol ?? u.rol ?? u.role_id ?? u.idRole ?? 0) || undefined,
          activo: u.activo !== undefined ? (u.activo === 1 || u.activo === true) : (u.estado === 'activo' ? true : (u.estado === 'inactivo' ? false : undefined)),
        };
      });
      setUsuarios(normalizedUsuarios);
    } catch (err: any) {
      console.error('Error al obtener usuarios:', err);
      setError(err.message || 'Error desconocido al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createUsuario = useCallback(async (data: UsuarioFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error HTTP: ${res.status}`);
      }
      await fetchUsuarios();
    } catch (err: any) {
      console.error('Error al crear usuario:', err);
      setError(err.message || 'Error desconocido al crear el usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios, token]);

  const updateUsuario = useCallback(async (id: number, data: UsuarioFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error HTTP: ${res.status}`);
      }
      await fetchUsuarios();
    } catch (err: any) {
      console.error('Error al actualizar usuario:', err);
      setError(err.message || 'Error desconocido al actualizar el usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios, token]);

  const deleteUsuario = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error HTTP: ${res.status}`);
      }
      await fetchUsuarios();
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err);
      setError(err.message || 'Error desconocido al eliminar el usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios, token]);

  return {
    usuarios,
    loading,
    error,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
  };
};

/* ----------------- Roles ----------------- */

export interface Role {
  id: number;
  nombre?: string;
  nombre_rol?: string;
  descripcion?: string;
  descripcion_rol?: string;
  fecha_creacion?: string;
}

export interface RoleFormData {
  nombre_rol: string;
  descripcion_rol?: string;
}

export interface UseRolesReturn {
  roles: Role[];
  loading: boolean;
  error: string | null;
  fetchRoles: () => Promise<void>;
  createRole: (data: RoleFormData) => Promise<void>;
  updateRole: (id: number, data: RoleFormData) => Promise<void>;
  deleteRole: (id: number) => Promise<void>;
}

export const useRoles = (): UseRolesReturn => {
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    if (!token) {
      setError('No hay token de autenticación disponible.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/roles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error HTTP: ${res.status}`);
      }
      const data = await res.json();
      // Normalizar campos de roles (asegurar id numérico y nombre consistente)
      const normalizedRoles = (data.roles || []).map((r: any) => ({
        ...r,
        id: Number(r.id ?? r.id_rol ?? r.role_id ?? 0),
        nombre: r.nombre || r.nombre_rol || r.nombre_completo || r.name || '',
        descripcion: r.descripcion || r.descripcion_rol || '',
      }));
      setRoles(normalizedRoles);
    } catch (err: any) {
      console.error('Error al obtener roles:', err);
      setError(err.message || 'Error desconocido al cargar los roles');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createRole = useCallback(async (data: RoleFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error HTTP: ${res.status}`);
      }
      await fetchRoles();
    } catch (err: any) {
      console.error('Error al crear role:', err);
      setError(err.message || 'Error desconocido al crear el role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRoles, token]);

  const updateRole = useCallback(async (id: number, data: RoleFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error HTTP: ${res.status}`);
      }
      await fetchRoles();
    } catch (err: any) {
      console.error('Error al actualizar role:', err);
      setError(err.message || 'Error desconocido al actualizar el role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRoles, token]);

  const deleteRole = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/roles/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error HTTP: ${res.status}`);
      }
      await fetchRoles();
    } catch (err: any) {
      console.error('Error al eliminar role:', err);
      setError(err.message || 'Error desconocido al eliminar el role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRoles, token]);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
};
