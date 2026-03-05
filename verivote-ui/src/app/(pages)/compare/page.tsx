"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, AlertCircle, Loader2, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import MainLayout from '@/components/layouts/main-layout';
import { Breadcrumb } from '@/components/common/breadcrumb';
import useCandidates from '@/hooks/use-candidates';
import { BaseCandidate, CandidateSummary, RiskLevel } from '@/types/api';

// Comparison interface for VoteTrace360
interface ComparisonCandidate {
    candidate: BaseCandidate;
    details: CandidateSummary | null;
}

const ComparePage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isClient, setIsClient] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState<ComparisonCandidate[]>([null, null]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        basic_info: true,
        financial_summary: false,
        donor_analysis: false,
        risk_assessment: false
    });

    // Use the new candidates hook
    const {
        candidates,
        candidateDetails,
        loading: candidatesLoading,
        error: candidatesError,
        fetchCandidates,
        getCandidateDetails,
        clearError
    } = useCandidates();

    useEffect(() => {
        setIsClient(true);
        fetchCandidates();
    }, [fetchCandidates]);

    useEffect(() => {
        if (isClient && candidates.length > 0) {
            // Check for URL parameters from single candidate page
            const candidate1Id = searchParams?.get('candidate1');
            const candidate2Id = searchParams?.get('candidate2');
            
            if (candidate1Id) {
                const candidate = candidates.find(c => c.id === parseInt(candidate1Id));
                if (candidate) {
                    selectCandidate(0, candidate);
                }
            }
            
            if (candidate2Id) {
                const candidate = candidates.find(c => c.id === parseInt(candidate2Id));
                if (candidate) {
                    selectCandidate(1, candidate);
                }
            }
        }
    }, [isClient, candidates, searchParams]);

    const selectCandidate = async (index: number, candidate: BaseCandidate) => {
        try {
            // Don't fetch details - just use the basic candidate info for comparison
            const newSelectedCandidates = [...selectedCandidates];
            newSelectedCandidates[index] = {
                candidate: candidate,
                details: null // We don't need detailed info for basic comparison
            };
            setSelectedCandidates(newSelectedCandidates);
            
            // Update URL
            const params = new URLSearchParams();
            if (newSelectedCandidates[0]) {
                params.set('candidate1', newSelectedCandidates[0].candidate.id.toString());
            }
            if (newSelectedCandidates[1]) {
                params.set('candidate2', newSelectedCandidates[1].candidate.id.toString());
            }
            
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, '', newUrl);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to select candidate');
        }
    };

    const removeCandidate = (index: number) => {
        const newSelectedCandidates = [...selectedCandidates];
        newSelectedCandidates[index] = null;
        setSelectedCandidates(newSelectedCandidates);
        
        // Update URL
        const params = new URLSearchParams();
        if (newSelectedCandidates[0]) {
            params.set('candidate1', newSelectedCandidates[0].candidate.id.toString());
        }
        if (newSelectedCandidates[1]) {
            params.set('candidate2', newSelectedCandidates[1].candidate.id.toString());
        }
        
        const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getRiskLevelColor = (level: RiskLevel) => {
        switch (level) {
            case 'GREEN': return '#10B981';
            case 'AMBER': return '#F59E0B';
            case 'RED': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getRiskLevelBgColor = (level: RiskLevel) => {
        switch (level) {
            case 'GREEN': return 'bg-green-100 text-green-800';
            case 'AMBER': return 'bg-yellow-100 text-yellow-800';
            case 'RED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-black-800';
        }
    };

    const availableCandidates = candidates.filter(candidate => 
        !selectedCandidates.some(selected => selected && selected.candidate.id === candidate.id)
    );

    // Don't render interactive elements during SSR
    if (!isClient) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <Breadcrumb pageTitle='Compare Candidates' />
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-black">Loading...</span>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <Breadcrumb pageTitle='Compare Candidates' />

                {/* Error Display */}
                {(error || candidatesError) && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                <span className="text-red-700">{error || candidatesError}</span>
                                <button
                                    onClick={() => {
                                        setError(null);
                                        clearError();
                                    }}
                                    className="ml-auto text-red-500 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    {/* Debug Info - Remove in production
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h3>
                            <div className="text-xs text-yellow-700 space-y-1">
                                <div>Candidates Loading: {candidatesLoading ? 'Yes' : 'No'}</div>
                                <div>Total Candidates: {candidates.length}</div>
                                <div>Available Candidates: {availableCandidates.length}</div>
                                <div>Selected Candidates: {selectedCandidates.filter(c => c !== null).length}</div>
                                <div>Error: {error || candidatesError || 'None'}</div>
                            </div>
                        </div>
                    )} */}

                    {/* Candidate Selection */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-6 text-black">Select Candidates to Compare</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Candidate 1 Selection */}
                            <div>
                                <h3 className="text-lg font-medium mb-4 text-black">Candidate 1</h3>
                                {selectedCandidates[0] ? (
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-semibold text-black">{selectedCandidates[0].candidate.name}</h4>
                                                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelBgColor(selectedCandidates[0].candidate.risk_level)}`}>
                                                    {selectedCandidates[0].candidate.risk_level}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeCandidate(0)}
                                                className="text-black-400 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="text-sm text-black">
                                            <div>Integrity Score: {selectedCandidates[0].candidate.integrity_score}%</div>
                                            <div>Total Spend: {formatCurrency(selectedCandidates[0].candidate.total_spend)}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        <select
                                            onChange={(e) => {
                                                const candidate = availableCandidates.find(c => c.id === parseInt(e.target.value));
                                                if (candidate) selectCandidate(0, candidate);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                            defaultValue=""
                                        >
                                            <option value="">Select first candidate</option>
                                            {availableCandidates.map(candidate => (
                                                <option key={candidate.id} value={candidate.id}>
                                                    {candidate.name} - {candidate.risk_level}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Candidate 2 Selection */}
                            <div>
                                <h3 className="text-lg font-medium mb-4 text-black">Candidate 2</h3>
                                {selectedCandidates[1] ? (
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-semibold text-black">{selectedCandidates[1].candidate.name}</h4>
                                                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelBgColor(selectedCandidates[1].candidate.risk_level)}`}>
                                                    {selectedCandidates[1].candidate.risk_level}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeCandidate(1)}
                                                className="text-black-400 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="text-sm text-black">
                                            <div>Integrity Score: {selectedCandidates[1].candidate.integrity_score}%</div>
                                            <div>Total Spend: {formatCurrency(selectedCandidates[1].candidate.total_spend)}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        <select
                                            onChange={(e) => {
                                                const candidate = availableCandidates.find(c => c.id === parseInt(e.target.value));
                                                if (candidate) selectCandidate(1, candidate);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                            defaultValue=""
                                        >
                                            <option value="">Select second candidate</option>
                                            {availableCandidates.map(candidate => (
                                                <option key={candidate.id} value={candidate.id}>
                                                    {candidate.name} - {candidate.risk_level}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comparison Results */}
                    {selectedCandidates[0] && selectedCandidates[1] && (
                        <div className="space-y-6">
                            {/* Basic Comparison */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold mb-6">Candidate Comparison</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-sm text-black mb-2">Metric</div>
                                    </div>
                                    <div className="text-center">
                                        <h4 className="font-semibold text-black">{selectedCandidates[0].candidate.name}</h4>
                                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelBgColor(selectedCandidates[0].candidate.risk_level)}`}>
                                            {selectedCandidates[0].candidate.risk_level}
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <h4 className="font-semibold text-black">{selectedCandidates[1].candidate.name}</h4>
                                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelBgColor(selectedCandidates[1].candidate.risk_level)}`}>
                                            {selectedCandidates[1].candidate.risk_level}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-sm text-black">Integrity Score</div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-black-force">
                                                {selectedCandidates[0].candidate.integrity_score}%
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div
                                                    className="h-2 rounded-full"
                                                    style={{
                                                        width: `${selectedCandidates[0].candidate.integrity_score}%`,
                                                        backgroundColor: getRiskLevelColor(selectedCandidates[0].candidate.risk_level)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-black-force">
                                                {selectedCandidates[1].candidate.integrity_score}%
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div
                                                    className="h-2 rounded-full"
                                                    style={{
                                                        width: `${selectedCandidates[1].candidate.integrity_score}%`,
                                                        backgroundColor: getRiskLevelColor(selectedCandidates[1].candidate.risk_level)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-sm text-black">Total Spend</div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-black-force">
                                                {formatCurrency(selectedCandidates[0].candidate.total_spend)}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-black-force">
                                                {formatCurrency(selectedCandidates[1].candidate.total_spend)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-sm text-black">Digital Spend</div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-black-force">
                                                {formatCurrency(selectedCandidates[0].candidate.digital_spend)}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-black-force">
                                                {formatCurrency(selectedCandidates[1].candidate.digital_spend)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-sm text-black">Donor Count</div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-black-force">
                                                {selectedCandidates[0].candidate.donor_count}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-black-force">
                                                {selectedCandidates[1].candidate.donor_count}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-sm text-black">High Risk Donors</div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-red-600">
                                                {selectedCandidates[0].candidate.high_risk_donors}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-red-600">
                                                {selectedCandidates[1].candidate.high_risk_donors}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Winner Analysis */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold mb-6">Analysis</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                                            Higher Integrity
                                        </h3>
                                        <div className="text-2xl font-bold text-green-600">
                                            {selectedCandidates[0].candidate.integrity_score > selectedCandidates[1].candidate.integrity_score 
                                                ? selectedCandidates[0].candidate.name 
                                                : selectedCandidates[1].candidate.name}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                                            Higher Spend
                                        </h3>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {selectedCandidates[0].candidate.total_spend > selectedCandidates[1].candidate.total_spend 
                                                ? selectedCandidates[0].candidate.name 
                                                : selectedCandidates[1].candidate.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No Candidates Selected */}
                    {!selectedCandidates[0] && !selectedCandidates[1] && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-black-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-black-900 mb-2">Select Candidates to Compare</h3>
                            <p className="text-black">Choose two candidates from the list above to see their comparison</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default ComparePage;
