'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import MainLayout from '@/components/layouts/main-layout';
import { Breadcrumb } from '@/components/common/breadcrumb';
import useCandidates from '../../../hooks/use-candidates';
import { BaseCandidate, RiskLevel, RISK_LEVEL_COLORS } from '../../../types/api';

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

    // Add ESC key handler to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedCandidate) {
                setSelectedCandidate(null);
            }
        };

        if (selectedCandidate) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [selectedCandidate]);

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
                                                {displayedCandidates.filter(c => c.integrity?.risk_level === 'RED').length}
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
                                                {displayedCandidates.filter(c => c.integrity?.risk_level === 'GREEN').length}
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
                                                {formatCurrency(displayedCandidates.reduce((sum, c) => sum + (c.financial_summary?.total_estimated_spend || 0), 0))}
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
                                    <p className="text-black mt-2">Monitor and analyze candidate integrity and campaign finance</p>
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
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelBgColor(candidate.integrity?.risk_level || 'GREEN')}`}
                                                >
                                                    {candidate.integrity?.risk_level || 'GREEN'}
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
                                                                    width: `${candidate.integrity?.score || 0}%`,
                                                                    backgroundColor: getRiskLevelColor(candidate.integrity?.risk_level || 'GREEN')
                                                                }}
                                                            />
                                                        </div>
                                                    <span className="text-sm font-medium text-black-force">{candidate.integrity?.score || 0}%</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-black">Total Spend</span>
                                                    <span className="text-sm font-medium text-black-force">{formatCurrency(candidate.financial_summary?.total_estimated_spend || 0)}</span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-black">Digital Spend</span>
                                                    <span className="text-sm font-medium text-black-force">{formatCurrency(candidate.financial_summary?.total_digital_spend || 0)}</span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-black">Donors</span>
                                                    <span className="text-sm font-medium text-black-force">{candidate.donor_count || 0}</span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-black">High Risk Donors</span>
                                                    <span className="text-sm font-medium text-red-600">{candidate.high_risk_donors || 0}</span>
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
                    <div 
                        className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setSelectedCandidate(null);
                            }
                        }}
                    >
                        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto transform transition-all" onClick={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{candidateDetails.candidate?.name || 'Unknown'}</h2>
                                        <span
                                            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelBgColor(candidateDetails.integrity?.risk_level || 'GREEN')}`}
                                        >
                                            {candidateDetails.integrity?.risk_level || 'GREEN'} - {candidateDetails.integrity?.score || 0}% Integrity
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCandidate(null)}
                                        className="text-gray-400 hover:text-black transition-colors p-1 rounded-lg hover:bg-gray-100"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-black-force">Financial Summary</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-black">Total Estimated Spend</span>
                                                <span className="font-medium text-black-force">{formatCurrency(candidateDetails.financial_summary?.total_estimated_spend || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">Digital Spend</span>
                                                <span className="font-medium text-black-force">{formatCurrency(candidateDetails.financial_summary?.total_digital_spend || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">Physical Spend</span>
                                                <span className="font-medium text-black-force">{formatCurrency(candidateDetails.financial_summary?.total_physical_spend || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">Reported Income</span>
                                                <span className="font-medium text-black-force">{formatCurrency(candidateDetails.financial_summary?.total_reported_income || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">Spending Gap</span>
                                                <span className={`font-medium ${candidateDetails.financial_summary?.spending_gap && candidateDetails.financial_summary.spending_gap < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {formatCurrency(candidateDetails.financial_summary?.spending_gap || 0)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">Spending Gap Ratio</span>
                                                <span className="font-medium text-black-force">{((candidateDetails.financial_summary?.spending_gap_ratio || 0) * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-black-force">Donor Summary</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-black">Total Donors</span>
                                                <span className="font-medium text-black-force">{candidateDetails.donor_count || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">Total Reported Income</span>
                                                <span className="font-medium text-black-force">{formatCurrency(candidateDetails.total_reported_income || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">High Risk Donors</span>
                                                <span className="font-medium text-red-600">{candidateDetails.risk_summary?.high || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">Medium Risk Donors</span>
                                                <span className="font-medium text-yellow-600">{candidateDetails.risk_summary?.medium || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">Low Risk Donors</span>
                                                <span className="font-medium text-green-600">{candidateDetails.risk_summary?.low || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-black">High Risk Percentage</span>
                                                <span className="font-medium text-black-force">{(candidateDetails.risk_summary?.high_risk_percentage || 0).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Donors List Section */}
                                {candidateDetails.donors && candidateDetails.donors.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-4 text-black-force">Top Donors</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Age</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {candidateDetails.donors.slice(0, 10).map((donor, index) => (
                                                        <tr key={donor.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {donor.donor_name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatCurrency(donor.donation_amount)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    donor.risk_score === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                                    donor.risk_score === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                                }`}>
                                                                    {donor.risk_score}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {donor.company_age_days ? `${donor.company_age_days} days` : 'Unknown'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {donor.registration_date || 'Unknown'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {candidateDetails.donors.length > 10 && (
                                                <div className="mt-4 text-center">
                                                    <p className="text-sm text-gray-500">
                                                        Showing 10 of {candidateDetails.donors.length} donors
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Red Flags Section */}
                                {(candidateDetails.red_flags?.briefcase_companies > 0 || candidateDetails.red_flags?.unverifiable_entities > 0) && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-4 text-red-600">Red Flags</h3>
                                        <div className="space-y-3">
                                            {candidateDetails.red_flags?.briefcase_companies > 0 && (
                                                <div className="flex items-center gap-2 text-red-600">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    <span>{candidateDetails.red_flags.briefcase_companies} Briefcase Companies Detected</span>
                                                </div>
                                            )}
                                            {candidateDetails.red_flags?.unverifiable_entities > 0 && (
                                                <div className="flex items-center gap-2 text-red-600">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    <span>{candidateDetails.red_flags.unverifiable_entities} Unverifiable Entities Found</span>
                                                </div>
                                            )}
                                            {candidateDetails.red_flags?.concentration_risk?.top_donor_percentage > 50 && (
                                                <div className="flex items-center gap-2 text-red-600">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    <span>High Concentration Risk: Top donor represents {(candidateDetails.red_flags.concentration_risk.top_donor_percentage).toFixed(1)}% of donations</span>
                                                </div>
                                            )}
                                        </div>
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
