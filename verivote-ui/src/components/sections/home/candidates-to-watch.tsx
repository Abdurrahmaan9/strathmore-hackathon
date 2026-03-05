'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, X } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    image: string;
    description: string;
}

interface PolicyPosition {
    policy: string;
    candidate1: 'yes' | 'no' | 'neutral';
    candidate2: 'yes' | 'no' | 'neutral';
}

const CandidatesToWatch: React.FC = () => {
    // Sample candidates data
    const candidates: Candidate[] = [
        {
            id: '1',
            name: 'Peter Salasya',
            image: '/images/peter-salasya.jpg', // Replace with actual image path
            description: "Learn about Salasya's vision for Kakamega County."
        },
        {
            id: '2',
            name: 'Issa Boy',
            image: '/images/issa-boy.jpg', // Replace with actual image path
            description: "Explore Issa's plan to raise tourism revenue for Msambweni Constituency."
        }
    ];

    // Sample policy positions data
    const policyPositions: PolicyPosition[] = [
        {
            policy: '2024 Finance Bill',
            candidate1: 'yes',
            candidate2: 'no'
        },
        {
            policy: 'Healthcare Reform',
            candidate1: 'yes',
            candidate2: 'yes'
        },
        {
            policy: 'Education Funding',
            candidate1: 'no',
            candidate2: 'yes'
        },
        {
            policy: 'Infrastructure Development',
            candidate1: 'yes',
            candidate2: 'neutral'
        }
    ];

    const renderVoteIcon = (position: 'yes' | 'no' | 'neutral') => {
        switch (position) {
            case 'yes':
                return (
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">Voted Yes</span>
                        </div>
                    </div>
                );
            case 'no':
                return (
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-red-600">
                            <X className="w-4 h-4" />
                            <span className="text-sm font-medium">Voted No</span>
                        </div>
                    </div>
                );
            case 'neutral':
                return (
                    <div className="flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-500">No Position</span>
                    </div>
                );
        }
    };

    return (
        <section className="bg-white py-8 md:py-12 lg:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Candidates to Watch
                    </h2>
                    <p className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto">
                        Electoral candidates at a glance. See where they stand on the issues that matter to you.
                    </p>
                </div>

                {/* Candidate Profiles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
                    {candidates.map((candidate) => (
                        <div key={candidate.id} className="text-center">
                            {/* Candidate Image */}
                            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 rounded-lg overflow-hidden">
                                {/* Placeholder background - replace with actual Image component when you have images */}
                                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                    <span className="text-black font-bold text-lg">
                                        {candidate.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                {/* Uncomment when you have actual images */}
                                {/* <Image
                  src={candidate.image}
                  alt={candidate.name}
                  fill
                  className="object-cover"
                /> */}
                            </div>

                            {/* Candidate Info */}
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                                {candidate.name}
                            </h3>
                            <p className="text-sm md:text-base text-black leading-relaxed">
                                {candidate.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Policy Comparison Section */}
                <div className="mb-8 md:mb-12">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
                        Compare policy positions, experience, and more.
                    </h3>

                    {/* Comparison Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-3 bg-green-600 text-black">
                            <div className="px-4 py-3 text-center font-semibold text-sm md:text-base">
                                Candidate 1
                            </div>
                            <div className="px-4 py-3 text-center font-semibold text-sm md:text-base border-l border-green-500">
                                Policy/Issue
                            </div>
                            <div className="px-4 py-3 text-center font-semibold text-sm md:text-base border-l border-green-500">
                                Candidate 2
                            </div>
                        </div>

                        {/* Table Rows */}
                        {policyPositions.map((position, index) => (
                            <React.Fragment key={index}>
                                {/* Policy Name Row */}
                                <div className="grid grid-cols-1 bg-green-600 text-black">
                                    <div className="px-4 py-2 text-center font-medium text-sm md:text-base">
                                        {position.policy}
                                    </div>
                                </div>

                                {/* Positions Row */}
                                <div className="grid grid-cols-2 border-b border-gray-200 last:border-b-0">
                                    <div className="px-4 py-4 text-center bg-gray-50 border-r border-gray-200">
                                        {renderVoteIcon(position.candidate1)}
                                    </div>
                                    <div className="px-4 py-4 text-center bg-gray-50">
                                        {renderVoteIcon(position.candidate2)}
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Compare Button */}
                <div className="text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-black font-semibold py-3 px-8 md:px-12 rounded-full text-sm md:text-base transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                        Compare Candidates
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CandidatesToWatch;