import { useRouter } from 'next/navigation';

export type UserRole = 'A' | 'E';

export interface User {
    level_user: UserRole;
}

export const redirectUserByRole = (user: User | null, router: ReturnType<typeof useRouter>) => {
    if (!user) {
        router.push('/login');
        return;
    }

    switch (user.level_user) {
        case 'A':
            router.push('/dashboard/admin');
            break;
        case 'E':
            router.push('/dashboard');
            break;
        default:
            console.error('Nivel de usuario no válido:', user.level_user);
            router.push('/login');
            break; // Si no funciona bien, eliminar esta línea
    }
};

export const hasRequiredRole = (user: User | null, requiredRole: UserRole): boolean => {
    return user?.level_user === requiredRole;
}