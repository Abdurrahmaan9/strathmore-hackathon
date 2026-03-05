import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Music } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-blue-900 text-black py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center mr-3">
                            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                                <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                            </div>
                        </div>
                        <span className="text-2xl font-bold">VOTE-TRACE KENYA</span>
                    </div>
                    <p className="text-blue-200 mb-6">Your Vote, Your Voice, Verified.</p>

                    <nav className="mb-6">
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <a href="#" className="text-blue-200 hover:text-black">About Us</a>
                            <span className="text-blue-400">|</span>
                            <a href="#" className="text-blue-200 hover:text-black">FAQs</a>
                            <span className="text-blue-400">|</span>
                            <a href="#" className="text-blue-200 hover:text-black">Contact</a>
                            <span className="text-blue-400">|</span>
                            <a href="#" className="text-blue-200 hover:text-black">Privacy</a>
                            <span className="text-blue-400">|</span>
                            <a href="#" className="text-blue-200 hover:text-black">Terms</a>
                        </div>
                    </nav>

                    <div className="flex justify-center space-x-6">
                        <a href="#" className="text-blue-200 hover:text-black">
                            <Instagram className="w-6 h-6" />
                        </a>
                        <a href="#" className="text-blue-200 hover:text-black">
                            <Facebook className="w-6 h-6" />
                        </a>
                        <a href="#" className="text-blue-200 hover:text-black">
                            <Twitter className="w-6 h-6" />
                        </a>
                        <a href="#" className="text-blue-200 hover:text-black">
                            <Music className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;