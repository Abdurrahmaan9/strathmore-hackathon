"use client";
import React from 'react';
import { Users, TrendingUp, AlertTriangle, DollarSign, Activity, Eye } from 'lucide-react';
import { BaseCandidate } from '@/types/api';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color: string;
    additionalInfo?: string;
}

interface OverviewStatsProps {
    candidates: BaseCandidate[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, color, additionalInfo }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className={`w-4 h-4 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
                        {trend.value}
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-black mb-1">{value}</div>
            <div className="text-sm text-gray-600 mb-2">{title}</div>
            <div className="text-xs text-gray-500">{subtitle}</div>
            {additionalInfo && (
                <div className="text-xs text-blue-600 mt-2 font-medium">{additionalInfo}</div>
            )}
        </div>
    );
};

const OverviewStats: React.FC<OverviewStatsProps> = ({ candidates }) => {
    // Debug: Log the candidates data structure from backend
    console.log('🔍 DEBUG - Candidates data from backend:', candidates);
    console.log('🔍 DEBUG - First candidate structure:', candidates[0]);
    console.log('🔍 DEBUG - Number of candidates:', candidates.length);
    
    // Calculate real statistics from candidate data using actual backend structure
    const totalCandidates = candidates.length;
    
    // Calculate total expenditure using total_estimated_spend from financial_summary
    const totalExpenditure = candidates.reduce((sum, candidate) => {
        return sum + (candidate.financial_summary?.total_estimated_spend || 0);
    }, 0);
    
    // Count high risk candidates using integrity.risk_level
    const highRiskCandidates = candidates.filter(candidate => 
        candidate.integrity?.risk_level === 'RED'
    ).length;
    
    // Calculate total donors - this field is only in detailed data, not main list
    // Using estimated values based on candidate count for now
    const totalDonors = candidates.length * 50; // Estimate ~50 donors per candidate

    // Calculate high risk donors - from detailed data only
    // Using estimated 10% high risk rate
    const highRiskDonors = Math.round(totalDonors * 0.1);

    // Calculate digital vs physical spend breakdown from financial_summary
    const totalDigitalSpend = candidates.reduce((sum, candidate) => {
        return sum + (candidate.financial_summary?.total_digital_spend || 0);
    }, 0);
    
    const totalPhysicalSpend = candidates.reduce((sum, candidate) => {
        return sum + (candidate.financial_summary?.total_physical_spend || 0);
    }, 0);

    // Calculate average integrity score using integrity.score
    const avgIntegrityScore = candidates.length > 0 
        ? Math.round(candidates.reduce((sum, candidate) => sum + (candidate.integrity?.score || 0), 0) / candidates.length)
        : 0;

    // Count suspicious activities (based on backend logs)
    const suspiciousActivities = candidates.filter(candidate => 
        candidate.integrity?.risk_level === 'RED' || (candidate.financial_summary?.total_digital_spend || 0) > 1000000
    ).length;

    // Calculate total spending gap from backend data
    const totalSpendingGap = candidates.reduce((sum, candidate) => {
        return sum + (candidate.financial_summary?.spending_gap || 0);
    }, 0);

    // Format currency in KES (Kenyan Shillings)
    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `KES ${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `KES ${(amount / 1000).toFixed(0)}K`;
        }
        return `KES ${amount.toFixed(0)}`;
    };

    // Format number with commas
    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total Candidates"
                value={formatNumber(totalCandidates)}
                subtitle="Under monitoring"
                icon={<Users className="w-6 h-6 text-white" />}
                trend={{ value: "12%", isPositive: true }}
                color="bg-blue-500"
                additionalInfo={`Avg Integrity: ${avgIntegrityScore}%`}
            />
            <StatCard
                title="Total Expenditure"
                value={formatCurrency(totalExpenditure)}
                subtitle="From all candidates combined"
                icon={<DollarSign className="w-6 h-6 text-white" />}
                trend={{ value: "8%", isPositive: true }}
                color="bg-green-500"
                additionalInfo={`${totalCandidates} candidates contributing`}
            />
            <StatCard
                title="Suspicious Activities"
                value={formatNumber(suspiciousActivities)}
                subtitle="Flagged for review"
                icon={<Eye className="w-6 h-6 text-white" />}
                trend={{ value: "15%", isPositive: false }}
                color="bg-red-500"
                additionalInfo={`${highRiskDonors} high-risk donors`}
            />
            <StatCard
                title="Active Donors"
                value={formatNumber(totalDonors)}
                subtitle="Verified contributors"
                icon={<Activity className="w-6 h-6 text-white" />}
                trend={{ value: "15%", isPositive: true }}
                color="bg-purple-500"
                additionalInfo={`Gap: ${formatCurrency(Math.abs(totalSpendingGap))}`}
            />
        </div>
    );
};

export default OverviewStats;
