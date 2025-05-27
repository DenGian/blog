import { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white/60 rounded-lg shadow-lg p-6">
                    {children}
                </div>
            </main>
            <footer className="bg-white/80 shadow-lg mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500">
                        © {new Date().getFullYear()} DenGian Blog. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;