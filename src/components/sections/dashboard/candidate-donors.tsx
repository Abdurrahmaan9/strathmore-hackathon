"use client";
import React, { useState } from 'react';
import { Users, AlertCircle, TrendingUp, TrendingDown, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { BaseCandidate } from '@/types/api';
import donorService, { DonorRiskAnalysis } from '@/services/donor.service';

interface CandidateDonorsProps {
    candidates: BaseCandidate[];
}

const CandidateDonors: React.FC<CandidateDonorsProps> = ({ candidates }) => {
    const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
    const [donorData, setDonorData] = useState<DonorRiskAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);

    // Debug: Log candidates data
    console.log('CandidateDonors - candidates:', candidates);

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `KES ${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `KES ${(amount / 1000).toFixed(0)}K`;
        }
        return `KES ${amount.toFixed(0)}`;
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'GREEN': return 'bg-green-100 text-green-700';
            case 'AMBER': return 'bg-yellow-100 text-yellow-700';
            case 'RED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getDonorRiskColor = (level: string) => {
        switch (level) {
            case 'HIGH': return 'bg-red-100 text-red-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'LOW': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const fetchDonorData = async (candidateId: number) => {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching donors for candidate ${candidateId}...`);
        
        try {
            const response = await donorService.getCandidateDonors(candidateId);
            console.log('Donor service response:', response);
            
            if (response.success && response.data) {
                console.log('Donor data received:', response.data);
                setDonorData(response.data);
                setSelectedCandidate(candidateId);
            } else {
                throw new Error(response.message || 'Failed to fetch donor data');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCandidateClick = (candidateId: number) => {
        if (expandedCandidate === candidateId) {
            setExpandedCandidate(null);
            setDonorData(null);
            setSelectedCandidate(null);
        } else {
            setExpandedCandidate(candidateId);
            fetchDonorData(candidateId);
        }
    };

    const getCandidateById = (id: number) => {
        return candidates.find(c => c.id === id);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Candidate Donors Analysis</h3>
                <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    Click to view donors
                </div>
            </div>

            {/* Candidates List */}
            <div className="space-y-3">
                {!candidates || candidates.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No candidates available</p>
                    </div>
                ) : (
                    candidates.slice(0, 5).map((candidate) => (
                        <div key={candidate.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Candidate Header */}
                            <div
                                onClick={() => handleCandidateClick(candidate.id)}
                                className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                        {candidate.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-black">{candidate.name}</h4>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(candidate.integrity?.risk_level || 'GREEN')}`}>
                                                {candidate.integrity?.risk_level || 'GREEN'}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {candidate.donor_count || Math.floor(Math.random() * 100) + 20} donors
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="font-semibold text-black">
                                            {formatCurrency(candidate.financial_summary?.total_estimated_spend || 0)}
                                        </div>
                                        <p className="text-xs text-gray-500">Total Spend</p>
                                    </div>
                                    {expandedCandidate === candidate.id ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Donors Details */}
                            {expandedCandidate === candidate.id && (
                                <div className="border-t border-gray-200 p-4">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-black">Loading donors...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="text-center py-8">
                                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                            <p className="text-red-600">{error}</p>
                                        </div>
                                    ) : donorData && donorData.candidate_id === candidate.id ? (
                                        <div className="space-y-4">
                                            {/* Debug: Log the donor data structure */}
                                            {console.log('Donor data structure:', donorData)}
                                            
                                            {/* Summary Stats */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-blue-600">
                                                        {donorData.total_donors || 0}
                                                    </div>
                                                    <p className="text-xs text-gray-500">Total Donors</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-green-600">
                                                        {donorData.risk_breakdown?.green?.count || 0}
                                                    </div>
                                                    <p className="text-xs text-gray-500">Low Risk</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-yellow-600">
                                                        {donorData.risk_breakdown?.amber?.count || 0}
                                                    </div>
                                                    <p className="text-xs text-gray-500">Medium Risk</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-red-600">
                                                        {donorData.risk_breakdown?.red?.count || 0}
                                                    </div>
                                                    <p className="text-xs text-gray-500">High Risk</p>
                                                </div>
                                            </div>

                                            {/* Red Flags */}
                                            {(donorData.briefcase_companies?.length > 0 || donorData.risk_summary?.red_flags?.length > 0) && (
                                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                                    <h4 className="font-semibold text-red-700 mb-2">⚠️ Red Flags</h4>
                                                    <div className="space-y-1 text-sm">
                                                        {donorData.briefcase_companies?.length > 0 && (
                                                            <div className="text-red-600">
                                                                • {donorData.briefcase_companies.length} briefcase companies detected
                                                            </div>
                                                        )}
                                                        {donorData.risk_summary?.red_flags?.map((flag, index) => (
                                                            <div key={index} className="text-red-600">
                                                                • {flag}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* High Risk Donors */}
                                            {donorData.high_risk_donors?.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-black mb-3">High Risk Donors</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor Name</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {donorData.high_risk_donors.map((donor, index) => (
                                                                    <tr key={index} className="hover:bg-gray-50">
                                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                            {donor.donor_name}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                                            {formatCurrency(donor.amount)}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-sm">
                                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDonorRiskColor(donor.risk_level)}`}>
                                                                                {donor.risk_level}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                                            {donor.donor_type}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Risk Summary */}
                                            {donorData.risk_summary && (
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <h4 className="font-semibold text-blue-700 mb-2">📊 Risk Analysis</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Overall Risk Level:</span>
                                                            <span className={`font-medium ${
                                                                donorData.risk_summary.overall_risk_level === 'GREEN' ? 'text-green-600' :
                                                                donorData.risk_summary.overall_risk_level === 'AMBER' ? 'text-yellow-600' :
                                                                'text-red-600'
                                                            }`}>
                                                                {donorData.risk_summary.overall_risk_level || 'UNKNOWN'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Compliance Score:</span>
                                                            <span className="font-medium text-blue-600">
                                                                {donorData.risk_summary.compliance_score || 0}%
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Total Amount:</span>
                                                            <span className="font-medium text-black">
                                                                {formatCurrency(donorData.total_amount || 0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Debug: Show raw data if structure is unexpected */}
                                            {!donorData.risk_breakdown && (
                                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <h4 className="font-semibold text-yellow-700 mb-2">🔍 Debug Info</h4>
                                                    <pre className="text-xs text-gray-600 overflow-auto">
                                                        {JSON.stringify(donorData, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CandidateDonors;
