'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isClient, setIsClient] = useState(false);

    // Hero background images (replace these with your actual images)
    const heroImages = [
        "/images/slider1.jpeg",  // Updated path for public folder
        '/images/slider2.jpeg',  // Updated path for public folder
        '/images/slider3.jpg',   // Updated path for public folder
    ];

    // Set client-side flag
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Auto-slide functionality
    useEffect(() => {
        if (!isClient) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, [heroImages.length, isClient]);

    // Handle slide change functions
    const handleSlideChange = (index: number) => {
        if (!isClient) return;
        setCurrentSlide(index);
    };

    const handlePreviousSlide = () => {
        if (!isClient) return;
        setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    };

    const handleNextSlide = () => {
        if (!isClient) return;
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    };

    return (
        <div className="relative min-h-screen">
            {/* Hero Slider */}
            <div className="relative h-screen overflow-hidden">
                {/* Background Images */}
                {heroImages.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {/* Background image with gradient fallback */}
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-800 to-blue-800"
                            style={{
                                backgroundImage: `url(${image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40" />
                    </div>
                ))}

                {/* Hero Content */}
                <div className="relative z-10 flex flex-col justify-center items-center h-full px-4 sm:px-6 lg:px-8 text-center">
                    {/* Main Heading */}
                    <div className="max-w-4xl mx-auto mb-8">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4 leading-tight">
                            Know your candidates.
                        </h1>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6">
                            Vote Informed.
                        </h2>
                    </div>

                    {/* Description */}
                    <div className="max-w-2xl mx-auto mb-12">
                        <p className="text-lg sm:text-xl text-black leading-relaxed">
                            Explore upcoming campaign stops and hear directly from the people seeking your vote.
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="w-full max-w-sm">
                        <Link
                            href="/candidates"
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-black font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg"
                        >
                            Find Candidates Near You
                        </Link>
                    </div>
                </div>

                {/* Slide Indicators - Only render after client-side hydration */}
                {isClient && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="flex space-x-2">
                            {heroImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSlideChange(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide
                                        ? 'bg-white'
                                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                        }`}
                                    type="button"
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Arrows - Only render after client-side hydration */}
                {isClient && (
                    <>
                        <button
                            onClick={handlePreviousSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-black p-2 rounded-full transition-all duration-200"
                            aria-label="Previous slide"
                            type="button"
                        >
                            <ChevronDown className="w-6 h-6 rotate-90" />
                        </button>
                        <button
                            onClick={handleNextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-black p-2 rounded-full transition-all duration-200"
                            aria-label="Next slide"
                            type="button"
                        >
                            <ChevronDown className="w-6 h-6 -rotate-90" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Hero;