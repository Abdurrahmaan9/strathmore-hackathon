"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Filter, X, ExternalLink, AlertCircle, Loader2, Trophy, Star, TrendingUp, User } from 'lucide-react';
import MainLayout from '@/components/layouts/main-layout';
import { Breadcrumb } from '@/components/common/breadcrumb';
import GlobalSearch from '@/components/common/global-search';
import candidatesService from '@/services/candidates.service';
import useCandidates from '@/hooks/use-candidates';
import { BaseCandidate, CandidateSummary, RiskLevel } from '@/types/api';

// Comparison interface for Vote Trace Kenya
interface ComparisonCandidate {
    candidate: BaseCandidate;
    details: CandidateSummary | null;
}

interface Filters {
    position: string;
    county_id: string;
    party_id: string;
    search: string;
}

const ComparePage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isClient, setIsClient] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState<ComparisonCandidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableCandidates, setAvailableCandidates] = useState<BaseCandidate[]>([]);
    const [filters, setFilters] = useState<Filters>({
        position: '',
        county_id: '',
        party_id: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [counties, setCounties] = useState<any[]>([]);
    const [parties, setParties] = useState<any[]>([]);
    const [comparisonData, setComparisonData] = useState<any>(null);
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

    const positions = [
        { value: 'president', label: 'Presidential' },
        { value: 'governor', label: 'Governor' },
        { value: 'senator', label: 'Senator' },
        { value: 'mp', label: 'Member of Parliament' },
        { value: 'mca', label: 'MCA' },
        { value: 'women_rep', label: 'Women Representative' }
    ];

    useEffect(() => {
        setIsClient(true);
        fetchCandidates();
    }, [fetchCandidates]);

    useEffect(() => {
        if (isClient && candidates.length > 0) {
            // Check for URL parameters from single candidate page
            const candidate1Id = searchParams?.get('candidate1');
            
            if (candidate1Id) {
                const candidate = candidates.find(c => c.id === parseInt(candidate1Id));
                if (candidate) {
                    setSelectedCandidates([candidate]);
                }
            }
        }
    }, [isClient, candidates, searchParams]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            // Load filter options
            const [countiesResponse, partiesResponse] = await Promise.all([
                candidatesService.getCounties(),
                candidatesService.getParties()
            ]);

            if (countiesResponse.success && partiesResponse.success) {
                setCounties(countiesResponse.data || []);
                setParties(partiesResponse.data || []);
            }

            await loadCandidatesForComparison();
        } catch (err) {
            console.error('Error loading initial data:', err);
            setError('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    const loadCandidateFromUrl = async (candidateSlug: string, position?: string) => {
        try {
            // First, load the specific candidate for comparison
            const response = await candidatesService.getCandidateSummary(parseInt(candidateSlug));

            if (response.success && response.data) {
                const candidate = response.data;

                // Set the candidate in the first slot
                setSelectedCandidates([candidate, null]);

                // If position wasn't in URL but we got it from candidate data, update filters
                if (!position && candidate.position) {
                    setFilters(prev => ({
                        ...prev,
                        position: candidate.position.toLowerCase()
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading candidate from URL:', error);
            // If loading fails, just continue with normal flow
        }
    };

    const loadCandidatesForComparison = async () => {
        try {
            setLoading(true);
            const response = await candidatesService.getAllCandidates();

            if (response.success) {
                setAvailableCandidates(response.data || []);
            } else {
                console.error('Failed to load candidates:', response.message);
                setAvailableCandidates([]);
            }
        } catch (err) {
            console.error('Error loading candidates:', err);
            setAvailableCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCandidateSelect = (index: number, candidateSlug: string | null) => {
        const candidate = candidateSlug ? availableCandidates.find(c => c.slug === candidateSlug) : null;
        const newSelection = [...selectedCandidates];
        newSelection[index] = candidate as ComparisonCandidate | null;
        setSelectedCandidates(newSelection);

        // Auto-set position filter when first candidate is selected (if not already set)
        if (index === 0 && candidate && !filters.position) {
            setFilters(prev => ({
                ...prev,
                position: candidate.position.toLowerCase()
            }));
        }

        // Clear comparison data when selection changes
        if (comparisonData) {
            setComparisonData(null);
        }

        // Update URL to reflect current selection (optional)
        updateUrlWithSelection(newSelection);
    };

    const updateUrlWithSelection = (candidates: (ComparisonCandidate | null)[]) => {
        const params = new URLSearchParams();

        if (candidates[0]?.slug) {
            params.set('candidate1', candidates[0].slug);
            params.set('position', candidates[0].position.toLowerCase());
        }

        const newUrl = params.toString() ? `/compare?${params.toString()}` : '/compare';

        // Use replace to avoid adding to browser history for each selection
        router.replace(newUrl, { scroll: false });
    };

    const loadComparisonData = async () => {
        if (!selectedCandidates[0] || !selectedCandidates[1]) {
            setError('Please select two candidates to compare');
            return;
        }

        // Validation: Check if candidates are of the same position
        if (selectedCandidates[0].position !== selectedCandidates[1].position) {
            setError(`Cannot compare candidates of different positions. ${selectedCandidates[0].name} is running for ${selectedCandidates[0].position} while ${selectedCandidates[1].name} is running for ${selectedCandidates[1].position}.`);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // For now, just set a simple comparison message
            setComparisonData({
                message: 'Comparison feature is under development'
            });
        } catch (err) {
            console.error('Error comparing candidates:', err);
            setError('Failed to load comparison data');
        } finally {
            setLoading(false);
        }
    };

    const clearSelection = () => {
        setSelectedCandidates([null, null]);
        setComparisonData(null);
        setError(null);

        // Clear URL parameters and position filter
        setFilters(prev => ({
            ...prev,
            position: ''
        }));

        router.replace('/compare', { scroll: false });
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));

        // Clear selections when position changes to ensure same-position comparison
        if (key === 'position') {
            setSelectedCandidates([null, null]);
            setComparisonData(null);
        }
    };

    const clearFilters = () => {
        setFilters({
            position: '',
            county_id: '',
            party_id: '',
            search: ''
        });
        setSelectedCandidates([null, null]);
        setComparisonData(null);
    };

    const handleSearch = (query: string, filters?: any) => {
        // Handle global search if needed
        console.log('Global search:', query, filters);
    };

    const getGradeColor = (grade: string): string => {
        switch (grade.toUpperCase()) {
            case 'A+':
            case 'A': return 'text-green-700 bg-green-100';
            case 'B+':
            case 'B': return 'text-blue-700 bg-blue-100';
            case 'C+':
            case 'C': return 'text-yellow-700 bg-yellow-100';
            case 'D+':
            case 'D': return 'text-orange-700 bg-orange-100';
            case 'F': return 'text-red-700 bg-red-100';
            default: return 'text-gray-700 bg-gray-100';
        }
    };

    const getScoreColor = (percentage: number): string => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 80) return 'text-blue-600';
        if (percentage >= 70) return 'text-yellow-600';
        if (percentage >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const getProgressBarColor = (percentage: number): string => {
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 80) return 'bg-blue-500';
        if (percentage >= 70) return 'bg-yellow-500';
        if (percentage >= 60) return 'bg-orange-500';
        return 'bg-red-500';
    };

    // Component: Candidate Selector
    const CandidateSelector: React.FC<{
        label: string;
        selectedCandidate: ComparisonCandidate | null;
        onSelect: (candidateSlug: string | null) => void;
        excludeSlug?: string;
    }> = ({ label, selectedCandidate, onSelect, excludeSlug }) => {
        // Filter candidates to only show those of the same position
        const filteredCandidates = availableCandidates.filter(candidate => {
            // If no position is selected, show all
            if (!filters.position) return candidate.slug !== excludeSlug;

            // Otherwise, only show candidates of the selected position
            return candidate.position.toLowerCase() === filters.position.toLowerCase() && candidate.slug !== excludeSlug;
        });

        return (
            <div className="relative">
                <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 bg-white appearance-none focus:border-blue-500 focus:outline-none"
                    value={selectedCandidate?.slug || ''}
                    onChange={(e) => onSelect(e.target.value || null)}
                    disabled={candidatesLoading}
                >
                    <option value="">
                        {candidatesLoading ? 'Loading candidates...' : label}
                    </option>
                    {filteredCandidates.map(candidate => (
                        <option key={candidate.slug} value={candidate.slug}>
                            {candidate.name} - {candidate.party} ({candidate.county})
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                {filters.position && (
                    <div className="text-xs text-gray-500 mt-1">
                        Showing only {positions.find(p => p.value === filters.position)?.label || filters.position} candidates
                        {filteredCandidates.length === 0 && !candidatesLoading && (
                            <span className="text-orange-600 ml-1">(No candidates available)</span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Component: Candidate Card
    const CandidateCard: React.FC<{ candidate: ComparisonCandidate; position: 'left' | 'right' }> = ({ candidate, position }) => (
        <div className={`text-center ${position === 'left' ? 'pr-4' : 'pl-4'}`}>
            <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-200">
                {candidate.image && candidate.image !== '/api/placeholder/150/150' ? (
                    <img
                        src={candidate.image}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center text-gray-400">
                                    <span class="text-4xl font-bold">${candidate.name.charAt(0)}</span>
                                </div>
                            `;
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User className="w-16 h-16" />
                    </div>
                )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{candidate.name}</h3>
            <p className="text-sm text-black mb-1">{candidate.party.name}</p>
            <p className="text-xs text-gray-500 mb-2">{candidate.position} • {candidate.county}</p>
            {candidate.tagline && (
                <p className="text-xs text-gray-500 italic">"{candidate.tagline}"</p>
            )}
        </div>
    );

    // Component: Enhanced Suitability Scores based on API documentation
    const SuitabilityScoresComparison: React.FC<{
        candidate1Scoring: CandidateScoring;
        candidate2Scoring: CandidateScoring;
    }> = ({ candidate1Scoring, candidate2Scoring }) => {
        const winner = candidate1Scoring.percentage > candidate2Scoring.percentage ? 1 : 2;
        const scoreDifference = Math.abs(candidate1Scoring.percentage - candidate2Scoring.percentage);

        return (
            <div className="space-y-6">
                {/* Overall Scores Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 rounded-lg border-2 ${winner === 1 ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
                        <div className="text-center">
                            {winner === 1 && (
                                <div className="flex justify-center mb-2">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedCandidates[0]?.name}</h3>
                            <div className={`text-4xl font-bold mb-2 ${getScoreColor(candidate1Scoring.percentage)}`}>
                                {candidate1Scoring.percentage.toFixed(1)}%
                            </div>
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${getGradeColor(candidate1Scoring.grade.letter)}`}>
                                Grade {candidate1Scoring.grade.letter}
                            </div>
                            <div className="text-sm text-black mb-3">{candidate1Scoring.grade.description}</div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div
                                    className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(candidate1Scoring.percentage)}`}
                                    style={{ width: `${Math.min(candidate1Scoring.percentage, 100)}%` }}
                                />
                            </div>
                            <div className="text-xs text-gray-500">
                                Score: {candidate1Scoring.total_score.toFixed(2)}/10
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-lg border-2 ${winner === 2 ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
                        <div className="text-center">
                            {winner === 2 && (
                                <div className="flex justify-center mb-2">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedCandidates[1]?.name}</h3>
                            <div className={`text-4xl font-bold mb-2 ${getScoreColor(candidate2Scoring.percentage)}`}>
                                {candidate2Scoring.percentage.toFixed(1)}%
                            </div>
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${getGradeColor(candidate2Scoring.grade.letter)}`}>
                                Grade {candidate2Scoring.grade.letter}
                            </div>
                            <div className="text-sm text-black mb-3">{candidate2Scoring.grade.description}</div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div
                                    className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(candidate2Scoring.percentage)}`}
                                    style={{ width: `${Math.min(candidate2Scoring.percentage, 100)}%` }}
                                />
                            </div>
                            <div className="text-xs text-gray-500">
                                Score: {candidate2Scoring.total_score.toFixed(2)}/10
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Difference Analysis */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-center">
                        <h4 className="font-semibold text-gray-800 mb-2">Score Analysis</h4>
                        <div className="text-sm text-black">
                            <p className="mb-1">
                                <span className="font-medium">{selectedCandidates[winner - 1]?.name}</span> leads by{' '}
                                <span className="font-bold text-blue-600">{scoreDifference.toFixed(1)} percentage points</span>
                            </p>
                            <p>
                                Score difference: {candidate1Scoring.total_score.toFixed(2)} vs {candidate2Scoring.total_score.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Categories Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">{selectedCandidates[0]?.name} - Category Breakdown</h4>
                        <div className="space-y-3">
                            {candidate1Scoring.categories.map((category) => (
                                <div key={category.id} className="bg-blue-50 p-3 rounded">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-800">{category.name}</span>
                                        <span className="text-sm font-bold text-blue-600">
                                            {category.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="text-xs text-black mb-2">
                                        Weight: {category.weight_percentage}% | Score: {category.score.toFixed(1)}/10
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div
                                            className="h-2 bg-blue-500 rounded-full"
                                            style={{ width: `${Math.min(category.percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">{selectedCandidates[1]?.name} - Category Breakdown</h4>
                        <div className="space-y-3">
                            {candidate2Scoring.categories.map((category) => (
                                <div key={category.id} className="bg-green-50 p-3 rounded">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-800">{category.name}</span>
                                        <span className="text-sm font-bold text-green-600">
                                            {category.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="text-xs text-black mb-2">
                                        Weight: {category.weight_percentage}% | Score: {category.score.toFixed(1)}/10
                                    </div>
                                    <div className="w-full bg-green-200 rounded-full h-2">
                                        <div
                                            className="h-2 bg-green-500 rounded-full"
                                            style={{ width: `${Math.min(category.percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Component: Comparison Section
    const ComparisonSection: React.FC<{
        title: string;
        sectionKey: string;
        children: React.ReactNode;
    }> = ({ title, sectionKey, children }) => {
        const isExpanded = expandedSections[sectionKey];

        return (
            <div className="border border-gray-200 rounded-lg mb-4">
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-black" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-black" />
                    )}
                </button>
                {isExpanded && (
                    <div className="p-6 border-t border-gray-200">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    // Component: Basic Info Comparison
    const BasicInfoComparison: React.FC<{ data: ComparisonData['basic_info'] }> = ({ data }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">{selectedCandidates[0]?.name}</h4>
                <div className="space-y-2 text-sm">
                    <div><strong>Age:</strong> {data.age.candidate1}</div>
                    <div><strong>Gender:</strong> {data.gender.candidate1}</div>
                    <div><strong>Location:</strong> {data.location.candidate1}</div>
                    <div><strong>Party:</strong> {data.party.candidate1}</div>
                </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">{selectedCandidates[1]?.name}</h4>
                <div className="space-y-2 text-sm">
                    <div><strong>Age:</strong> {data.age.candidate2}</div>
                    <div><strong>Gender:</strong> {data.gender.candidate2}</div>
                    <div><strong>Location:</strong> {data.location.candidate2}</div>
                    <div><strong>Party:</strong> {data.party.candidate2}</div>
                </div>
            </div>
        </div>
    );

    // Component: Education Comparison
    const EducationComparison: React.FC<{ data: ComparisonData['education'] }> = ({ data }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">{selectedCandidates[0]?.name}</h4>
                {data.candidate1.length > 0 ? (
                    <div className="space-y-3">
                        {data.candidate1.map((edu, index) => (
                            <div key={index} className="text-sm">
                                <div className="font-medium">{edu.qualification}</div>
                                <div className="text-blue-800">{edu.institution}</div>
                                <div className="text-blue-600">{edu.field_of_study}</div>
                                <div className="text-xs text-blue-500">{edu.period}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-blue-600">No education information available</div>
                )}
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">{selectedCandidates[1]?.name}</h4>
                {data.candidate2.length > 0 ? (
                    <div className="space-y-3">
                        {data.candidate2.map((edu, index) => (
                            <div key={index} className="text-sm">
                                <div className="font-medium">{edu.qualification}</div>
                                <div className="text-green-800">{edu.institution}</div>
                                <div className="text-green-600">{edu.field_of_study}</div>
                                <div className="text-xs text-green-500">{edu.period}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-green-600">No education information available</div>
                )}
            </div>
        </div>
    );

    // Component: Experience Comparison
    const ExperienceComparison: React.FC<{ data: ComparisonData['experience'] }> = ({ data }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">{selectedCandidates[0]?.name}</h4>
                {data.candidate1.length > 0 ? (
                    <div className="space-y-3">
                        {data.candidate1.map((exp, index) => (
                            <div key={index} className="text-sm">
                                <div className="font-medium">{exp.position}</div>
                                <div className="text-blue-800">{exp.company}</div>
                                <div className="text-blue-600">{exp.type}</div>
                                <div className="text-xs text-blue-500">{exp.period}</div>
                                {exp.description && (
                                    <div className="text-xs text-blue-600 mt-1">{exp.description.substring(0, 100)}...</div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-blue-600">No work experience information available</div>
                )}
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">{selectedCandidates[1]?.name}</h4>
                {data.candidate2.length > 0 ? (
                    <div className="space-y-3">
                        {data.candidate2.map((exp, index) => (
                            <div key={index} className="text-sm">
                                <div className="font-medium">{exp.position}</div>
                                <div className="text-green-800">{exp.company}</div>
                                <div className="text-green-600">{exp.type}</div>
                                <div className="text-xs text-green-500">{exp.period}</div>
                                {exp.description && (
                                    <div className="text-xs text-green-600 mt-1">{exp.description.substring(0, 100)}...</div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-green-600">No work experience information available</div>
                )}
            </div>
        </div>
    );

    // Component: Political Experience Comparison
    const PoliticalExperienceComparison: React.FC<{ data: ComparisonData['political_experience'] }> = ({ data }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">{selectedCandidates[0]?.name}</h4>
                {data.candidate1.length > 0 ? (
                    <div className="space-y-3">
                        {data.candidate1.map((exp, index) => (
                            <div key={index} className="text-sm">
                                <div className="font-medium">{exp.position}</div>
                                <div className="text-blue-800">{exp.party}</div>
                                <div className="text-blue-600">{exp.period}</div>
                                {exp.election_year && (
                                    <div className="text-xs text-blue-500">Election: {exp.election_year}</div>
                                )}
                                {exp.achievements && (
                                    <div className="text-xs text-blue-600 mt-1">{exp.achievements.substring(0, 100)}...</div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-blue-600">No political experience information available</div>
                )}
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">{selectedCandidates[1]?.name}</h4>
                {data.candidate2.length > 0 ? (
                    <div className="space-y-3">
                        {data.candidate2.map((exp, index) => (
                            <div key={index} className="text-sm">
                                <div className="font-medium">{exp.position}</div>
                                <div className="text-green-800">{exp.party}</div>
                                <div className="text-green-600">{exp.period}</div>
                                {exp.election_year && (
                                    <div className="text-xs text-green-500">Election: {exp.election_year}</div>
                                )}
                                {exp.achievements && (
                                    <div className="text-xs text-green-600 mt-1">{exp.achievements.substring(0, 100)}...</div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-green-600">No political experience information available</div>
                )}
            </div>
        </div>
    );

    // Component: Policies Comparison
    const PoliciesComparison: React.FC<{ data: ComparisonData['policies'] }> = ({ data }) => {
        // Helper function to safely render key points
        const renderKeyPoints = (keyPoints: any): string => {
            if (!keyPoints) return '';

            if (typeof keyPoints === 'string') {
                return keyPoints.substring(0, 150) + (keyPoints.length > 150 ? '...' : '');
            }

            if (Array.isArray(keyPoints)) {
                return keyPoints.join(', ').substring(0, 150) + (keyPoints.join(', ').length > 150 ? '...' : '');
            }

            if (typeof keyPoints === 'object') {
                return JSON.stringify(keyPoints).substring(0, 150) + '...';
            }

            return String(keyPoints).substring(0, 150) + '...';
        };

        // Helper function to safely render descriptions
        const renderDescription = (description: any): string => {
            if (!description) return '';

            if (typeof description === 'string') {
                return description;
            }

            return String(description);
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">{selectedCandidates[0]?.name}</h4>
                    {data.candidate1.length > 0 ? (
                        <div className="space-y-3">
                            {data.candidate1.map((policy, index) => (
                                <div key={index} className="text-sm">
                                    <div className="font-medium">{policy.name || 'Unnamed Policy'}</div>
                                    {policy.description && (
                                        <div className="text-blue-800 mt-1">{renderDescription(policy.description)}</div>
                                    )}
                                    {policy.key_points && (
                                        <div className="text-xs text-blue-600 mt-1">{renderKeyPoints(policy.key_points)}</div>
                                    )}
                                    {policy.vision_statement && (
                                        <div className="text-xs text-blue-500 mt-1 italic">
                                            <strong>Vision:</strong> {renderDescription(policy.vision_statement)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-blue-600">No policy information available</div>
                    )}
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3">{selectedCandidates[1]?.name}</h4>
                    {data.candidate2.length > 0 ? (
                        <div className="space-y-3">
                            {data.candidate2.map((policy, index) => (
                                <div key={index} className="text-sm">
                                    <div className="font-medium">{policy.name || 'Unnamed Policy'}</div>
                                    {policy.description && (
                                        <div className="text-green-800 mt-1">{renderDescription(policy.description)}</div>
                                    )}
                                    {policy.key_points && (
                                        <div className="text-xs text-green-600 mt-1">{renderKeyPoints(policy.key_points)}</div>
                                    )}
                                    {policy.vision_statement && (
                                        <div className="text-xs text-green-500 mt-1 italic">
                                            <strong>Vision:</strong> {renderDescription(policy.vision_statement)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-green-600">No policy information available</div>
                    )}
                </div>
            </div>
        );
    };

    if (!isClient) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <Breadcrumb pageTitle='Compare' />
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
                <Breadcrumb pageTitle='Compare' />

                {/* Global Search */}
                <GlobalSearch
                    placeholder="Search candidates to compare..."
                    showLocationFilter={true}
                    onSearch={handleSearch}
                    variant="compact"
                />

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Compare Candidates
                        </h1>
                        <p className="text-black max-w-2xl mx-auto">
                            Select two candidates of the same position to compare their backgrounds, experience, policies, and qualifications
                        </p>
                    </div>

                    {/* Position Filter Notice */}
                    {filters.position && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="text-blue-800">
                                    Comparing candidates for: <strong>{positions.find(p => p.value === filters.position)?.label || filters.position}</strong>
                                </span>
                                <button
                                    onClick={() => handleFilterChange('position', '')}
                                    className="ml-auto text-blue-600 hover:text-blue-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Filter Candidates</h2>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={filters.position}
                                        onChange={(e) => handleFilterChange('position', e.target.value)}
                                    >
                                        <option value="">All Positions</option>
                                        {positions.map(pos => (
                                            <option key={pos.value} value={pos.value}>{pos.label}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">* Required for comparison</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={filters.county_id}
                                        onChange={(e) => handleFilterChange('county_id', e.target.value)}
                                    >
                                        <option value="">All Counties</option>
                                        {counties.map(county => (
                                            <option key={county.id} value={county.id}>
                                                {county.county || county.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Party</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={filters.party_id}
                                        onChange={(e) => handleFilterChange('party_id', e.target.value)}
                                    >
                                        <option value="">All Parties</option>
                                        {parties.map(party => (
                                            <option key={party.id} value={party.id}>
                                                {party.party_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Search candidates..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {showFilters && (
                            <div className="flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Candidate Selection */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <CandidateSelector
                                label="Select First Candidate"
                                selectedCandidate={selectedCandidates[0]}
                                onSelect={(candidateSlug) => handleCandidateSelect(0, candidateSlug)}
                                excludeSlug={selectedCandidates[1]?.slug}
                            />
                            <CandidateSelector
                                label="Select Second Candidate"
                                selectedCandidate={selectedCandidates[1]}
                                onSelect={(candidateSlug) => handleCandidateSelect(1, candidateSlug)}
                                excludeSlug={selectedCandidates[0]?.slug}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={clearSelection}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Clear Selection
                            </button>
                            <button
                                onClick={loadComparisonData}
                                disabled={loading || !selectedCandidates[0] || !selectedCandidates[1] || !filters.position}
                                className="px-6 py-2 bg-green-600 text-black rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                        Comparing...
                                    </>
                                ) : (
                                    'Compare Candidates'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                <span className="text-red-800">{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-auto text-red-600 hover:text-red-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Comparison Results */}
                    {comparisonData && selectedCandidates[0] && selectedCandidates[1] && (
                        <>
                            {/* Candidate Overview */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                                    <CandidateCard candidate={selectedCandidates[0]} position="left" />
                                    <CandidateCard candidate={selectedCandidates[1]} position="right" />
                                </div>
                            </div>

                            {/* Enhanced Suitability Scores Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                                <div className="flex items-center justify-center mb-6">
                                    <Star className="w-6 h-6 text-yellow-500 mr-2" />
                                    <h2 className="text-2xl font-bold text-gray-900">Candidate Suitability Assessment</h2>
                                </div>
                                <div className="text-center mb-6">
                                    <p className="text-black">
                                        Comprehensive evaluation based on education, experience, policies, and governance capabilities
                                    </p>
                                </div>
                                <SuitabilityScoresComparison
                                    candidate1Scoring={comparisonData.suitability_scores.candidate1}
                                    candidate2Scoring={comparisonData.suitability_scores.candidate2}
                                />
                            </div>

                            {/* Detailed Comparison Sections */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Comparison</h2>

                                {/* Enhanced scoring breakdown section */}
                                <ComparisonSection title="Scoring Methodology & Breakdown" sectionKey="scoring_breakdown">
                                    <div className="space-y-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-gray-800 mb-3">Assessment Categories</h4>
                                            <p className="text-sm text-black mb-3">
                                                Each candidate is evaluated across multiple weighted categories to provide a comprehensive suitability score.
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {comparisonData.suitability_scores.candidate1.categories.map((category) => {
                                                    const candidate2Category = comparisonData.suitability_scores.candidate2.categories.find(
                                                        c => c.id === category.id
                                                    );
                                                    const winner = category.score > (candidate2Category?.score || 0) ? 1 : 2;

                                                    return (
                                                        <div key={category.id} className="bg-white p-3 rounded border">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="font-medium text-gray-800">{category.name}</span>
                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                    {category.weight_percentage}% weight
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <div className={winner === 1 ? 'font-bold text-green-600' : 'text-black'}>
                                                                    {selectedCandidates[0]?.name}: {category.score.toFixed(1)}
                                                                </div>
                                                                <div className={winner === 2 ? 'font-bold text-green-600' : 'text-black'}>
                                                                    {selectedCandidates[1]?.name}: {candidate2Category?.score.toFixed(1) || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </ComparisonSection>

                                <ComparisonSection title="Basic Information" sectionKey="basic_info">
                                    <BasicInfoComparison data={comparisonData.basic_info} />
                                </ComparisonSection>

                                <ComparisonSection title="Education Background" sectionKey="education">
                                    <EducationComparison data={comparisonData.education} />
                                </ComparisonSection>

                                <ComparisonSection title="Work Experience" sectionKey="experience">
                                    <ExperienceComparison data={comparisonData.experience} />
                                </ComparisonSection>

                                <ComparisonSection title="Political Experience" sectionKey="political_experience">
                                    <PoliticalExperienceComparison data={comparisonData.political_experience} />
                                </ComparisonSection>

                                <ComparisonSection title="Policies & Positions" sectionKey="policies">
                                    <PoliciesComparison data={comparisonData.policies} />
                                </ComparisonSection>

                                {(comparisonData.endorsements.candidate1.length > 0 || comparisonData.endorsements.candidate2.length > 0) && (
                                    <ComparisonSection title="Endorsements" sectionKey="endorsements">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-blue-900 mb-3">{selectedCandidates[0]?.name}</h4>
                                                {comparisonData.endorsements.candidate1.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {comparisonData.endorsements.candidate1.map((endorsement, index) => (
                                                            <div key={index} className="text-sm">
                                                                <div className="font-medium">{endorsement.name}</div>
                                                                <div className="text-blue-600">{endorsement.type}</div>
                                                                {endorsement.statement && (
                                                                    <div className="text-xs text-blue-500 italic mt-1">
                                                                        "{endorsement.statement.substring(0, 100)}..."
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-blue-600">No endorsements available</div>
                                                )}
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-green-900 mb-3">{selectedCandidates[1]?.name}</h4>
                                                {comparisonData.endorsements.candidate2.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {comparisonData.endorsements.candidate2.map((endorsement, index) => (
                                                            <div key={index} className="text-sm">
                                                                <div className="font-medium">{endorsement.name}</div>
                                                                <div className="text-green-600">{endorsement.type}</div>
                                                                {endorsement.statement && (
                                                                    <div className="text-xs text-green-500 italic mt-1">
                                                                        "{endorsement.statement.substring(0, 100)}..."
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-green-600">No endorsements available</div>
                                                )}
                                            </div>
                                        </div>
                                    </ComparisonSection>
                                )}

                                {(comparisonData.finance.candidate1.length > 0 || comparisonData.finance.candidate2.length > 0) && (
                                    <ComparisonSection title="Financial Information" sectionKey="finance">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-blue-900 mb-3">{selectedCandidates[0]?.name}</h4>
                                                {comparisonData.finance.candidate1.length > 0 ? (
                                                    <div className="space-y-2 text-sm">
                                                        {comparisonData.finance.candidate1.map((finance, index) => (
                                                            <div key={index}>
                                                                {finance.sources_of_funds && (
                                                                    <div><strong>Funding Sources:</strong> {finance.sources_of_funds}</div>
                                                                )}
                                                                {finance.funds_raised && (
                                                                    <div><strong>Funds Raised:</strong> KSh {typeof finance.funds_raised === 'number' ? finance.funds_raised.toLocaleString() : finance.funds_raised}</div>
                                                                )}
                                                                <div><strong>Financial Transparency:</strong>
                                                                    {finance.has_financial_info ? ' ✓ Available' : ' ✗ Not Available'}
                                                                </div>
                                                                <div><strong>Asset Declaration:</strong>
                                                                    {finance.has_assets_declared ? ' ✓ Available' : ' ✗ Not Available'}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-blue-600">No financial information available</div>
                                                )}
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-green-900 mb-3">{selectedCandidates[1]?.name}</h4>
                                                {comparisonData.finance.candidate2.length > 0 ? (
                                                    <div className="space-y-2 text-sm">
                                                        {comparisonData.finance.candidate2.map((finance, index) => (
                                                            <div key={index}>
                                                                {finance.sources_of_funds && (
                                                                    <div><strong>Funding Sources:</strong> {finance.sources_of_funds}</div>
                                                                )}
                                                                {finance.funds_raised && (
                                                                    <div><strong>Funds Raised:</strong> KSh {typeof finance.funds_raised === 'number' ? finance.funds_raised.toLocaleString() : finance.funds_raised}</div>
                                                                )}
                                                                <div><strong>Financial Transparency:</strong>
                                                                    {finance.has_financial_info ? ' ✓ Available' : ' ✗ Not Available'}
                                                                </div>
                                                                <div><strong>Asset Declaration:</strong>
                                                                    {finance.has_assets_declared ? ' ✓ Available' : ' ✗ Not Available'}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-green-600">No financial information available</div>
                                                )}
                                            </div>
                                        </div>
                                    </ComparisonSection>
                                )}
                            </div>

                            {/* Assessment Criteria */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    What Is the Candidate Suitability Tool?
                                </h2>
                                <p className="text-lg font-medium text-gray-700 mb-6">
                                    A guide to informed voting
                                </p>
                                <p className="text-black mb-8">
                                    The Candidate Suitability Tool evaluates political candidates using verified,
                                    non-partisan criteria. It's designed to support voters like you in making confident,
                                    fact-based decisions.
                                </p>

                                <h3 className="text-xl font-bold text-gray-900 mb-4">Assessment Criteria</h3>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">What we look at</h4>
                                <div className="text-black">
                                    <p className="mb-4">Each candidate is assessed across the following areas:</p>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Education & Professional Background:</strong>
                                                <span className="block text-sm">
                                                    Academic qualifications and professional experience relevant to public service.
                                                </span>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Political & Leadership Experience:</strong>
                                                <span className="block text-sm">
                                                    Previous political roles, leadership positions, and governance experience.
                                                </span>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Public Service Record:</strong>
                                                <span className="block text-sm">
                                                    Contributions to community development and public welfare initiatives.
                                                </span>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Policy Positions & Vision:</strong>
                                                <span className="block text-sm">
                                                    Clear policy positions and comprehensive vision for their constituency.
                                                </span>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Financial Transparency:</strong>
                                                <span className="block text-sm">
                                                    Openness about funding sources and financial declarations.
                                                </span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-semibold text-blue-900 mb-2">Scoring Methodology</h4>
                                    <div className="text-sm text-blue-800">
                                        <p className="mb-2">
                                            Scores are calculated using weighted indicators across categories, with final grades assigned as:
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">90-100%: A+ (Excellent)</span>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">80-89%: A (Very Good)</span>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">70-79%: B (Good)</span>
                                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">60-69%: C (Fair)</span>
                                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">50-59%: D (Poor)</span>
                                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Below 50%: F (Failing)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {!comparisonData && !loading && (
                        <div className="text-center py-16">
                            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                Select Two Candidates to Compare
                            </h3>
                            <p className="text-black max-w-md mx-auto">
                                Choose candidates from the dropdowns above to see their detailed comparison
                                including education, experience, policies, and suitability scores.
                            </p>
                            {!filters.position && (
                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg max-w-md mx-auto">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Tip:</strong> Select a position first to filter candidates for comparison
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default ComparePage;