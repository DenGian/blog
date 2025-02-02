import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Check if already authenticated
        const adminAuth = localStorage.getItem('adminAuth');
        if (adminAuth) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            localStorage.setItem('adminAuth', 'true');
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid password');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Admin Login
                        </h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Admin password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <button
                    onClick={() => {
                        localStorage.removeItem('adminAuth');
                        setIsAuthenticated(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                    Logout
                </button>
            </div>

            {/* Admin Menu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                    onClick={() => router.push('/admin/posts/new')}
                    className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow"
                >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Post</h2>
                    <p className="text-gray-600">Write and publish a new blog post</p>
                </div>

                <div
                    onClick={() => router.push('/admin/posts')}
                    className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow"
                >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Posts</h2>
                    <p className="text-gray-600">Edit or delete existing blog posts</p>
                </div>
            </div>
        </div>
    );
}