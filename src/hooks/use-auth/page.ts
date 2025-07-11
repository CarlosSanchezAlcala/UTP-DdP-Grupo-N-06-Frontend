import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axios";
import { redirectUserByRole, hasRequiredRole, UserRole } from "@/utils/navigation";
import { User } from "@/utils/types/projects";

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setLoading(false);
                    return;
                }

                try {
                    console.log('Token encontrado, llamando a /me...');
                    const response = await axiosClient.get('/me');
                    const fetchedUser= response.data;

                    console.log('Datos del usuario obtenidos:', fetchedUser);
                    localStorage.setItem('user', JSON.stringify(fetchedUser));
                    setUser(fetchedUser as User);
                } catch (error) {
                    console.error('Error al obtener usuario:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } catch (error) {
                console.error('Error al verificar autenticación: ', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // setUser(null);
        router.push('/login');
    };

    return {
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        redirectToDashboard: () => redirectUserByRole(user, router)
    };
};

export const useProtectedRoute = (requiredRole?: UserRole) => {
    const { isAuthenticated, loading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            if (requiredRole && !hasRequiredRole(user, requiredRole)) {
                redirectUserByRole(user, router);
            }
        }
    }, [isAuthenticated, loading, router, requiredRole, user]);

    return { isAuthenticated, loading, user };
};