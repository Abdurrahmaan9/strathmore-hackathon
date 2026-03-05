"use client";
import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { BaseCandidate } from '@/types/api';

interface CandidateIntegrityChartProps {
    candidates: BaseCandidate[];
}

const CandidateIntegrityChart: React.FC<CandidateIntegrityChartProps> = ({ candidates }) => {
    // Calculate real integrity data from candidates using actual backend structure
    const lowRiskCandidates = candidates.filter(candidate => candidate.integrity?.risk_level === 'GREEN').length;
    const mediumRiskCandidates = candidates.filter(candidate => candidate.integrity?.risk_level === 'AMBER').length;
    const highRiskCandidates = candidates.filter(candidate => candidate.integrity?.risk_level === 'RED').length;
    
    const totalCandidates = candidates.length;
    
    const integrityData = [
        { 
            level: 'Low Risk', 
            count: lowRiskCandidates, 
            percentage: totalCandidates > 0 ? Math.round((lowRiskCandidates / totalCandidates) * 100) : 0,
            color: 'bg-green-500', 
            icon: <CheckCircle className="w-5 h-5" /> 
        },
        { 
            level: 'Medium Risk', 
            count: mediumRiskCandidates, 
            percentage: totalCandidates > 0 ? Math.round((mediumRiskCandidates / totalCandidates) * 100) : 0,
            color: 'bg-yellow-500', 
            icon: <AlertTriangle className="w-5 h-5" /> 
        },
        { 
            level: 'High Risk', 
            count: highRiskCandidates, 
            percentage: totalCandidates > 0 ? Math.round((highRiskCandidates / totalCandidates) * 100) : 0,
            color: 'bg-red-500', 
            icon: <Shield className="w-5 h-5" /> 
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Candidate Integrity Overview</h3>
                <div className="flex items-center text-sm text-gray-500">
                    <Shield className="w-4 h-4 mr-2" />
                    Risk Assessment
                </div>
            </div>

            {/* Chart Bars */}
            <div className="space-y-4 mb-6">
                {integrityData.map((item, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center mr-3`}>
                                    <div className="text-white">{item.icon}</div>
                                </div>
                                <span className="font-medium text-black">{item.level}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-600">{item.count} candidates</span>
                                <span className="font-semibold text-black">{item.percentage}%</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`${item.color} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${item.percentage}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Candidates Analyzed</span>
                    <span className="font-semibold text-black">{totalCandidates}</span>
                </div>
            </div>
        </div>
    );
};

export default CandidateIntegrityChart;
