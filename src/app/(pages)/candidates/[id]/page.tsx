"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Share2, Bookmark, DollarSign, Award, Scale, Calendar, MapPin, ExternalLink, Play, User, Loader2, AlertCircle, ArrowLeft, TrendingUp, BarChart3 } from 'lucide-react';
import GlobalSearch from '@/components/common/global-search';
import { Breadcrumb } from '@/components/common/breadcrumb';
import MainLayout from '@/components/layouts/main-layout';
import candidatesService from '@/services/candidates.service';

// Backend data structure interfaces
interface CandidateDetails {
    id: string;
    name: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    gender: string;
    date_of_birth?: string;
    email?: string;
    phone_number?: string;
    image: string;
    bio?: string;
    tagline?: string;
    manifesto?: string;
    manifesto_file?: string;
    social_links?: Record<string, string>;
    languages?: string[];
    hobbies?: string[];
    website?: string;
    address?: string;
    position: string;
    party: {
        name: string;
        code: string;
        logo?: string;
        colors?: string;
        website?: string;
    };
    county: {
        name: string;
        code: string;
        constituency?: string;
        ward?: string;
    };
    education: Array<{
        institution: string;
        qualification: string;
        field_of_study?: string;
        start_date?: string;
        end_date?: string;
        is_current: boolean;
        description?: string;
        education_level?: string;
    }>;
    experience: Array<{
        company_name: string;
        job_title: string;
        location?: string;
        employment_type?: string;
        start_date?: string;
        end_date?: string;
        is_current: boolean;
        description?: string;
    }>;
    public_experience: Array<{
        organization_name: string;
        position: string;
        start_date?: string;
        end_date?: string;
        is_current: boolean;
        description?: string;
    }>;
    political_experience: Array<{
        party_name?: string;
        position: string;
        description?: string;
        start_date?: string;
        end_date?: string;
        is_current: boolean;
        election_year?: string;
        election_results?: string;
        achievements?: string;
        shortcomings?: string;
    }>;
    policies: Array<{
        policy_name: string;
        policy_description?: string;
        key_points?: string;
        vision_statement?: string;
        mission_statement?: string;
        strategies?: string;
        position_papers?: string;
        policy_summary?: string;
        policy_document_url?: string;
    }>;
    endorsements: Array<{
        endorsement_name: string;
        endorsement_statement?: string;
        endorsement_type?: string;
    }>;
    campaign_media: Array<{
        event_title: string;
        event_date?: string;
        location?: string;
        media_links?: Array<{
            title: string;
            url: string;
            type: string;
        }>;
    }>;
    finance: Array<{
        financial_information_url?: string;
        assets_declared_url?: string;
        sources_of_funds?: string;
        funds_raised?: string;
    }>;
    slug: string;
}

// Scoring data interfaces
interface ScoringData {
    total_score: number;
    max_possible_score: number;
    percentage: number;
    grade: {
        letter: string;
        description: string;
        color: string;
    };
    categories: Array<{
        id: number;
        name: string;
        weight_percentage: number;
        score: number;
        percentage: number;
        subcategories?: Array<{
            id: number;
            name: string;
            weight_percentage: number;
            score: number;
            percentage: number;
            indicators: Array<{
                id: number;
                name: string;
                weight_percentage: number;
                score: number;
                notes?: string;
            }>;
        }>;
    }>;
    meta: {
        scored_indicators: number;
        total_indicators: number;
        completion_percentage: number;
        last_updated?: string;
    };
}

type ExpandedSectionType = 'biography' | 'education' | 'experience' | 'public_experience' | 'political_experience' | 'scoring' | string;

