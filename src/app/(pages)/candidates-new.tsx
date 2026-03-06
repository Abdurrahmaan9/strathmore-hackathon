'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import MainLayout from '@/components/layouts/main-layout';
import { Breadcrumb } from '@/components/common/breadcrumb';
import useCandidates from '@/hooks/use-candidates';
import { BaseCandidate, RiskLevel, RISK_LEVEL_COLORS } from '@/types/api';

const CandidatesPage: React.FC = () => {
    const [isClient, setIsClient] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);

    const {
        candidates,
        candidateDetails,
        searchResults,
        loading,
        searchLoading,
        error,
        fetchCandidates,
        searchCandidates,
        getCandidateDetails,
        clearSearch,
        clearError
    } = useCandidates();

    const [searchQuery, setSearchQuery] = useState('');
    const [riskFilter, setRiskFilter] = useState<RiskLevel | ''>('');

    useEffect(() => {
        setIsClient(true);
        fetchCandidates();
    }, [fetchCandidates]);

    const handleSearch = async () => {
        if (!isClient) return;
        
        const filters: any = {};
        if (riskFilter) filters.risk_level = riskFilter;
        
        await searchCandidates(searchQuery, filters);
    };

    const handleCandidateClick = async (candidateId: number) => {
        if (!isClient) return;
        setSelectedCandidate(candidateId);
        await getCandidateDetails(candidateId);
    };

    const getRiskLevelColor = (level: RiskLevel) => {
        return RISK_LEVEL_COLORS[level];
    };

    const getRiskLevelBgColor = (level: RiskLevel) => {
        switch (level) {
            case 'GREEN': return 'bg-green-100 text-green-800';
            case 'AMBER': return 'bg-yellow-100 text-yellow-800';
            case 'RED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Don't render interactive elements during SSR
    if (!isClient) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <Breadcrumb pageTitle='Candidates' />
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-black">Loading candidates...</span>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // Error component
    if (error) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                        <p className="text-black mb-4">{error}</p>
                        <button
                            onClick={() => {
                                clearError();
                                fetchCandidates();
                            }}
                            className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700"
                            type="button"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const displayedCandidates = searchResults?.data || candidates;

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <Breadcrumb pageTitle='Candidates' />

                {/* Search and Filters */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search candidates by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={riskFilter}
                                    onChange={(e) => setRiskFilter(e.target.value as RiskLevel | '')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Risk Levels</option>
                                    <option value="GREEN">Green (Low Risk)</option>
                                    <option value="AMBER">Amber (Medium Risk)</option>
                                    <option value="RED">Red (High Risk)</option>
                                </select>
                                <button
                                    onClick={handleSearch}
                                    disabled={searchLoading}
                                    className="px-6 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    type="button"
                                >
                                    {searchLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                            Searching...
                                        </>
                                    ) : (
                                        'Search'
                                    )}
                                </button>
                                {(searchQuery || riskFilter) && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setRiskFilter('');
                                            clearSearch();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        type="button"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-black">Loading candidates...</span>
                        </div>
                    ) : (
                        <>
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-black">Total Candidates</p>
                                            <p className="text-2xl font-bold text-gray-900">{displayedCandidates.length}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-black">High Risk</p>
                                            <p className="text-2xl font-bold text-red-600">
                                                {displayedCandidates.filter(c => c.integrity.risk_level === 'RED').length}
                                            </p>
                                        </div>
                                        <TrendingDown className="w-8 h-8 text-red-600" />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-black">Low Risk</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {displayedCandidates.filter(c => c.integrity.risk_level === 'GREEN').length}
                                            </p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-green-600" />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-black">Total Spend</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(displayedCandidates.reduce((sum, c) => sum + c.financial_summary.total_estimated_spend, 0))}
                                            </p>
                                        </div>
                                        <DollarSign className="w-8 h-8 text-black" />
                                    </div>
                                </div>
                            </div>

                            {/* Candidates Grid */}
                            {displayedCandidates.length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                                    <p className="text-black">Try adjusting your search or filters</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {displayedCandidates.map((candidate) => (
                                        <div
                                            key={candidate.id}
                                            onClick={() => handleCandidateClick(candidate.id)}
                                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {candidate.name}
                                                </h3>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelBgColor(candidate.integrity.risk_level)}`}
                                                >
                                                    {candidate.integrity.risk_level}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-black">Integrity Score</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="h-2 rounded-full"
                                                                style={{
                                                                    width: `${candidate.integrity.score}%`,
                                                                    backgroundColor: getRiskLevelColor(candidate.integrity.risk_level)
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium">{candidate.integrity.score}%</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-black">Total Spend</span>
                                                    <span className="text-sm font-medium">{formatCurrency(candidate.financial_summary.total_estimated_spend)}</span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-black">Digital Spend</span>
                                                    <span className="text-sm font-medium">{formatCurrency(candidate.financial_summary.total_digital_spend)}</span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-black">Donors</span>
                                                    <span className="text-sm font-medium">{candidate.donor_count}</span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-black">High Risk Donors</span>
                                                    <span className="text-sm font-medium text-red-600">{candidate.high_risk_donors}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Candidate Details Modal */}
                {selectedCandidate && candidateDetails && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{candidateDetails.name}</h2>
                                        <span
                                            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelBgColor(candidateDetails.integrity.risk_level)}`}
                                        >
                                            {candidateDetails.integrity.risk_level} - {candidateDetails.integrity_score}% Integrity
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCandidate(null)}
                                        className="text-gray-400 hover:text-black"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-blue-600">Financial Summary</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-black">Total Spend</span>
                                                <span className="font-medium text-black">{formatCurrency(candidateDetails.financial_summary.total_estimated_spend)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">Digital Spend</span>
                                                <span className="font-medium text-black">{formatCurrency(candidateDetails.financial_summary.total_digital_spend)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">Physical Spend</span>
                                                <span className="font-medium text-black">{formatCurrency(candidateDetails.financial_summary.total_physical_spend)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-blue-600">Donor Summary</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-black">Total Donors</span>
                                                <span className="font-medium text-black">{candidateDetails.donor_count}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">Total Amount</span>
                                                <span className="font-medium text-black">{formatCurrency(candidateDetails.total_reported_income)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">High Risk Donors</span>
                                                <span className="font-medium text-red-600">{candidateDetails.risk_summary.high}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {candidateDetails.red_flags && Object.keys(candidateDetails.red_flags).length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-4 text-red-600">Red Flags</h3>
                                        <ul className="space-y-2">
                                            {Object.entries(candidateDetails.red_flags).map(([key, value]: [string, any], index: number) => (
                                                <li key={index} className="flex items-center gap-2 text-red-600">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    <span>{key}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default CandidatesPage;
