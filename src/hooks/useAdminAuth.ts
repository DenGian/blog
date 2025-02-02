import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export function useAdminAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const adminAuth = localStorage.getItem('adminAuth');
            if (!adminAuth) {
                router.push('/admin').then(() => {});
            } else {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    return { isAuthenticated, isLoading };
}