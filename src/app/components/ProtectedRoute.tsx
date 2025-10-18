'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: number[]; // Allowed roles (1=Admin,2=Supervisor,3=Operario)
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect to login
  }

  // If roles are specified, enforce role-based UI access
  if (roles && user && !roles.includes(user.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white rounded-xl shadow p-6 max-w-md text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No autorizado</h3>
          <p className="text-sm text-gray-600">No tienes permisos para acceder a esta vista.</p>
          <div className="mt-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
