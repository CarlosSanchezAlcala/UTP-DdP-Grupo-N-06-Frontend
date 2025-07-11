'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axios';
import { LoginResponse } from '@/utils/types/projects';
import { redirectUserByRole } from '@/utils/navigation';

export default function LoginPage() {
    const [nick_user, setNickUser] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          redirectUserByRole(user, router);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCheckingAuth(false);
        }
      } else {
        setCheckingAuth(false);
      }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            console.log('Iniciando login...');
            const response = await axiosClient.post<LoginResponse>('/login', {
                nick_user,
                password
            });

            const { token, user } = response.data;

            console.log('Login exitoso, token recibido:', token);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            redirectUserByRole(user, router);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Login error:', error);

            if (error.response) {
              const status = error.response.status;
              const message = error.response.data?.error || 'Error desconocido';

              switch (status) {
                case 401:
                  setError('Credenciales incorrectas');
                  break;
              case 419:
                  setError('Error de sesión. Intenta nuevamente.');
                  break;
              case 422:
                  setError('Datos de entrada inválidos');
                  break;
              default:
                  setError(`Error del servidor: ${message}`);
              }
            } else if (error.request) {
              setError('Error de conexión. Verifica tu conexión a internet.');
            } else {
              setError('Error inesperado. Intenta nuevamente');
            }

            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    };

    if (checkingAuth) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </main>
    );
    }

    return (
     <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Usuario"
            className="border w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={nick_user}
            onChange={(e) => setNickUser(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="mb-6">
          <input
            type="password"
            placeholder="Contraseña"
            className="border w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white w-full p-3 rounded-lg font-semibold transition duration-200">
          {isLoading ? 'Iniciando...' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}