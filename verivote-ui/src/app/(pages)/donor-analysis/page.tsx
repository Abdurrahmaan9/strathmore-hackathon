'use client';

import React, { useState, useEffect } from 'react';
import donorService from '../../../services/donor.service';
import { DonorRiskAnalysis, DonorStatistics, RiskLevel, DonorType } from '../../../types/api';

const RISK_LEVEL_COLORS = {
    GREEN: '#10B981',
    AMBER: '#F59E0B',
    RED: '#EF4444',
};

const RISK_LEVEL_BADGE_COLORS = {
    GREEN: 'bg-green-100 text-green-800',
    AMBER: 'bg-yellow-100 text-yellow-800',
    RED: 'bg-red-100 text-red-800',
};

export default function DonorAnalysisPage() {
    const [statistics, setStatistics] = useState<DonorStatistics | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
    const [candidateAnalysis, setCandidateAnalysis] = useState<DonorRiskAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDonorStatistics();
    }, []);

    useEffect(() => {
        if (selectedCandidate) {
            fetchCandidateAnalysis(selectedCandidate);
        }
    }, [selectedCandidate]);

    const fetchDonorStatistics = async () => {
        try {
            setLoading(true);
            const response = await donorService.getDonorStatistics();
            if (response.success && response.data) {
                setStatistics(response.data);
            } else {
                setError(response.message || 'Failed to fetch donor statistics');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidateAnalysis = async (candidateId: number) => {
        try {
            const response = await donorService.getCandidateDonors(candidateId);
            if (response.success && response.data) {
                setCandidateAnalysis(response.data);
            } else {
                setError(response.message || 'Failed to fetch candidate analysis');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleFileUpload = async () => {
        if (!uploadFile) return;

        try {
            setUploading(true);
            const response = await donorService.importDonorData(uploadFile);
            if (response.success) {
                alert('Donor data imported successfully!');
                setUploadFile(null);
                fetchDonorStatistics();
                if (selectedCandidate) {
                    fetchCandidateAnalysis(selectedCandidate);
                }
            } else {
                setError(response.message || 'Failed to import donor data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setUploading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getRiskLevelBadge = (level: RiskLevel) => {
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${RISK_LEVEL_BADGE_COLORS[level]}`}>
                {level}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Donor Risk Analysis</h1>
                    <p className="text-black mt-2">Monitor donor contributions and identify potential risks</p>
                </div>
                <div className="flex gap-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="mb-2 w-full"
                        />
                        <button
                            onClick={handleFileUpload}
                            disabled={!uploadFile || uploading}
                            className="w-full px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Import CSV'}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 border border-red-200 bg-red-50 rounded-lg p-4">
                    <h3 className="text-red-800 font-medium">Error</h3>
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-black mb-2">Total Donors</h3>
                        <div className="text-2xl font-bold">{statistics.total_donors.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-black mb-2">Total Amount</h3>
                        <div className="text-2xl font-bold">{formatCurrency(statistics.total_amount)}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-black mb-2">Average Donation</h3>
                        <div className="text-2xl font-bold">{formatCurrency(statistics.average_donation)}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-black mb-2">High Risk Donors</h3>
                        <div className="text-2xl font-bold text-red-600">
                            {statistics.risk_distribution.red.count}
                        </div>
                        <div className="text-sm text-gray-500">
                            {statistics.risk_distribution.red.percentage.toFixed(1)}%
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    {['overview', 'candidates', 'high-risk', 'briefcase'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow border">
                            <h2 className="text-lg font-semibold mb-4">Risk Distribution</h2>
                            <div className="space-y-3">
                                {statistics && [
                                    { name: 'Green', value: statistics.risk_distribution.green.count, color: RISK_LEVEL_COLORS.GREEN },
                                    { name: 'Amber', value: statistics.risk_distribution.amber.count, color: RISK_LEVEL_COLORS.AMBER },
                                    { name: 'Red', value: statistics.risk_distribution.red.count, color: RISK_LEVEL_COLORS.RED },
                                ].map((risk) => (
                                    <div key={risk.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: risk.color }}
                                            ></div>
                                            <span>{risk.name}</span>
                                        </div>
                                        <span className="font-medium">{risk.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow border">
                            <h2 className="text-lg font-semibold mb-4">Donor Types</h2>
                            <div className="space-y-3">
                                {statistics && [
                                    { type: 'Individual', count: statistics.donor_types.individual.count },
                                    { type: 'Company', count: statistics.donor_types.company.count },
                                    { type: 'Organization', count: statistics.donor_types.organization.count },
                                    { type: 'Government', count: statistics.donor_types.government.count },
                                    { type: 'Other', count: statistics.donor_types.other.count },
                                ].map((donorType) => (
                                    <div key={donorType.type} className="flex justify-between">
                                        <span>{donorType.type}</span>
                                        <span className="font-medium">{donorType.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'candidates' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <label htmlFor="candidate-select">Select Candidate:</label>
                        <select
                            value={selectedCandidate?.toString() || ''}
                            onChange={(e) => setSelectedCandidate(e.target.value ? parseInt(e.target.value) : null)}
                            className="px-3 py-2 border border-gray-300 rounded-lg w-64"
                        >
                            <option value="">Choose a candidate</option>
                            {statistics?.top_donors.map((donor) => (
                                <option key={donor.candidate_id} value={donor.candidate_id.toString()}>
                                    Candidate {donor.candidate_id}
                                </option>
                            ))}
                        </select>
                    </div>

                    {candidateAnalysis && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow border">
                                    <h2 className="text-lg font-semibold mb-4">Risk Summary</h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Overall Risk Level</span>
                                            {getRiskLevelBadge(candidateAnalysis.risk_summary.overall_risk_level)}
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span>Compliance Score</span>
                                                <span className="font-semibold">{candidateAnalysis.risk_summary.compliance_score}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="h-2 rounded-full bg-green-500"
                                                    style={{ width: `${candidateAnalysis.risk_summary.compliance_score}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-black">Red Flags: {candidateAnalysis.risk_summary.red_flags.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow border">
                                    <h2 className="text-lg font-semibold mb-4">Donor Breakdown</h2>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Total Donors</span>
                                            <span className="font-semibold">{candidateAnalysis.total_donors}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Amount</span>
                                            <span className="font-semibold">{formatCurrency(candidateAnalysis.total_amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>High Risk Count</span>
                                            <span className="font-semibold text-red-600">{candidateAnalysis.risk_breakdown.red.count}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Briefcase Companies</span>
                                            <span className="font-semibold text-orange-600">{candidateAnalysis.briefcase_companies.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow border">
                                    <h2 className="text-lg font-semibold mb-4">Risk Distribution</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-green-600">Green</span>
                                                <span>{candidateAnalysis.risk_breakdown.green.percentage.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="h-2 rounded-full bg-green-500"
                                                    style={{ width: `${candidateAnalysis.risk_breakdown.green.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-yellow-600">Amber</span>
                                                <span>{candidateAnalysis.risk_breakdown.amber.percentage.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="h-2 rounded-full bg-yellow-500"
                                                    style={{ width: `${candidateAnalysis.risk_breakdown.amber.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-red-600">Red</span>
                                                <span>{candidateAnalysis.risk_breakdown.red.percentage.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="h-2 rounded-full bg-red-500"
                                                    style={{ width: `${candidateAnalysis.risk_breakdown.red.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {candidateAnalysis.risk_summary.red_flags.length > 0 && (
                                <div className="bg-white p-6 rounded-lg shadow border">
                                    <h2 className="text-lg font-semibold mb-4 text-red-600">Red Flags</h2>
                                    <ul className="space-y-2">
                                        {candidateAnalysis.risk_summary.red_flags.map((flag, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                <span className="text-sm">{flag}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'high-risk' && (
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4">High Risk Donors</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Donor Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Risk Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Risk Factors
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {statistics?.top_donors
                                    .filter(donor => donor.risk_level === 'RED')
                                    .slice(0, 10)
                                    .map((donor, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {donor.donor_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(donor.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getRiskLevelBadge(donor.risk_level)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    High Amount
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'briefcase' && (
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4">Briefcase Companies</h2>
                    <p className="text-sm text-black mb-4">
                        Companies that may exist primarily for political financing
                    </p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Company Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Candidate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Risk Factors
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {statistics?.briefcase_companies.map((company, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {company.company_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatCurrency(company.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Candidate {company.candidate_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex flex-wrap gap-1">
                                                {company.risk_factors.map((factor, factorIndex) => (
                                                    <span key={factorIndex} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {factor}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
