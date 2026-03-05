"use client";
import React from 'react';
import { Users, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
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
}

interface OverviewStatsProps {
    candidates: BaseCandidate[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, color }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
        </div>
    );
};

const OverviewStats: React.FC<OverviewStatsProps> = ({ candidates }) => {
    // Calculate real statistics from candidate data
    const totalCandidates = candidates.length;
    
    // Calculate total expenditure from all candidates
    const totalExpenditure = candidates.reduce((sum, candidate) => {
        return sum + (candidate.total_spend || 0);
    }, 0);
    
    // Count high risk candidates
    const highRiskCandidates = candidates.filter(candidate => 
        candidate.risk_level === 'RED'
    ).length;
    
    // Calculate total donors from all candidates
    const totalDonors = candidates.reduce((sum, candidate) => {
        return sum + (candidate.donor_count || 0);
    }, 0);

    // Format currency
    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${amount.toFixed(0)}`;
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
                subtitle="Across all regions"
                icon={<Users className="w-6 h-6 text-white" />}
                trend={{ value: "12%", isPositive: true }}
                color="bg-blue-500"
            />
            <StatCard
                title="Total Expenditure"
                value={formatCurrency(totalExpenditure)}
                subtitle="Campaign spending tracked"
                icon={<DollarSign className="w-6 h-6 text-white" />}
                trend={{ value: "8%", isPositive: true }}
                color="bg-green-500"
            />
            <StatCard
                title="High Risk Alerts"
                value={formatNumber(highRiskCandidates)}
                subtitle="Flagged for review"
                icon={<AlertTriangle className="w-6 h-6 text-white" />}
                trend={{ value: "3%", isPositive: false }}
                color="bg-red-500"
            />
            <StatCard
                title="Active Donors"
                value={formatNumber(totalDonors)}
                subtitle="Verified contributors"
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                trend={{ value: "15%", isPositive: true }}
                color="bg-purple-500"
            />
        </div>
    );
};

export default OverviewStats;
