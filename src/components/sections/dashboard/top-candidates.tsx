"use client";
import React from 'react';
import { TrendingUp, TrendingDown, Users, Shield } from 'lucide-react';
import { BaseCandidate } from '@/types/api';

interface TopCandidatesProps {
    candidates: BaseCandidate[];
}

const TopCandidates: React.FC<TopCandidatesProps> = ({ candidates }) => {
    // Sort candidates by integrity score (highest first) and take top 4
    const topCandidates = [...candidates]
        .sort((a, b) => b.integrity_score - a.integrity_score)
        .slice(0, 4);

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'GREEN': return 'bg-green-100 text-green-700';
            case 'AMBER': return 'bg-yellow-100 text-yellow-700';
            case 'RED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
            case 'stable': return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
            default: return <TrendingUp className="w-4 h-4 text-green-600" />;
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${amount.toFixed(0)}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Top Performing Candidates</h3>
                <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    Ranked by Integrity
                </div>
            </div>

            {/* Candidates List */}
            <div className="space-y-4">
                {topCandidates.map((candidate, index) => (
                    <div
                        key={candidate.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            {/* Rank */}
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                {index + 1}
                            </div>
                            
                            {/* Candidate Info */}
                            <div>
                                <h4 className="font-semibold text-black">{candidate.name}</h4>
                                <p className="text-sm text-gray-600">{candidate.position || 'Candidate'}</p>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center space-x-6">
                            {/* Integrity Score */}
                            <div className="text-center">
                                <div className="flex items-center space-x-1">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <span className="font-semibold text-black">{candidate.integrity_score}%</span>
                                </div>
                                <p className="text-xs text-gray-500">Integrity</p>
                            </div>

                            {/* Spending */}
                            <div className="text-center">
                                <div className="font-semibold text-black">
                                    {formatCurrency(candidate.total_spend || 0)}
                                </div>
                                <p className="text-xs text-gray-500">Spending</p>
                            </div>

                            {/* Risk Level */}
                            <div className="text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(candidate.risk_level)}`}>
                                    {candidate.risk_level}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">Risk</p>
                            </div>

                            {/* Trend */}
                            <div className="flex items-center">
                                {getTrendIcon('up')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View All Link */}
            <div className="border-t border-gray-200 pt-4 mt-4">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View All Candidates →
                </button>
            </div>
        </div>
    );
};

export default TopCandidates;
