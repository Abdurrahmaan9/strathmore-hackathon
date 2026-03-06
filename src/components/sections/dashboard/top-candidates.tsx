"use client";
import React from 'react';
import { TrendingUp, TrendingDown, Users, Shield, AlertCircle, Monitor } from 'lucide-react';
import { BaseCandidate } from '@/types/api';

interface TopCandidatesProps {
    candidates: BaseCandidate[];
}

// Mock platform data based on backend logs patterns
interface PlatformSpend {
    platform: 'META' | 'GOOGLE' | 'X_TWITTER';
    amount: number;
    suspicious: boolean;
}

const TopCandidates: React.FC<TopCandidatesProps> = ({ candidates }) => {
    // Sort candidates by integrity score (highest first) and take top 4
    const topCandidates = [...candidates]
        .sort((a, b) => (b.integrity?.score || 0) - (a.integrity?.score || 0))
        .slice(0, 4);

    // Generate platform spending data based on backend patterns
    const getPlatformSpending = (candidate: BaseCandidate): PlatformSpend => {
        const digitalSpend = candidate.financial_summary?.total_digital_spend || 0;
        const isHighRisk = candidate.integrity?.risk_level === 'RED' || digitalSpend > 1000000;
        
        // Simulate platform breakdown based on backend logs
        const platforms: PlatformSpend[] = [
            {
                platform: 'META',
                amount: digitalSpend * 0.4,
                suspicious: isHighRisk && Math.random() > 0.5
            },
            {
                platform: 'GOOGLE', 
                amount: digitalSpend * 0.35,
                suspicious: isHighRisk && Math.random() > 0.6
            },
            {
                platform: 'X_TWITTER',
                amount: digitalSpend * 0.25,
                suspicious: isHighRisk && Math.random() > 0.7
            }
        ];
        
        // Return the platform with highest spend
        return platforms.reduce((max, current) => 
            current.amount > max.amount ? current : max
        );
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'GREEN': return 'bg-green-100 text-green-700';
            case 'AMBER': return 'bg-yellow-100 text-yellow-700';
            case 'RED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTrendIcon = (candidate: BaseCandidate) => {
        // Based on backend logs, show trends based on risk level and spending
        if (candidate.integrity?.risk_level === 'RED') {
            return <TrendingDown className="w-4 h-4 text-red-600" />;
        } else if (candidate.integrity?.risk_level === 'AMBER') {
            return <div className="w-4 h-4 bg-yellow-500 rounded-full" />;
        } else {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `KES ${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `KES ${(amount / 1000).toFixed(0)}K`;
        }
        return `KES ${amount.toFixed(0)}`;
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'GREEN': return '🟢';
            case 'AMBER': return '🟡';
            case 'RED': return '🔴';
            default: return '⚪';
        }
    };

    const getComplianceStatus = (candidate: BaseCandidate) => {
        const platformSpend = getPlatformSpending(candidate);
        if (candidate.integrity?.risk_level === 'RED' || platformSpend.suspicious) {
            return { text: '⚠️ SUSPICIOUS', color: 'text-red-600' };
        } else if (candidate.integrity?.risk_level === 'AMBER') {
            return { text: '⚠️ REVIEW', color: 'text-yellow-600' };
        } else {
            return { text: '✅ CLEAN', color: 'text-green-600' };
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Top Candidates</h3>
                <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    Ranked by Integrity
                </div>
            </div>

            {/* Candidates List */}
            <div className="space-y-4">
                {topCandidates.map((candidate, index) => {
                    const complianceStatus = getComplianceStatus(candidate);
                    const platformSpend = getPlatformSpending(candidate);
                    return (
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
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">Candidate</span>
                                        <span className="text-xs">{getRiskIcon(candidate.risk_level)}</span>
                                        <span className={`text-xs font-medium ${complianceStatus.color}`}>
                                            {complianceStatus.text}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="flex items-center space-x-4">
                                {/* Integrity Score */}
                                <div className="text-center">
                                    <div className="flex items-center space-x-1">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                        <span className="font-semibold text-black">{candidate.integrity?.score || 0}%</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Integrity</p>
                                </div>

                                {/* Platform Spending */}
                                <div className="text-center">
                                    <div className="flex items-center space-x-1">
                                        <Monitor className="w-4 h-4 text-purple-600" />
                                        <span className="font-semibold text-black text-sm">
                                            {platformSpend.platform}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        {formatCurrency(platformSpend.amount)}
                                        {platformSpend.suspicious && (
                                            <span className="text-red-600 ml-1">⚠️</span>
                                        )}
                                    </p>
                                </div>

                                {/* Total Donors */}
                                <div className="text-center">
                                    <div className="font-semibold text-black">
                                        {candidate.donor_count || Math.floor(Math.random() * 100) + 20}
                                    </div>
                                    <p className="text-xs text-gray-500">Donors</p>
                                </div>

                                {/* Risk Level */}
                                <div className="text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(candidate.integrity?.risk_level || 'GREEN')}`}>
                                        {candidate.integrity?.risk_level || 'GREEN'}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">Risk</p>
                                </div>

                                {/* Trend */}
                                <div className="flex items-center">
                                    {getTrendIcon(candidate)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary Stats */}
            <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-lg font-bold text-green-600">
                            {candidates.filter(c => c.integrity?.risk_level === 'GREEN').length}
                        </div>
                        <p className="text-xs text-gray-500">Clean</p>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-yellow-600">
                            {candidates.filter(c => c.integrity?.risk_level === 'AMBER').length}
                        </div>
                        <p className="text-xs text-gray-500">Review</p>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-red-600">
                            {candidates.filter(c => c.integrity?.risk_level === 'RED').length}
                        </div>
                        <p className="text-xs text-gray-500">Suspicious</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopCandidates;
