'use client';

import React, { useState, useEffect, useMemo, use, useCallback } from 'react';
import { useAuth, useProtectedRoute } from "@/hooks/use-auth/page";
import ProtectedRoute from "@/components/protected-route/page";
import { LogOut, User, BriefcaseBusiness, FileText, Clock, CheckCircle, Plus } from 'lucide-react';
import { Document, Office } from '@/utils/types/projects';
import axiosClient from '@/lib/axios';

export default function DashboardPage() {
    const { user, logout, loading } = useAuth();
    const { isAuthenticated } = useProtectedRoute('E');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState(true);
    const [documentsError, setDocumentsError] = useState('');
    const [isCreatingDocument, setIsCreatingDocument] = useState(false);
    const [showCreateDocumentModal, setShowCreateDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [showUpdateDocumentModal, setShowUpdateDocumentModal] = useState(false);
    const [isUpdatingDocument, setIsUpdatingDocument] = useState(false);
    const [offices, setOffices] = useState<Office[]>([]);
    const [officesLoading, setOfficesLoading] = useState(true);
    const [officesError, setOfficesError] = useState('');
    const [createFileName, setCreateFileName] = useState("Seleccionar archivo PDF");
    const [fileName, setFileName] = useState("Seleccionar archivo");

    // console.log('Dashboard - Loading:', loading);
    // console.log('Dashboard - User:', user);

    const fetchDocuments = useCallback(async () => {
        if (!user) return;

        try {
            setDocumentsLoading(true);
            setDocumentsError('');
            let endPoint = '/documents';
            if (user?.level_user === 'E' && user.office?.id_offi) {
                endPoint = `/documents?id_offi=${user.office.id_offi}`;
            }

            console.log('Fetching documents from:', endPoint);
            console.log('User level:', user.level_user);
            console.log('User office ID:', user.office?.id_offi);

            const response = await axiosClient.get(endPoint);
            console.log('Documents response:', response.data);

            setDocuments(response.data as Document[]);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setDocumentsError('Error al cargar la lista de documentos');
        } finally {
            setDocumentsLoading(false);
        }
    }, [user]);

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

    const updateDocument = async (formData: FormData, documentId:string) => {
            try {
                setIsUpdatingDocument(true);
                formData.append('_method', 'PUT');
                const response = await axiosClient.post(`/documents/${documentId}`, formData, {
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                await fetchDocuments();
                setShowUpdateDocumentModal(false);
                setSelectedDocument(null);
                return response.data;
            } catch (error) {
                console.error('Error al actualizar trámite:', error);
                throw error;
            } finally {
                setIsUpdatingDocument(false);
            }
        }

    const changeDocumentStatus = async (documentId: string, newStatus: string, observations?:string) => {
        try {
            setIsUpdatingDocument(true);
            const response = await axiosClient.post(`/documents/${documentId}/status`, {
                new_status: newStatus,
                observations: observations || ''
            });
            await fetchDocuments();
            return response.data;
        } catch (error) {
            console.error('Error al cambiar el estado del documento:', error);
            throw error;
        } finally {
            setIsUpdatingDocument(false);
        }
    }

    const getDocumentTracking = async (documentId: string) => {
        try {
            const response = await axiosClient.get(`/documents/${documentId}/tracking`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener el seguimiento del documento:', error);
            throw error;
        } finally {
            setIsUpdatingDocument(false);
        }
    }

    type StatusKey = 'P' | 'D' | 'R' | 'F' | 'E';
    const getStatusLabel = (status: string) => {
        const statusMap: Record<StatusKey, string> = {
            'P': 'Pendiente',
            'D': 'Derivado',
            'R': 'En Revisión',
            'F': 'Finalizado',
            'E': 'Entregado'
        };
        return statusMap[status as StatusKey] ?? 'Desconocido';
    };

    const getStatusColor = (status: string) => {
        const colorMap = {
            'P': 'bg-yellow-100 text-yellow-800',
            'D': 'bg-blue-100 text-blue-800',
            'R': 'bg-purple-100 text-purple-800',
            'F': 'bg-green-100 text-green-800',
            'E': 'bg-gray-100 text-gray-800'
        };
        return colorMap[status as StatusKey] || 'bg-gray-100 text-gray-800';
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.level_user === 'E' && user.office?.id_offi) {
                fetchDocuments();
                fetchOffices();
            } else if (user.level_user === 'A') {
                fetchDocuments();
                fetchOffices();
            }
        }
    }, [isAuthenticated, user, fetchDocuments]);

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

    const handleUpdateDocument = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!selectedDocument) return;
            const formData = new FormData(e.currentTarget);
            try {
                await updateDocument(formData, String(selectedDocument.id_doc));
                alert('Trámite actualizado exitosamente');
            } catch (error) {
                console.error('Error al actualizar trámite:', error);
                alert('Error al actualizar el trámite');
            }
        }
    
        const openUpdateDocumentModal = (document: Document) => {
            setSelectedDocument(document);
            setShowUpdateDocumentModal(true);
        }

    const stats = useMemo(() => ({
            totalDocuments: documents.length,
            pendientes: documents.filter(d => d.status === 'P').length,
            derivados: documents.filter(d => d.status === 'D').length,
        }), [documents]);

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
                                    <h1 className="text-xl font-semibold text-gray-900">Panel del Funcionario</h1>
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
                                    <p className="text-2xl font-bold text-gray-900">{ stats.pendientes }</p>
                                </div>
                                <Clock className="h-8 w-8 text-orange-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Documentos Derivados</p>
                                    <p className="text-2xl font-bold text-gray-900">{ stats.derivados }</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Documentos</p>
                                    <p className="text-2xl font-bold text-gray-900">{ stats.totalDocuments }</p>
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

                    {/* Document List */}
                    <div className="bg-white rounded-lg shadow mt-8">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Lista de Documentos</h3>
                                <div className="flex justify-end space-x-2">
                                    <button onClick={() => setShowCreateDocumentModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
                                        <Plus className="h-4 w-4" />Nuevo Trámite
                                    </button>
                                </div>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Exp</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado por</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enviado por</th>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{document.num_exp}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{document.creator.name_user} {document.creator.ape_pat_user} {document.creator.ape_mat_user}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{document.updater?.name_user} {document.updater?.ape_pat_user} {document.updater?.ape_mat_user}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{document.office.name_offi}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        document.status === 'P' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {document.status === 'P' ? 'Pendiente' : document.status === 'D' ? 'Derivado' : document.status === 'R' ? 'Revisión' : document.status === 'F' ? 'Finalizado' : document.status === 'E' ? 'Entregado' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-xs font-medium transition-colors">Ver</a>
                                                        <button onClick={() => openUpdateDocumentModal(document)} className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer">Editar</button>
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
                                        <select name="id_offi" required defaultValue={user?.id_offi || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar oficina</option>
                                            {offices.map((office) => (
                                                <option key={office.id_offi} value={office.id_offi}>
                                                    {office.name_offi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Documento (PDF):</label>
                                        <div>
                                            <input type="file" name="pdf_file" accept=".pdf,application/pdf" id="create-upload" required className="hidden"
                                                onChange={(e) => {
                                                    const files = e.target.files;
                                                    setCreateFileName(files && files[0] ? files[0].name : "Ningún archivo seleccionado");
                                                }}
                                            />
                                            <label htmlFor="create-upload" className="w-full inline-block cursor-pointer border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">{createFileName}</label>
                                        </div>
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

                    {/* Modal to update documents */}
                    {showUpdateDocumentModal && selectedDocument && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto [box-shadow:var(--box-shadow)]">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Actualizar Trámite</h3>
                                    <button onClick={() => setShowUpdateDocumentModal(false)} 
                                            className="text-gray-500 hover:text-gray-700 cursor-pointer">✕</button>
                                </div>
                        
                                <form onSubmit={handleUpdateDocument} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Expediente:</label>
                                        <input type="text" value={selectedDocument.num_exp} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500" />
                                        <p className="text-xs text-gray-500 mt-1">El número de expediente no se puede modificar</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Oficina Actual:</label>
                                        <input type="text" value={selectedDocument.office.name_offi} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 mb-2" />
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Derivar a Oficina:</label>
                                        <select name="id_offi" 
                                                defaultValue={selectedDocument.office.id_offi} 
                                                required 
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            {offices.map((office) => (
                                                <option key={office.id_offi} value={office.id_offi}>
                                                    {office.name_offi}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-blue-600 mt-1">Si cambias la oficina, el documento se derivará automáticamente</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones de la Derivación:</label>
                                        <textarea name="observations" rows={3} placeholder="Motivo de la derivación..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Nuevo Documento (PDF):</label>
                                        <div>
                                            <input type="file" name="new_pdf" required accept=".pdf" id="upload" className="hidden"
                                                onChange={(e) => {
                                                    const files = e.target.files;
                                                    setFileName(files && files[0] ? files[0].name : "Ningún archivo seleccionado");
                                                }}
                                            />
                                            <label htmlFor="upload" className="w-full inline-block cursor-pointer border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">{fileName}</label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Opcional: El nuevo PDF se fusionará con el documento existente. Máximo 10MB.</p>
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button type="button" onClick={() => setShowUpdateDocumentModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
                                        <button type="submit" disabled={isUpdatingDocument} className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:bg-yellow-300">
                                            {isUpdatingDocument ? 'Derivando...' : 'Derivar Documento'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}