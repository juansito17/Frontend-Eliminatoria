"use client";

import React from 'react';
import Sidebar from './dashboard/components/Sidebar';
import DashboardHeader from './dashboard/components/DashboardHeader';
import { useAuth } from './context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const rol = user?.rol;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar rol={rol} username={user?.username} />
      <div className="flex-1 flex flex-col ml-16 md:ml-64">
        <DashboardHeader user={user} onLogout={logout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
