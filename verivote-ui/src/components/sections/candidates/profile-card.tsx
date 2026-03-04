"use client";
import React from 'react';
import { User, Bookmark, Share2 } from 'lucide-react';

interface CandidateProfileCardProps {
    candidate: {
        name: string;
        age: number;
        gender: string;
        candidacy: string;
        party: string;
        profileImage?: string;
    };
    isBookmarked: boolean;
    onBookmark: () => void;
    onShare: () => void;
    onCompare: () => void;
}

export const CandidateProfileCard: React.FC<CandidateProfileCardProps> = ({
    candidate,
    isBookmarked,
    onBookmark,
    onShare,
    onCompare
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col items-center text-center">
                {/* Profile Image */}
                <div className="w-48 h-64 bg-gray-300 rounded-lg mb-4 overflow-hidden">
                    {candidate.profileImage ? (
                        <img
                            src={candidate.profileImage}
                            alt={candidate.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center">
                            <User className="w-20 h-20 text-white" />
                        </div>
                    )}
                </div>

                {/* Candidate Info */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {candidate.name}
                        <span className="text-lg font-normal text-gray-600 ml-3">
                            {candidate.gender}, {candidate.age}
                        </span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-3">{candidate.candidacy}</p>

                    {/* Party Info */}
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">K</span>
                        </div>
                        <span className="text-gray-700">{candidate.party}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onCompare}
                        className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-200 transition-colors"
                    >
                        Compare
                    </button>
                    <button
                        onClick={onBookmark}
                        className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <Bookmark className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onShare}
                        className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
