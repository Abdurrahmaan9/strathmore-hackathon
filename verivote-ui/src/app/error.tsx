'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import MainLayout from '../components/layouts/main-layout';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);

    const handleReset = () => {
        // Clear any client-side cache or state if needed
        if (typeof window !== 'undefined') {
            // Clear localStorage if needed
            // localStorage.clear();
        }
        reset();
    };

    return (
        <MainLayout className="bg-gray-50">
            <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full text-center">
                    {/* Error Icon */}
                    <div className="mb-8">
                        <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-12 h-12 text-red-600" />
                        </div>
                    </div>

                    {/* Error Message */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        Something went wrong
                    </h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        We encountered an unexpected error while processing your request. Our team has been notified and is working to fix this issue.
                    </p>

                    {/* Error Details (in development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                            <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details:</h3>
                            <p className="text-xs text-red-700 font-mono break-all">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs text-red-600 mt-2">
                                    Error ID: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <button
                            onClick={handleReset}
                            className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Try Again
                        </button>

                        <Link
                            href="/"
                            className="inline-flex items-center justify-center w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-colors duration-200"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Go to Homepage
                        </Link>

                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center w-full text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors duration-200"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Report this issue
                        </Link>
                    </div>

                    {/* Additional Help */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Need Help?</h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p>If this problem persists, please contact our support team.</p>
                            <div className="flex justify-center space-x-4">
                                <Link href="/contact" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
                                    Contact Support
                                </Link>
                                <span className="text-gray-400">•</span>
                                <Link href="/resources" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
                                    Help Center
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}