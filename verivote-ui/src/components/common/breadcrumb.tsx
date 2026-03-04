import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href: string;
}

type BreadcrumbProps = {
    pageTitle?: string;
    breadcrumbs?: BreadcrumbItem[];
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
    pageTitle = '',
    breadcrumbs = []
}) => {
    // If breadcrumbs array is provided, use it; otherwise use simple structure
    const shouldUseSimpleStructure = breadcrumbs.length === 0 && pageTitle;

    return (
        <div className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-4 py-3">
                <nav className="text-sm text-gray-600">
                    {shouldUseSimpleStructure ? (
                        // Simple structure (existing behavior)
                        <>
                            <Link href="/" className="hover:text-gray-900 transition-colors">
                                Home
                            </Link>
                            <ChevronRight className="mx-2 w-4 h-4 inline" />
                            <span className="text-gray-900 font-medium">{pageTitle}</span>
                        </>
                    ) : (
                        // Complex structure with breadcrumbs array
                        <div className="flex items-center space-x-1">
                            {breadcrumbs.map((breadcrumb, index) => (
                                <React.Fragment key={index}>
                                    {index === breadcrumbs.length - 1 ? (
                                        // Last breadcrumb (current page) - not clickable
                                        <span className="text-gray-900 font-medium">
                                            {breadcrumb.label}
                                        </span>
                                    ) : (
                                        // Clickable breadcrumb
                                        <Link
                                            href={breadcrumb.href}
                                            className="hover:text-gray-900 transition-colors"
                                        >
                                            {breadcrumb.label}
                                        </Link>
                                    )}

                                    {/* Separator - don't show after last item */}
                                    {index < breadcrumbs.length - 1 && (
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </nav>
            </div>
        </div>
    );
};