const SingleCandidatePage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.id as string;

    const [candidate, setCandidate] = useState<CandidateDetails | null>(null);
    const [scoring, setScoring] = useState<ScoringData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<ExpandedSectionType | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);

    // Safe localStorage operations
    const getBookmarks = useCallback(() => {
        try {
            if (typeof window === 'undefined') return [];
            const bookmarks = localStorage.getItem('bookmarkedCandidates');
            return bookmarks ? JSON.parse(bookmarks) : [];
        } catch (error) {
            console.error('Error reading bookmarks:', error);
            return [];
        }
    }, []);

    const setBookmarks = useCallback((bookmarks: string[]) => {
        try {
            if (typeof window === 'undefined') return false;
            localStorage.setItem('bookmarkedCandidates', JSON.stringify(bookmarks));
            return true;
        } catch (error) {
            console.error('Error saving bookmarks:', error);
            return false;
        }
    }, []);

    // Fetch candidate data
    useEffect(() => {
        const fetchCandidate = async () => {
            // Check if slug exists and is valid
            if (!slug || typeof slug !== 'string' || slug.trim() === '') {
                setError('Invalid candidate slug');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log('Fetching candidate with slug:', slug); // Debug log

                const response = await candidatesService.getCandidateSummary(parseInt(slug));

                console.log('API Response:', response); // Debug log

                if (response?.success && response?.data?.candidate) {
                    setCandidate(response.data.candidate);
                    setScoring(response.data.scoring || null);

                    // Check if bookmarked
                    const bookmarks = getBookmarks();
                    setIsBookmarked(bookmarks.includes(response.data.candidate.id));
                } else {
                    const errorMessage = response?.message || 'Candidate not found';
                    console.error('API Error:', errorMessage);
                    setError(errorMessage);
                }
            } catch (err) {
                console.error('Error fetching candidate:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to load candidate details. Please try again.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidate();
    }, [slug, getBookmarks]);

    const toggleSection = useCallback((section: ExpandedSectionType) => {
        setExpandedSection(prev => prev === section ? null : section);
    }, []);

    const handleSearch = useCallback((query: string, filters?: any) => {
        router.push(`/candidates?search=${encodeURIComponent(query)}`);
    }, [router]);

    const handleShare = async () => {
        if (!candidate) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: candidate.name,
                    text: `Learn about ${candidate.name} - ${candidate.position}`,
                    url: window.location.href
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                // You can add a toast notification here
                console.log('Link copied to clipboard');
            }
        } catch (err) {
            console.log('Share cancelled or failed:', err);
        }
    };

    const handleBookmark = async () => {
        if (!candidate || bookmarkLoading) return;

        try {
            setBookmarkLoading(true);
            const bookmarks = getBookmarks();
            const newBookmarkState = !isBookmarked;

            if (newBookmarkState) {
                bookmarks.push(candidate.id);
            } else {
                const index = bookmarks.indexOf(candidate.id);
                if (index > -1) bookmarks.splice(index, 1);
            }

            const success = setBookmarks(bookmarks);
            if (success) {
                setIsBookmarked(newBookmarkState);
            } else {
                console.error('Failed to save bookmark');
                // Show error message to user
            }
        } catch (error) {
            console.error('Error handling bookmark:', error);
        } finally {
            setBookmarkLoading(false);
        }
    };

    const handleCompare = () => {
        if (candidate?.id && candidate?.slug) {
            // Pass both the candidate ID and position for proper filtering
            const queryParams = new URLSearchParams({
                candidate1: candidate.slug,
                position: candidate.position.toLowerCase()
            });

            router.push(`/compare?${queryParams.toString()}`);
        }
    };

    const calculateAge = (dateOfBirth?: string): number | null => {
        if (!dateOfBirth) return null;

        const birthDate = new Date(dateOfBirth);
        if (isNaN(birthDate.getTime())) return null; // Invalid date

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const getFinanceUrl = (type: 'assets_declared_url' | 'financial_information_url'): string | null => {
        return candidate?.finance?.[0]?.[type] || null;
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const getGradeColor = (grade: string): string => {
        switch (grade.toLowerCase()) {
            case 'a+':
            case 'a': return 'text-green-600 bg-green-100';
            case 'b': return 'text-blue-600 bg-blue-100';
            case 'c': return 'text-yellow-600 bg-yellow-100';
            case 'd': return 'text-orange-600 bg-orange-100';
            case 'f': return 'text-red-600 bg-red-100';
            default: return 'text-black bg-gray-100';
        }
    };

    const getScoreBarColor = (percentage: number): string => {
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 80) return 'bg-blue-500';
        if (percentage >= 70) return 'bg-yellow-500';
        if (percentage >= 60) return 'bg-orange-500';
        return 'bg-red-500';
    };

    // Components
    const ExpandableSection: React.FC<{
        id: ExpandedSectionType;
        title: string;
        content: string | React.ReactNode;
        isExpanded: boolean;
        onToggle: (section: ExpandedSectionType) => void;
    }> = ({ id, title, content, isExpanded, onToggle }) => (
        <div className="mb-3">
            <button
                onClick={() => onToggle(id)}
                className="w-full bg-blue-600 text-black p-4 rounded-lg flex justify-between items-center hover:bg-blue-700 transition-colors"
                aria-expanded={isExpanded}
                aria-controls={`section-${id}`}
            >
                <span className="text-lg font-semibold uppercase tracking-wide">{title}</span>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {isExpanded && (
                <div id={`section-${id}`} className="bg-white border border-gray-200 rounded-b-lg p-6 mt-1">
                    <div className="text-gray-700 leading-relaxed">{content}</div>
                </div>
            )}
        </div>
    );

    const PolicyCard: React.FC<{ policy: any; isExpanded: boolean }> = ({ policy, isExpanded }) => (
        <div className={`border rounded-lg transition-all duration-300 ${isExpanded ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
            <button
                onClick={() => toggleSection(policy.policy_name)}
                className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 rounded-t-lg"
                aria-expanded={isExpanded}
            >
                <span className="font-semibold text-gray-800">{policy.policy_name}</span>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {isExpanded && (
                <div className="px-4 pb-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                        {policy.policy_description && (
                            <div className="mb-3">
                                <span className="text-sm font-medium text-black">Policy Description:</span>
                                <p className="text-gray-800 mt-1">{policy.policy_description}</p>
                            </div>
                        )}
                        {policy.key_points && (
                            <div className="mb-3">
                                <span className="text-sm font-medium text-black">Key Points:</span>
                                <p className="text-gray-800 mt-1">{policy.key_points}</p>
                            </div>
                        )}
                        {policy.vision_statement && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                <div className="text-sm font-medium text-blue-800 mb-1">Vision Statement</div>
                                <p className="text-gray-700">{policy.vision_statement}</p>
                            </div>
                        )}
                        {policy.policy_document_url && (
                            <div className="mt-3">
                                <a
                                    href={policy.policy_document_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-sm hover:underline flex items-center"
                                >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    View Full Policy Document
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const ScoreProgressBar: React.FC<{ score: number; maxScore: number; percentage: number; className?: string }> = ({
        score, maxScore, percentage, className = ""
    }) => (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${getScoreBarColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            <div className="text-sm font-medium text-black min-w-[4rem]">
                {score.toFixed(1)}/{maxScore}
            </div>
        </div>
    );

    // Loading state
    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-black">Loading candidate details...</p>
                        <p className="text-sm text-gray-500 mt-2">Slug: {slug}</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // Error state
    if (error || !candidate) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                        <p className="text-black mb-4">{error}</p>
                        <p className="text-sm text-gray-500 mb-4">Attempted slug: {slug}</p>
                        <div className="space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="px-4 py-2 bg-gray-600 text-black rounded-lg hover:bg-gray-700"
                            >
                                <ArrowLeft className="w-4 h-4 inline mr-2" />
                                Go Back
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const age = calculateAge(candidate.date_of_birth);

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <Breadcrumb
                    pageTitle={candidate.name}
                    breadcrumbs={[
                        { label: 'Home', href: '/' },
                        { label: 'Candidates', href: '/candidates' },
                        { label: candidate.name, href: `/candidates/${candidate.slug}` }
                    ]}
                />

                {/* Global Search */}
                <GlobalSearch
                    placeholder="Search by name, office, or district..."
                    showLocationFilter={true}
                    onSearch={handleSearch}
                    variant="compact"
                />

                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Candidate Profile Card */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex flex-col items-center text-center">
                            {/* Profile Image */}
                            <div className="w-48 h-64 bg-gray-300 rounded-lg mb-4 overflow-hidden">
                                {candidate.image && candidate.image !== '/api/placeholder/150/150' ? (
                                    <img
                                        src={candidate.image}
                                        alt={`${candidate.name} profile photo`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.parentElement!.innerHTML = `
                                                <div class="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center">
                                                    <div class="w-20 h-20 text-black">
                                                        <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            `;
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center">
                                        <User className="w-20 h-20 text-black" />
                                    </div>
                                )}
                            </div>

                            {/* Candidate Info */}
                            <div className="mb-4">
                                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                    {candidate.name}
                                    {age && (
                                        <span className="text-lg font-normal text-black ml-3">
                                            {candidate.gender}, {age}
                                        </span>
                                    )}
                                </h1>
                                <p className="text-lg text-black mb-3">{candidate.position}</p>

                                {/* Party Info */}
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    {candidate.party?.logo ? (
                                        <img
                                            src={candidate.party.logo}
                                            alt={`${candidate.party.name} logo`}
                                            className="w-8 h-8 rounded-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-black text-xs font-bold">
                                                {candidate.party?.code?.charAt(0) || '?'}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-gray-700">{candidate.party?.name || 'Unknown Party'}</span>
                                </div>

                                {/* Location */}
                                {candidate.county?.name && (
                                    <p className="text-sm text-gray-500 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        {candidate.county.name}
                                        {candidate.county.constituency && `, ${candidate.county.constituency}`}
                                    </p>
                                )}

                                {/* Tagline */}
                                {candidate.tagline && (
                                    <p className="text-blue-600 italic">{candidate.tagline}</p>
                                )}
                            </div>

                            {/* Scoring Summary (if available) */}
                            {scoring && (
                                <div className="w-full max-w-md mb-4 bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <BarChart3 className="w-5 h-5 text-blue-600" />
                                            <span className="font-semibold text-gray-800">Performance Score</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(scoring.grade.letter)}`}>
                                            {scoring.grade.letter}
                                        </span>
                                    </div>
                                    <ScoreProgressBar
                                        score={scoring.total_score}
                                        maxScore={scoring.max_possible_score}
                                        percentage={scoring.percentage}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Based on {scoring.meta.scored_indicators} of {scoring.meta.total_indicators} criteria
                                        ({scoring.meta.completion_percentage.toFixed(0)}% complete)
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleCompare}
                                    className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-200 transition-colors"
                                >
                                    Compare
                                </button>
                                <button
                                    onClick={handleBookmark}
                                    disabled={bookmarkLoading}
                                    className={`p-2 rounded-full transition-colors ${isBookmarked
                                        ? 'bg-yellow-100 text-yellow-600'
                                        : 'bg-gray-100 text-black hover:bg-gray-200'
                                        } ${bookmarkLoading ? 'opacity-50' : ''}`}
                                    aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                                >
                                    {bookmarkLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Bookmark className="w-5 h-5" />
                                    )}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-2 bg-gray-100 text-black rounded-full hover:bg-gray-200 transition-colors"
                                    aria-label="Share candidate profile"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Scoring Section */}
                    {scoring && (
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance Analysis</h2>
                            <ExpandableSection
                                id="scoring"
                                title="Detailed Score Breakdown"
                                content={
                                    <div className="space-y-6">
                                        {/* Overall Score */}
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-lg font-semibold text-gray-800">Overall Performance</h3>
                                                <div className="text-right">
                                                    <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${getGradeColor(scoring.grade.letter)}`}>
                                                        {scoring.grade.letter}
                                                    </div>
                                                    <p className="text-sm text-black mt-1">{scoring.grade.description}</p>
                                                </div>
                                            </div>
                                            <ScoreProgressBar
                                                score={scoring.total_score}
                                                maxScore={scoring.max_possible_score}
                                                percentage={scoring.percentage}
                                                className="mb-2"
                                            />
                                            <p className="text-sm text-black">
                                                {scoring.percentage.toFixed(1)}% - {scoring.grade.description}
                                            </p>
                                        </div>

                                        {/* Category Breakdown */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-gray-800 mb-3">Category Breakdown</h4>
                                            {scoring.categories.map((category, index) => (
                                                <div key={index} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-800">{category.name}</span>
                                                        <span className="text-sm text-black">
                                                            Weight: {category.weight_percentage}%
                                                        </span>
                                                    </div>
                                                    <ScoreProgressBar
                                                        score={category.score}
                                                        maxScore={10}
                                                        percentage={category.percentage}
                                                        className="mb-2"
                                                    />
                                                    <p className="text-xs text-gray-500">
                                                        {category.percentage.toFixed(1)}% performance in this category
                                                    </p>

                                                    {/* Subcategories */}
                                                    {category.subcategories && category.subcategories.length > 0 && (
                                                        <div className="mt-3 pl-4 space-y-2">
                                                            {category.subcategories.map((subcategory, subIndex) => (
                                                                <div key={subIndex} className="bg-gray-50 p-3 rounded">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-sm font-medium text-gray-700">
                                                                            {subcategory.name}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {subcategory.score.toFixed(1)}/10
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex-1 bg-gray-200 rounded-full h-1 mb-2">
                                                                        <div
                                                                            className={`h-1 rounded-full ${getScoreBarColor(subcategory.percentage)}`}
                                                                            style={{ width: `${Math.min(subcategory.percentage, 100)}%` }}
                                                                        />
                                                                    </div>

                                                                    {/* Individual Indicators */}
                                                                    {subcategory.indicators && subcategory.indicators.length > 0 && (
                                                                        <div className="mt-2 space-y-1">
                                                                            {subcategory.indicators.map((indicator, indicatorIndex) => (
                                                                                <div key={indicatorIndex} className="flex items-center justify-between text-xs">
                                                                                    <span className="text-black">{indicator.name}</span>
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <span className="font-medium">{indicator.score}/10</span>
                                                                                        {indicator.notes && (
                                                                                            <span className="text-gray-500 italic truncate max-w-[100px]">
                                                                                                {indicator.notes}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Scoring Metadata */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-gray-800 mb-2">Scoring Information</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-black">Indicators Scored:</span>
                                                    <span className="font-medium ml-2">
                                                        {scoring.meta.scored_indicators} of {scoring.meta.total_indicators}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-black">Completion:</span>
                                                    <span className="font-medium ml-2">
                                                        {scoring.meta.completion_percentage.toFixed(0)}%
                                                    </span>
                                                </div>
                                                {scoring.meta.last_updated && (
                                                    <div className="col-span-2">
                                                        <span className="text-black">Last Updated:</span>
                                                        <span className="font-medium ml-2">
                                                            {new Date(scoring.meta.last_updated).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                }
                                isExpanded={expandedSection === 'scoring'}
                                onToggle={toggleSection}
                            />
                        </section>
                    )}

                    {/* Career & History Section */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Career & History</h2>
                        <div className="space-y-3">
                            {/* Biography */}
                            {candidate.bio && (
                                <ExpandableSection
                                    id="biography"
                                    title="Biography"
                                    content={candidate.bio}
                                    isExpanded={expandedSection === 'biography'}
                                    onToggle={toggleSection}
                                />
                            )}

                            {/* Education */}
                            {candidate.education && candidate.education.length > 0 && (
                                <ExpandableSection
                                    id="education"
                                    title="Education Background"
                                    content={
                                        <div className="space-y-4">
                                            {candidate.education.map((edu, index) => (
                                                <div key={index} className="border-l-4 border-blue-400 pl-4">
                                                    <h4 className="font-semibold">{edu.qualification}</h4>
                                                    <p className="text-black">{edu.institution}</p>
                                                    {edu.field_of_study && (
                                                        <p className="text-sm text-gray-500">{edu.field_of_study}</p>
                                                    )}
                                                    {(edu.start_date || edu.end_date) && (
                                                        <p className="text-xs text-gray-400">
                                                            {formatDate(edu.start_date)} - {edu.is_current ? 'Present' : formatDate(edu.end_date)}
                                                        </p>
                                                    )}
                                                    {edu.description && (
                                                        <p className="text-sm mt-2">{edu.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    }
                                    isExpanded={expandedSection === 'education'}
                                    onToggle={toggleSection}
                                />
                            )}

                            {/* Professional Experience */}
                            {candidate.experience && candidate.experience.length > 0 && (
                                <ExpandableSection
                                    id="experience"
                                    title="Professional Experience"
                                    content={
                                        <div className="space-y-4">
                                            {candidate.experience.map((exp, index) => (
                                                <div key={index} className="border-l-4 border-green-400 pl-4">
                                                    <h4 className="font-semibold">{exp.job_title}</h4>
                                                    <p className="text-black">{exp.company_name}</p>
                                                    {exp.location && (
                                                        <p className="text-sm text-gray-500">{exp.location}</p>
                                                    )}
                                                    {(exp.start_date || exp.end_date) && (
                                                        <p className="text-xs text-gray-400">
                                                            {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                                                        </p>
                                                    )}
                                                    {exp.description && (
                                                        <p className="text-sm mt-2">{exp.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    }
                                    isExpanded={expandedSection === 'experience'}
                                    onToggle={toggleSection}
                                />
                            )}

                            {/* Political Experience */}
                            {candidate.political_experience && candidate.political_experience.length > 0 && (
                                <ExpandableSection
                                    id="political_experience"
                                    title="Political History"
                                    content={
                                        <div className="space-y-4">
                                            {candidate.political_experience.map((polExp, index) => (
                                                <div key={index} className="border-l-4 border-purple-400 pl-4">
                                                    <h4 className="font-semibold">{polExp.position}</h4>
                                                    {polExp.party_name && (
                                                        <p className="text-black">{polExp.party_name}</p>
                                                    )}
                                                    {(polExp.start_date || polExp.end_date) && (
                                                        <p className="text-xs text-gray-400">
                                                            {formatDate(polExp.start_date)} - {polExp.is_current ? 'Present' : formatDate(polExp.end_date)}
                                                        </p>
                                                    )}
                                                    {polExp.description && (
                                                        <p className="text-sm mt-2">{polExp.description}</p>
                                                    )}
                                                    {polExp.achievements && (
                                                        <div className="mt-2">
                                                            <span className="text-sm font-medium text-green-600">Achievements:</span>
                                                            <p className="text-sm">{polExp.achievements}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    }
                                    isExpanded={expandedSection === 'political_experience'}
                                    onToggle={toggleSection}
                                />
                            )}
                        </div>
                    </section>

                    {/* Policies Section */}
                    {candidate.policies && candidate.policies.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Policy Positions</h2>
                            <div className="space-y-4">
                                {candidate.policies.map((policy, index) => (
                                    <PolicyCard
                                        key={index}
                                        policy={policy}
                                        isExpanded={expandedSection === policy.policy_name}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Transparency & Declarations */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Transparency & Declarations</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-800 mb-1">Asset Declaration</h3>
                                {getFinanceUrl('assets_declared_url') ? (
                                    <a
                                        href={getFinanceUrl('assets_declared_url')!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View Declaration
                                    </a>
                                ) : (
                                    <p className="text-sm text-black">Not Available</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Campaign & Media */}
                    {candidate.campaign_media && candidate.campaign_media.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Campaign & Media</h2>

                            {candidate.campaign_media.map((event, index) => (
                                <div key={index} className="mb-6">
                                    {/* Campaign Event */}
                                    <div className="bg-red-500 rounded-lg overflow-hidden mb-4 relative">
                                        <div className="h-48 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center relative">
                                            <div className="text-black text-6xl font-bold opacity-30 absolute">
                                                {candidate.party?.code || '?'}
                                            </div>
                                            <div className="text-black text-center relative z-10">
                                                <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                                                    <User className="w-10 h-10" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-red-500 text-black p-4">
                                            <div className="text-sm opacity-90 flex items-center mb-1">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Event: <span className="font-medium ml-1">{event.event_title}</span>
                                            </div>
                                            {event.event_date && (
                                                <div className="text-sm opacity-90 flex items-center mb-1">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Date: <span className="font-medium ml-1">{formatDate(event.event_date)}</span>
                                                </div>
                                            )}
                                            {event.location && (
                                                <div className="text-sm opacity-90 flex items-center">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    Location: <span className="font-medium ml-1">{event.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Media Links */}
                                    {event.media_links && event.media_links.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-gray-800 mb-3">Media Coverage</h3>
                                            <div className="space-y-2">
                                                {event.media_links.map((media, mediaIndex) => (
                                                    <a
                                                        key={mediaIndex}
                                                        href={media.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block text-red-600 hover:text-red-800 hover:underline flex items-center group"
                                                    >
                                                        <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                                        {media.title}
                                                        <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Endorsements */}
                    {candidate.endorsements && candidate.endorsements.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Endorsements</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {candidate.endorsements.map((endorsement, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="font-semibold text-gray-800 mb-2">{endorsement.endorsement_name}</h3>
                                        {endorsement.endorsement_type && (
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-2">
                                                {endorsement.endorsement_type}
                                            </span>
                                        )}
                                        {endorsement.endorsement_statement && (
                                            <p className="text-black text-sm italic">&quot;{endorsement.endorsement_statement}&quot;</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Social Links & Contact */}
                    {(candidate.social_links || candidate.website || candidate.email) && (
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact & Social Media</h2>
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {candidate.website && (
                                        <div>
                                            <span className="text-sm font-medium text-black">Website:</span>
                                            <a
                                                href={candidate.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-blue-600 hover:underline break-all"
                                            >
                                                {candidate.website}
                                            </a>
                                        </div>
                                    )}
                                    {candidate.email && (
                                        <div>
                                            <span className="text-sm font-medium text-black">Email:</span>
                                            <a
                                                href={`mailto:${candidate.email}`}
                                                className="block text-blue-600 hover:underline break-all"
                                            >
                                                {candidate.email}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {candidate.social_links && Object.keys(candidate.social_links).length > 0 && (
                                    <div className="mt-4">
                                        <span className="text-sm font-medium text-black mb-2 block">Social Media:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(candidate.social_links).map(([platform, url]) => (
                                                <a
                                                    key={platform}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                                                >
                                                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Compare Candidates CTA */}
                    <section className="text-center py-8">
                        <p className="text-black mb-6">
                            Find out how this candidate compares to other candidates on policies and more
                        </p>
                        <button
                            onClick={handleCompare}
                            className="bg-blue-600 text-black px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Compare Candidates
                        </button>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
};

export default SingleCandidatePage;