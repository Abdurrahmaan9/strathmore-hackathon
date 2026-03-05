'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Accessibility, Search } from 'lucide-react';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const pathname = usePathname();

    const navigationItems = [
        { name: 'Home', href: '/' },
        { name: 'Candidates', href: '/candidates' },
        { name: 'Compare', href: '/compare' },
        { name: 'AboutUs', href: '/about' },
        // { name: 'Parties', href: '/parties' },
        // { name: 'Elections', href: '/elections' },
        // { name: 'Issues', href: '/issues' },
        // { name: 'Resources', href: '/resources' },
        // { name: 'Contact', href: '/contact' },
        // {
        //     name: 'Candidates',
        //     href: '/candidates',
        //     subItems: [
        //         { name: 'Browse All', href: '/candidates' },
        //         { name: 'Compare', href: '/compare' },
        //         { name: 'Search', href: '/candidates/search' }
        //     ]
        // },
        // {
        //     name: 'Elections',
        //     href: '/elections',
        //     subItems: [
        //         { name: 'Current Elections', href: '/elections' },
        //         { name: 'Past Elections', href: '/elections/past' },
        //         { name: 'Upcoming Elections', href: '/elections/upcoming' }
        //     ]
        // },
        // { name: 'Issues', href: '/issues' },
        // {
        //     name: 'Resources',
        //     href: '/resources',
        //     subItems: [
        //         { name: 'All Resources', href: '/resources' },
        //         { name: 'Voting Process', href: '/resources/voting-process' },
        //         { name: 'Polling Locations', href: '/resources/polling-locations' },
        //         { name: 'Election Issues', href: '/resources/election-issues' }
        //     ]
        // },
        // { name: 'Contact', href: '/contact' }
    ];

    const isActiveLink = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        {/* <div className="w-8 h-8 lg:w-10 lg:h-10 mr-2 lg:mr-3 group-hover:opacity-80 transition-opacity duration-200">
                            <Image
                                src="/images/logo-light.jpeg"
                                // alt="VeriVote Logo"
                                width={40}
                                height={40}
                                className="w-full h-full object-contain"
                                priority
                            />
                        </div> */}
                        <span className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            VOTE-TRACE KENYA
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        {navigationItems.map((item: any) => (
                            <div key={item.name} className="relative group">
                                {item.subItems ? (
                                    // Dropdown Menu Item
                                    <div className="relative">
                                        <button
                                            className={`flex items-center px-3 xl:px-4 py-2 rounded-md text-sm xl:text-base font-medium transition-colors duration-200 ${isActiveLink(item.href)
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {item.name}
                                            <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform duration-200" />
                                        </button>

                                        {/* Dropdown Content */}
                                        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="py-2">
                                                {item.subItems.map((subItem: any) => (
                                                    <Link
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${isActiveLink(subItem.href)
                                                            ? 'text-blue-600 bg-blue-50'
                                                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {subItem.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Regular Menu Item
                                    <Link
                                        href={item.href}
                                        className={`px-3 xl:px-4 py-2 rounded-md text-sm xl:text-base font-medium transition-colors duration-200 ${isActiveLink(item.href)
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-2 lg:space-x-4">
                        {/* Search Button - Desktop */}
                        <button className="hidden lg:flex p-2 text-black hover:text-blue-600 hover:bg-gray-50 rounded-full transition-colors duration-200">
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Language Selector */}
                        <div className="flex items-center space-x-1 text-gray-700">
                            <span className="text-sm lg:text-base">Eng</span>
                            <ChevronDown className="w-4 h-4" />
                        </div>

                        {/* Accessibility Button */}
                        <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors duration-200">
                            <Accessibility className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>

                        {/* Login and Sign Up Buttons - Desktop */}
                        {/* <div className="hidden lg:flex items-center space-x-2">
                            <a
                                href={`${process.env.NEXT_PUBLIC_URL ?? 'https://admin.verivote.org'}/login`}
                                className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium rounded-md border border-blue-600 hover:border-blue-700 transition-colors duration-200"
                            >
                                Login
                            </a>
                            <a
                                href={`${process.env.NEXT_PUBLIC_URL ?? 'https://admin.verivote.org'}/register`}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-black text-sm font-medium rounded-md transition-colors duration-200"
                            >
                                Sign Up
                            </a>
                        </div> */}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMenu}
                            className="lg:hidden p-2 text-black hover:text-gray-900 rounded-md"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 bg-white">
                        <div className="py-4 space-y-2">
                            {/* Search Bar - Mobile */}
                            <div className="px-4 pb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Navigation Items */}
                            {navigationItems.map((item: any) => (
                                <div key={item.name}>
                                    {item.subItems ? (
                                        <div>
                                            <button
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                                            >
                                                <span className="font-medium">{item.name}</span>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isDropdownOpen && (
                                                <div className="bg-gray-50">
                                                    {item.subItems.map((subItem: any) => (
                                                        <Link
                                                            key={subItem.name}
                                                            href={subItem.href}
                                                            className={`block px-8 py-2 text-sm ${isActiveLink(subItem.href)
                                                                ? 'text-blue-600 bg-blue-50'
                                                                : 'text-black hover:text-gray-900'
                                                                }`}
                                                            onClick={() => setIsMenuOpen(false)}
                                                        >
                                                            {subItem.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className={`block px-4 py-2 font-medium ${isActiveLink(item.href)
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            ))}

                            {/* Login and Sign Up Links - Mobile */}
                            {/* <div className="px-4 pt-4 space-y-2">
                                <a
                                    href="https://verivote.org/login"
                                    className="block w-full text-center px-4 py-2 text-blue-600 border border-blue-600 hover:bg-blue-50 font-medium rounded-md transition-colors duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </a>
                                <a
                                    href="https://verivote.org/register"
                                    className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-black font-medium rounded-md transition-colors duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign Up
                                </a>
                            </div> */}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;