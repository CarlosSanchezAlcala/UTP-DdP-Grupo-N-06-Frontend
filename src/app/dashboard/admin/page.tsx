'use client';

import { useAuth, useProtectedRoute } from "@/hooks/use-auth/page";
import ProtectedRoute from "@/components/protected-route/page";
import { LogOut, User as UserIcon, Users, Shield, Plus } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import axiosClient from '@/lib/axios';
import { User, CreateUserRequest, Office, CreateOfficeRequest, Document } from '@/utils/types/projects';

export default function AdminDashboard() {
    const { user, logout, loading } = useAuth();
    const { isAuthenticated } = useProtectedRoute('A');
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState('');
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [offices, setOffices] = useState<Office[]>([]);
    const [officesLoading, setOfficesLoading] = useState(true);
    const [officesError, setOfficesError] = useState('');
    const [isCreatingOffice, setIsCreatingOffice] = useState(false);
    const [showCreateOfficeModal, setShowCreateOfficeModal] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState(true);
    const [documentsError, setDocumentsError] = useState('');
    const [isCreatingDocument, setIsCreatingDocument] = useState(false);
    const [showCreateDocumentModal, setShowCreateDocumentModal] = useState(false);
    
    // console.log('Dashboard - Loading:', loading);
    // console.log('Dashboard - User:', user);

    const fetchUsers = async () => {
            try {
                setUsersLoading(true);
                const response = await axiosClient.get('/users');
                setUsers(response.data as User[]);
            } catch (error) {
                console.error('Error al cargar usuarios:', error);
                setUsersError('Error al cargar la lista de usuarios');
            } finally {
                setUsersLoading(false);
            }
        };

    const fetchOffices = async () => {
        try {
            setOfficesLoading(true);
            const response = await axiosClient.get('/offices');
            setOffices(response.data as Office[]);
        } catch (error) {
            console.error('Error al cargar oficinas:', error);
            setOfficesError('Error al cargar la lista de oficinas');
        } finally {
            setOfficesLoading(false);
        }
    }

    const fetchDocuments = async () => {
        try {
            setDocumentsLoading(true);
            const response = await axiosClient.get('/documents');
            setDocuments(response.data as Document[]);
        } catch (error) {
            console.error('Error al cargar documentos:', error);
            setDocumentsError('Error al cargar la lista de documentos');
        } finally {
            setDocumentsLoading(false);
        }
    }

    const createUser = async (userRequest: CreateUserRequest) => {
        try {
            setIsCreatingUser(true);
            const response = await axiosClient.post('/users', userRequest);
            await fetchUsers();
            setShowCreateUserModal(false);
            return response.data;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        } finally {
            setIsCreatingUser(false);
        }
    }

    const createOffice = async (officeRequest: CreateOfficeRequest) => {
        try {
            setIsCreatingOffice(true);
            const response = await axiosClient.post('/offices', officeRequest);
            await fetchOffices();
            setShowCreateOfficeModal(false);
            return response.data;
        } catch (error) {
            console.error('Error al crear oficina:', error);
            throw error;
        } finally {
            setIsCreatingOffice(false);
        }
    }

    const createDocument = async (formData: FormData) => {
        try {
            setIsCreatingDocument(true);

            console.log('=== DEBUG FormData ===');
            for (const pair of formData.entries()) {
                console.log(pair[0], ':', pair[1]);
                if (pair[1] instanceof File) {
                    console.log(`  - File name: ${pair[1].name}`);
                    console.log(`  - File size: ${pair[1].size} bytes`);
                    console.log(`  - File type: ${pair[1].type}`);
                }
            }

            const response = await axiosClient.post('/documents', formData, {
                headers: {
                    'Accept': 'application/json',
                },
            });
            await fetchDocuments();
            setShowCreateDocumentModal(false);
            return response.data;
        } catch (error) {
            console.error('Error al crear trámite:', error);
            throw error;
        } finally {
            setIsCreatingDocument(false);
        }
    }

    const stats = useMemo(() => ({
        totalUsers: users.length,
        admins: users.filter(u => u.level_user === 'A').length,
        employees: users.filter(u => u.level_user === 'E').length,
        active: users.filter(u => u.status_user === 'A').length,
        inactive: users.filter(u => u.status_user === 'I').length
    }), [users]);

    useEffect(() => {
        if (isAuthenticated && user?.level_user === 'A') {
            fetchUsers();
            fetchOffices();
            fetchDocuments();
        }
    }, [isAuthenticated, user]);

    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userRequest: CreateUserRequest = {
            name_user: formData.get('name_user') as string,
            ape_pat_user: formData.get('ape_pat_user') as string,
            ape_mat_user: formData.get('ape_mat_user') as string,
            dni_user: formData.get('dni_user') as string,
            nick_user: formData.get('nick_user') as string,
            password: formData.get('password') as string,
            level_user: formData.get('level_user') as 'A' | 'E',
            id_offi: formData.get('id_offi') as string
        };

        console.log('Datos a enviar:', userRequest);

        try {
            await createUser(userRequest);
            alert('Usuario creado exitosamente');
        } catch (error) {
            console.error('Error al crear usuario:', error);
            alert('Error al crear el usuario');
        }
    }

    const handleCreateOffice = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const officeRequest: CreateOfficeRequest = {
            name_offi: formData.get('name_offi') as string,
            desc_offi: formData.get('desc_offi') as string
        };

        console.log('Datos a enviar:', officeRequest);

        try {
            await createOffice(officeRequest);
            alert('Oficina creada exitosamente');
        } catch (error) {
            console.error('Error al crear oficina:', error);
            alert('Error al crear la oficina');
        }
    }

    const handleCreateDocument = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        const formData = new FormData(e.currentTarget);
        
        const numExp = formData.get('num_exp') as string;
        const idOffi = formData.get('id_offi') as string;
        const pdfFile = formData.get('pdf_file') as File;

        console.log('Datos a enviar:');
        console.log('num_exp:', numExp);
        console.log('id_offi:', idOffi);
        console.log('pdf_file:', pdfFile);

        console.log('FormData entries:');
        for (const pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        if (!numExp || !idOffi || !pdfFile || pdfFile.size === 0) {
            alert('Por favor, complete todos los campos y seleccione un archivo válido.');
            return;
        }

        try {
            await createDocument(formData);
            alert('Trámite creado exitosamente');
        } catch (error) {
            console.error('Error al crear trámite:', error);
        }
    }

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

    if (!user || user.level_user !== 'A') {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p>Acceso denegado: Se requieren permisos de administrador</p>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        Cerrar sesión
                    </button>
                </div>
            </div>
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
                                    <Shield className="h-8 w-8 text-red-600" />
                                    <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
                                </div>
                            </div>
                        
                            <div className="flex items-center space-x-4">
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
                        <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-lg p-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">¡Bienvenido, Administrador {user.name_user}!</h2>
                            <p className="text-red-100">Panel de control y gestión del sistema documental.</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Administradores</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.admins}
                                    </p>
                                </div>
                                <Shield className="h-8 w-8 text-red-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Empleados</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.employees}
                                    </p>
                                </div>
                                <UserIcon className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Lista de Usuarios</h3>
                            <div className="flex justify-end space-x-2">
                                <button onClick={() => setShowCreateUserModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
                                <Plus className="h-4 w-4" />Nuevo Usuario
                            </button>
                            <button onClick={() => setShowCreateOfficeModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
                                <Plus className="h-4 w-4" />Nueva Oficina
                            </button>
                            <button onClick={() => setShowCreateDocumentModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
                                <Plus className="h-4 w-4" />Nuevo Trámite
                            </button>
                            </div>
                        </div>
                        
                        {usersLoading ? (
                            <div className="p-6 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-gray-600">Cargando usuarios...</p>
                            </div>
                        ) : usersError ? (
                            <div className="p-6 text-center">
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {usersError}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oficina</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id_user} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                <UserIcon className="h-5 w-5 text-gray-600" />
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.name_user} {user.ape_pat_user} {user.ape_mat_user}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                @{user.nick_user}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.dni_user}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.level_user === 'A' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {user.level_user === 'A' ? 'Administrador' : 'Empleado'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.office.name_offi}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.status_user === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.status_user === 'A' ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Modal para crear usuario */}
                    {showCreateUserModal && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto [box-shadow:var(--box-shadow)]">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Crear Nuevo Usuario</h3>
                                    <button onClick={() => setShowCreateUserModal(false)} className="text-gray-500 hover:text-gray-700 cursor-pointer">✕</button>
                                </div>
                        
                                <form onSubmit={handleCreateUser} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombres:</label>
                                        <input type="text" name="name_user" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno:</label>
                                        <input type="text" name="ape_pat_user" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno:</label>
                                        <input type="text" name="ape_mat_user" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                                        <input type="text" name="dni_user" maxLength={8} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario:</label>
                                        <input type="text" name="nick_user" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña:</label>
                                        <input type="password" name="password" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel:</label>
                                        <select name="level_user" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar nivel</option>
                                            <option value="A">Administrador</option>
                                            <option value="E">Empleado</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Oficina:</label>
                                        <select name="id_offi" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar oficina</option>
                                            {offices.map((office) => (
                                                <option key={office.id_offi} value={office.id_offi}>
                                                    {office.name_offi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="flex space-x-3 pt-4">
                                        <button type="button" onClick={() => setShowCreateUserModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
                                        <button type="submit" disabled={isCreatingUser} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"> {isCreatingUser ? 'Creando...' : 'Crear Usuario'} </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modal para crear oficinas */}
                    {showCreateOfficeModal && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto [box-shadow:var(--box-shadow)]">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Crear Nueva Oficina o Gerencia</h3>
                                    <button onClick={() => setShowCreateOfficeModal(false)} className="text-gray-500 hover:text-gray-700 cursor-pointer">✕</button>
                                </div>
                        
                                <form onSubmit={handleCreateOffice} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
                                        <input type="text" name="name_offi" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción:</label>
                                        <input type="text" name="desc_offi" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    
                                    <div className="flex space-x-3 pt-4">
                                        <button type="button" onClick={() => setShowCreateOfficeModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
                                        <button type="submit" disabled={isCreatingOffice} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"> {isCreatingOffice ? 'Creando...' : 'Crear Oficina'} </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modal para crear trámites */}
                    {showCreateDocumentModal && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto [box-shadow:var(--box-shadow)]">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Crear Nuevo Trámite</h3>
                                    <button onClick={() => setShowCreateDocumentModal(false)} className="text-gray-500 hover:text-gray-700 cursor-pointer">✕</button>
                                </div>
                        
                                <form onSubmit={handleCreateDocument} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Expediente:</label>
                                        <input type="text" name="num_exp" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Oficina:</label>
                                        <select name="id_offi" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar oficina</option>
                                            {offices.map((office) => (
                                                <option key={office.id_offi} value={office.id_offi}>
                                                    {office.name_offi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Documento:</label>
                                        <input type="file" name="pdf_file" accept=".pdf,application/pdf" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        <p className="text-xs text-gray-500 mt-1">Solo archivos PDF. Máximo 10MB.</p>
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button type="button" onClick={() => setShowCreateDocumentModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
                                        <button type="submit" disabled={isCreatingDocument} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"> {isCreatingDocument ? 'Creando...' : 'Crear Trámite'} </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Document List */}
                    <div className="bg-white rounded-lg shadow mt-8">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Lista de Documentos</h3>
                        </div>
                        
                        {documentsLoading ? (
                            <div className="p-6 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-gray-600">Cargando documentos...</p>
                            </div>
                        ) : documentsError ? (
                            <div className="p-6 text-center">
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {documentsError}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número de Expediente</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creador</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oficina</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {documents.map((document) => {
                                            const filename = document.pdf_path.split('/').pop();
                                            const pdfUrl = `http://localhost:8000/storage/documents/${filename}`;

                                            return (
                                                <tr key={document.id_doc} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {document.num_exp}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {document.creator.name_user} {document.creator.ape_pat_user} {document.creator.ape_mat_user}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {document.office.name_offi}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        document.status_env_doc === 'P' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {document.status_env_doc === 'P' ? 'Pendiente' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-xs font-medium transition-colors">Ver PDF</a>
                                                        <a href={pdfUrl} download className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-xs font-medium transition-colors">Descargar</a>
                                                    </div>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}