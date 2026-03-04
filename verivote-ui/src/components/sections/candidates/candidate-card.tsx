"use client";
import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    party: string;
    partyAbbreviation: string;
    image: string;
    position: string;
    location?: string;
    slug: string;
    tagline?: string;
}

interface CandidateCardProps {
    candidate: Candidate;
    onClick?: () => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onClick }) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = '/api/placeholder/150/150';
    };

    return (
        <Link
            href={`/candidates/${candidate.slug}`}
            className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transform hover:scale-105 transition-all duration-200 cursor-pointer"
            onClick={onClick}
        >
            <div className="aspect-square bg-gray-300 relative overflow-hidden">
                {candidate.image && candidate.image !== '/api/placeholder/150/150' ? (
                    <img
                        src={candidate.image}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                    </div>
                )}
            </div>

            <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {candidate.name}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-1">
                    {candidate.party} ({candidate.partyAbbreviation})
                </p>
                {candidate.location && (
                    <p className="text-xs text-gray-500 mb-1">
                        {candidate.location}
                    </p>
                )}
                {candidate.tagline && (
                    <p className="text-xs text-blue-600 italic line-clamp-2">
                        {candidate.tagline}
                    </p>
                )}
                <div className="mt-2 text-xs text-gray-400">
                    Click to view details →
                </div>
            </div>
        </Link>
    );
};

export default CandidateCard;