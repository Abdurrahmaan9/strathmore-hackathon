import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Music } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="relative bg-gradient-to-br from-slate-900/30 via-blue-900/20 to-indigo-900/30 backdrop-blur-xl text-black py-12">
            {/* Glassmorphism overlay effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-white/10 to-transparent backdrop-blur-md"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 backdrop-blur-sm"></div>
            
            {/* Animated glass particles effect */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute top-20 right-20 w-24 h-24 bg-blue-300/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-purple-300/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
            </div>
            
            <div className="relative max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/80 to-blue-600/80 rounded-md flex items-center justify-center mr-3 shadow-xl backdrop-blur-md border border-white/30">
                            <div className="w-6 h-6 bg-white/95 rounded-sm flex items-center justify-center backdrop-blur-sm">
                                <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-sm shadow-md"></div>
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-white/95 drop-shadow-xl backdrop-blur-sm">VOTE-TRACE KENYA</span>
                    </div>
                    <p className="text-white/90 mb-6 drop-shadow-lg backdrop-blur-sm">Your Vote, Your Voice, Verified.</p>

                    <nav className="mb-6">
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <a href="#" className="text-white/90 hover:text-white transition-all duration-300 drop-shadow-md backdrop-blur-sm px-3 py-1 rounded-lg hover:bg-white/20">About Us</a>
                            <span className="text-white/60">|</span>
                            <a href="#" className="text-white/90 hover:text-white transition-all duration-300 drop-shadow-md backdrop-blur-sm px-3 py-1 rounded-lg hover:bg-white/20">FAQs</a>
                            <span className="text-white/60">|</span>
                            <a href="#" className="text-white/90 hover:text-white transition-all duration-300 drop-shadow-md backdrop-blur-sm px-3 py-1 rounded-lg hover:bg-white/20">Contact</a>
                            <span className="text-white/60">|</span>
                            <a href="#" className="text-white/90 hover:text-white transition-all duration-300 drop-shadow-md backdrop-blur-sm px-3 py-1 rounded-lg hover:bg-white/20">Privacy</a>
                            <span className="text-white/60">|</span>
                            <a href="#" className="text-white/90 hover:text-white transition-all duration-300 drop-shadow-md backdrop-blur-sm px-3 py-1 rounded-lg hover:bg-white/20">Terms</a>
                        </div>
                    </nav>

                    <div className="flex justify-center space-x-6">
                        <a href="#" className="text-white/90 hover:text-white transition-all duration-300 backdrop-blur-md p-3 rounded-xl hover:bg-white/20 hover:scale-110 transform">
                            <Instagram className="w-6 h-6 drop-shadow-lg" />
                        </a>
                        <a href="#" className="text-white/90 hover:text-white transition-all duration-300 backdrop-blur-md p-3 rounded-xl hover:bg-white/20 hover:scale-110 transform">
                            <Facebook className="w-6 h-6 drop-shadow-lg" />
                        </a>
                        <a href="#" className="text-white/90 hover:text-white transition-all duration-300 backdrop-blur-md p-3 rounded-xl hover:bg-white/20 hover:scale-110 transform">
                            <Twitter className="w-6 h-6 drop-shadow-lg" />
                        </a>
                        <a href="#" className="text-white/90 hover:text-white transition-all duration-300 backdrop-blur-md p-3 rounded-xl hover:bg-white/20 hover:scale-110 transform">
                            <Music className="w-6 h-6 drop-shadow-lg" />
                        </a>
                    </div>
                </div>
                
                {/* Copyright section with enhanced glassmorphism */}
                <div className="relative border-t border-white/30 pt-8 mt-8 backdrop-blur-sm">
                    <div className="text-center">
                        <p className="text-white/90 text-sm drop-shadow-lg backdrop-blur-sm">
                            © 2024 VOTE-TRACE KENYA. All rights reserved.
                        </p>
                        <p className="text-white/70 text-xs mt-2 drop-shadow-md backdrop-blur-sm">
                            Empowering democracy through transparency and accountability.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;