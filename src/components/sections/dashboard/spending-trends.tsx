"use client";
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { BaseCandidate } from '@/types/api';

interface SpendingTrendsProps {
    candidates: BaseCandidate[];
}

const SpendingTrends: React.FC<SpendingTrendsProps> = ({ candidates }) => {
    // Calculate spending data from candidates
    const totalSpending = candidates.reduce((sum, candidate) => sum + (candidate.total_spend || 0), 0);
    const averageSpending = candidates.length > 0 ? totalSpending / candidates.length : 0;
    
    // Create weekly spending data (mock data for now, but based on real totals)
    const spendingData = [
        { period: 'Week 1', amount: totalSpending * 0.2, change: 12, isPositive: true },
        { period: 'Week 2', amount: totalSpending * 0.25, change: 16, isPositive: true },
        { period: 'Week 3', amount: totalSpending * 0.22, change: -9, isPositive: false },
        { period: 'Week 4', amount: totalSpending * 0.33, change: 35, isPositive: true },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Campaign Spending Trends</h3>
                <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last 4 Weeks
                </div>
            </div>

            {/* Spending Chart */}
            <div className="space-y-4 mb-6">
                {spendingData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-medium text-black">{item.period}</div>
                                <div className="text-sm text-gray-600">
                                    ${item.amount.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className={`flex items-center ${item.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {item.isPositive ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            <span className="text-sm font-medium">
                                {item.isPositive ? '+' : ''}{item.change}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-black">
                            ${(totalSpending / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-sm text-gray-600">Total Spending</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-black">
                            ${(averageSpending / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-gray-600">Average per Candidate</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpendingTrends;
