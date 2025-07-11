'use client';

import { useAuth, useProtectedRoute } from "@/hooks/use-auth/page";
import ProtectedRoute from "@/components/protected-route/page";
import { LogOut, User, BriefcaseBusiness, FileText, Clock, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
    const { user, logout, loading } = useAuth();
    // const { isAuthenticated } = useProtectedRoute('E');

    // console.log('Dashboard - Loading:', loading);
    // console.log('Dashboard - User:', user);

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Cargando datos del usuario...</p>
                </div>
                </div>
            </ProtectedRoute>
            );
        }

    if (!user || user.level_user !== 'E') {
        return (
            <ProtectedRoute>
                <div className="flex justify-center items-center min-h-screen bg-gray-100">
                    <div className="text-center">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <p>Error: No se pudieron cargar los datos del usuario</p>
                            <p className="text-sm mt-2">Loading: {loading ? 'true' : 'false'}</p>
                            <p className="text-sm">User: {user ? 'existe' : 'null'}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                            Cerrar sesión e intentar de nuevo
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <User className="h-8 w-8 text-green-600" />
                                    <h1 className="text-xl font-semibold text-gray-900">Panel de Empleado</h1>
                                </div>
                            </div>
                        
                            <div className="flex items-center space-x-4">
                                {/* <span className="text-sm text-gray-600">
                                    {user.name_user} {user.ape_pat_user}
                                </span> */}
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                                    <LogOut className="h-5 w-5" />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">¡Bienvenido, {user.name_user}!</h2>
                            <p className="text-green-100">Gestiona tus documentos y tareas desde aquí.</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Documentos Pendientes</p>
                                    <p className="text-2xl font-bold text-gray-900">8</p>
                                </div>
                                <Clock className="h-8 w-8 text-orange-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Documentos Procesados</p>
                                    <p className="text-2xl font-bold text-gray-900">24</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Documentos</p>
                                    <p className="text-2xl font-bold text-gray-900">32</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* User Info Card */}
                    <div className="grid grid-cols-10 gap-6 mb-8">
                        <div className="col-span-4 bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Mi Información</h3>
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Nombres y Apellidos:</span>
                                    <span className="text-gray-900">{user.name_user} {user.ape_pat_user} {user.ape_mat_user}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Usuario:</span>
                                    <span className="text-gray-900">@{user.nick_user}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Documento de Identidad:</span>
                                    <span className="text-gray-900">{user.dni_user}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Estado:</span>
                                    <span className={`font-semibold ${user.status_user === 'A' ? 'text-green-600' : 'text-red-600'}`}>
                                        {user.status_user === 'A' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-6 bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Mi Oficina</h3>
                                <BriefcaseBusiness className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Oficina:</span>
                                    <span className="text-gray-900">{user.office.name_offi}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Descripción:</span>
                                    <span className="text-gray-900">{user.office.desc_offi}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Estado:</span>
                                    <span className={`font-semibold ${user.office.status_offi === 'A' ? 'text-green-600' : 'text-red-600'}`}>
                                        {user.office.status_offi === 'A' ? 'Activa' : 'Inactiva'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Documento procesado</p>
                                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Nuevo documento asignado</p>
                                    <p className="text-xs text-gray-500">Hace 4 horas</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Revisión completada</p>
                                    <p className="text-xs text-gray-500">Ayer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}