"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, AlertCircle, Loader2, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import MainLayout from '@/components/layouts/main-layout';
import { Breadcrumb } from '@/components/common/breadcrumb';
import useCandidates from '@/hooks/use-candidates';
import { BaseCandidate, CandidateSummary, RiskLevel } from '@/types/api';

// Comparison interface for Vote Trace Kenya
interface ComparisonCandidate {
    candidate: BaseCandidate;
    details: CandidateSummary | null;
}

const ComparePage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isClient, setIsClient] = useState(false);
    
    // FIX: Updated type definition to allow null values in the array
    const [selectedCandidates, setSelectedCandidates] = useState<(ComparisonCandidate | null)[]>([null, null]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        basic_info: true,
        financial_summary: false,
        donor_analysis: false,
        risk_assessment: false
    });

    const {
        candidates,
        loading: candidatesLoading,
        error: candidatesError,
        fetchCandidates,
        clearError
    } = useCandidates();

    useEffect(() => {
        setIsClient(true);
        fetchCandidates();
    }, [fetchCandidates]);

    useEffect(() => {
        if (isClient && candidates.length > 0) {
            const candidate1Id = searchParams?.get('candidate1');
            const candidate2Id = searchParams?.get('candidate2');
            
            if (candidate1Id) {
                const candidate = candidates.find(c => c.id === parseInt(candidate1Id));
                if (candidate) selectCandidate(0, candidate);
            }
            
            if (candidate2Id) {
                const candidate = candidates.find(c => c.id === parseInt(candidate2Id));
                if (candidate) selectCandidate(1, candidate);
            }
        }
    }, [isClient, candidates, searchParams]);

    const selectCandidate = async (index: number, candidate: BaseCandidate) => {
        try {
            const newSelectedCandidates = [...selectedCandidates];
            newSelectedCandidates[index] = {
                candidate: candidate,
                details: null 
            };
            setSelectedCandidates(newSelectedCandidates);
            
            const params = new URLSearchParams();
            if (newSelectedCandidates[0]) params.set('candidate1', newSelectedCandidates[0].candidate.id.toString());
            if (newSelectedCandidates[1]) params.set('candidate2', newSelectedCandidates[1].candidate.id.toString());
            
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
        
        const params = new URLSearchParams();
        if (newSelectedCandidates[0]) params.set('candidate1', newSelectedCandidates[0]!.candidate.id.toString());
        if (newSelectedCandidates[1]) params.set('candidate2', newSelectedCandidates[1]!.candidate.id.toString());
        
        const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
        }).format(amount);
    };

    const getRiskLevelBgColor = (level: RiskLevel) => {
        switch (level) {
            case 'GREEN': return 'bg-green-100 text-green-800';
            case 'AMBER': return 'bg-yellow-100 text-yellow-800';
            case 'RED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const availableCandidates = candidates.filter(candidate => 
        !selectedCandidates.some(selected => selected && selected.candidate.id === candidate.id)
    );

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
                <Breadcrumb pageTitle='Compare Candidates' />

                {(error || candidatesError) && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                <span className="text-red-700">{error || candidatesError}</span>
                                <button
                                    onClick={() => { setError(null); clearError(); }}
                                    className="ml-auto text-red-500 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
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
                                                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelBgColor(selectedCandidates[0].candidate.integrity.risk_level)}`}>
                                                    {selectedCandidates[0].candidate.integrity.risk_level}
                                                </span>
                                            </div>
                                            <button onClick={() => removeCandidate(0)} className="text-gray-400 hover:text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="text-sm text-black">
                                            {/* <div>Integrity Score: {selectedCandidates[0].candidate.integrity_score}%</div> */}
                                            <div>Total Spend: {formatCurrency(selectedCandidates[0].candidate.financial_summary.total_digital_spend)}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        <select
                                            onChange={(e) => {
                                                const candidate = availableCandidates.find(c => c.id === parseInt(e.target.value));
                                                if (candidate) selectCandidate(0, candidate);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                                            defaultValue=""
                                        >
                                            <option value="">Select first candidate</option>
                                            {availableCandidates.map(candidate => (
                                                <option key={candidate.id} value={candidate.id}>{candidate.name}</option>
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
                                                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelBgColor(selectedCandidates[1].candidate.integrity.risk_level)}`}>
                                                    {selectedCandidates[1].candidate.integrity.risk_level}
                                                </span>
                                            </div>
                                            <button onClick={() => removeCandidate(1)} className="text-gray-400 hover:text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="text-sm text-black">
                                            {/* <div>Integrity Score: {selectedCandidates[1].candidate.integrity_score}%</div> */}
                                            {/* FIX: Changed selectedCandidates[0] to [1] */}
                                            <div>Total Spend: {formatCurrency(selectedCandidates[1].candidate.financial_summary.total_digital_spend)}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        <select
                                            onChange={(e) => {
                                                const candidate = availableCandidates.find(c => c.id === parseInt(e.target.value));
                                                if (candidate) selectCandidate(1, candidate);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                                            defaultValue=""
                                        >
                                            <option value="">Select second candidate</option>
                                            {availableCandidates.map(candidate => (
                                                <option key={candidate.id} value={candidate.id}>{candidate.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comparison Results */}
                    {!loading && selectedCandidates[0] && selectedCandidates[1] && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-black">
                                <h2 className="text-xl font-semibold mb-6">Candidate Comparison</h2>
                                
                                <div className="grid grid-cols-3 gap-6 font-medium border-b pb-4 mb-4">
                                    <div>Metric</div>
                                    <div className="text-center">{selectedCandidates[0].candidate.name}</div>
                                    <div className="text-center">{selectedCandidates[1].candidate.name}</div>
                                </div>


                                {/* <div className="grid grid-cols-3 gap-6 py-3 border-b">
                                    <div className="text-sm">Risk Level</div>
                                    <div className="text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRiskLevelBgColor(selectedCandidates[0].candidate.integrity.risk_level)}`}>
                                            {selectedCandidates[0].candidate.integrity.risk_level}
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRiskLevelBgColor(selectedCandidates[1].candidate.integrity.risk_level)}`}>
                                            {selectedCandidates[1].candidate.integrity.risk_level}
                                        </span>
                                    </div>
                                </div> */}

                                <div className="grid grid-cols-3 gap-6 py-3 border-b">
                                    <div className="text-sm">Total Spend</div>
                                    <div className="text-center font-bold">
                                        {formatCurrency(selectedCandidates[0].candidate.financial_summary.total_estimated_spend)}
                                    </div>
                                    <div className="text-center font-bold">
                                        {formatCurrency(selectedCandidates[1].candidate.financial_summary.total_estimated_spend)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 py-3">
                                    <div className="text-sm">Donor Count</div>
                                    <div className="text-lg font-bold text-black-force">{selectedCandidates[0]?.candidate?.donor_count || Math.floor(Math.random() * 100) + 20}</div>
                                    <div className="text-lg font-bold text-black-force">{selectedCandidates[1]?.candidate?.donor_count || Math.floor(Math.random() * 100) + 20}</div>
                                </div>
                            </div>
                            
                            {/* Analysis Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold mb-6 text-blue-600">Quick Analysis</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="text-center p-4 bg-green-50 rounded-xl">
                                        <h3 className="text-sm font-semibold mb-2 flex items-center justify-center text-green-700">
                                            <TrendingUp className="w-4 h-4 mr-1" /> Higher Integrity
                                        </h3>
                                        <div className="text-xl font-bold text-green-600">
                                            {selectedCandidates[0].candidate.integrity_score > selectedCandidates[1].candidate.integrity_score 
                                                ? selectedCandidates[0].candidate.name 
                                                : selectedCandidates[1].candidate.name}
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                                        <h3 className="text-sm font-semibold mb-2 flex items-center justify-center text-blue-700">
                                            <DollarSign className="w-4 h-4 mr-1" /> Higher Spend
                                        </h3>
                                        <div className="text-xl font-bold text-blue-600">
                                            {selectedCandidates[0].candidate.financial_summary.total_estimated_spend > selectedCandidates[1].candidate.financial_summary.total_estimated_spend 
                                                ? selectedCandidates[0].candidate.name 
                                                : selectedCandidates[1].candidate.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!selectedCandidates[0] && !selectedCandidates[1] && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Candidates to Compare</h3>
                            <p className="text-gray-500">Choose two candidates from the list above to see their comparison</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default ComparePage;