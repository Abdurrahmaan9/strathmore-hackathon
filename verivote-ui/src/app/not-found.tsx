"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Search, ArrowLeft, FileQuestion } from 'lucide-react';
import MainLayout from '../components/layouts/main-layout';

export default function NotFound() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleGoBack = () => {
        if (!isClient) return;
        window.history.back();
    };

    return (
        <MainLayout className="bg-gray-50">
            <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full text-center">
                    {/* 404 Icon */}
                    <div className="mb-8">
                        <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <FileQuestion className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="text-6xl md:text-7xl font-bold text-gray-300 mb-2">404</div>
                    </div>

                    {/* Error Message */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        Page Not Found
                    </h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {`Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered an incorrect URL.`}
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Go to Homepage
                        </Link>

                        <Link
                            href="/candidates"
                            className="inline-flex items-center justify-center w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-colors duration-200"
                        >
                            <Search className="w-5 h-5 mr-2" />
                            Search Candidates
                        </Link>

                        {/* Only render go back button after client hydration */}
                        {isClient && (
                            <button
                                onClick={handleGoBack}
                                className="inline-flex items-center justify-center w-full text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors duration-200"
                                type="button"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </button>
                        )}
                    </div>

                    {/* Helpful Links */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Popular Pages</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                                About Us
                            </Link>
                            <Link href="/elections" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                                Elections
                            </Link>
                            <Link href="/issues" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                                Issues
                            </Link>
                            <Link href="/resources" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                                Resources
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}