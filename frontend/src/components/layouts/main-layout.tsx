import React from 'react';
import Header from './header';
import Footer from './footer';

interface MainLayoutProps {
    children: React.ReactNode;
    className?: string;
    showHeader?: boolean;
    showFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    className = "",
    showHeader = true,
    showFooter = true
}) => {
    return (
        <div className="min-h-screen flex flex-col">
            {showHeader && <Header />}

            <main className={`flex-1 ${className}`}>
                {children}
            </main>

            {showFooter && <Footer />}
        </div>
    );
};

export default MainLayout;