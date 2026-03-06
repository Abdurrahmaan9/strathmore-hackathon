"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle, ArrowLeft, TrendingUp, BarChart3, MapPin, User, Bookmark, Share2 } from 'lucide-react';
import { Breadcrumb } from '@/components/common/breadcrumb';
import MainLayout from '@/components/layouts/main-layout';
import candidatesService, { CandidateSummary } from '@/services/candidates.service';

const SingleCandidatePage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.id as string;

    const [candidate, setCandidate] = useState<CandidateSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);

    // Safe localStorage operations
    const getBookmarks = useCallback(() => {
        try {
            if (typeof window === 'undefined') return [];
            const stored = localStorage.getItem('bookmarkedCandidates');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }, []);

    const saveBookmarks = useCallback((bookmarks: number[]) => {
        try {
            if (typeof window === 'undefined') return;
            localStorage.setItem('bookmarkedCandidates', JSON.stringify(bookmarks));
        } catch {
            // Silent fail
        }
    }, []);

    // Fetch candidate data
    const fetchCandidate = useCallback(async () => {
        if (!slug) return;

        // Check if slug exists and is valid
        if (!slug || typeof slug !== 'string' || slug.trim() === '') {
            setError('Invalid candidate ID');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('Fetching candidate with ID:', slug);

            const response = await candidatesService.getCandidateSummary(parseInt(slug));

            console.log('API Response:', response);

            if (response?.success && response?.data) {
                setCandidate(response.data);

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
    }, [slug, getBookmarks]);

    useEffect(() => {
        fetchCandidate();
    }, [fetchCandidate]);

    // Handle bookmark toggle
    const handleBookmark = async () => {
        if (!candidate || bookmarkLoading) return;

        try {
            setBookmarkLoading(true);
            const bookmarks = getBookmarks();
            const candidateId = candidate.candidate.id;

            if (isBookmarked) {
                // Remove bookmark
                const index = bookmarks.indexOf(candidateId);
                if (index > -1) bookmarks.splice(index, 1);
            } else {
                // Add bookmark
                bookmarks.push(candidateId);
            }

            saveBookmarks(bookmarks);
            setIsBookmarked(!isBookmarked);
        } catch (error) {
            console.error('Error handling bookmark:', error);
        } finally {
            setBookmarkLoading(false);
        }
    };

    // Handle share
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: candidate?.candidate.name,
                    text: `Learn about ${candidate?.candidate.name} - ${candidate?.candidate.position}`,
                    url: window.location.href
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    // Handle compare
    const handleCompare = () => {
        if (candidate?.candidate?.id) {
            const queryParams = new URLSearchParams({
                candidate1: candidate.candidate.id.toString(),
                position: candidate.candidate.position.toLowerCase()
            });
            router.push(`/compare?${queryParams.toString()}`);
        }
    };

    // Loading state
    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-black">Loading candidate details...</p>
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
                        <div className="space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                <ArrowLeft className="w-4 h-4 inline mr-2" />
                                Go Back
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <Breadcrumb
                    pageTitle={candidate.candidate.name}
                    breadcrumbs={[
                        { label: 'Home', href: '/' },
                        { label: 'Candidates', href: '/candidates' },
                        { label: candidate.candidate.name, href: `/candidates/${slug}` }
                    ]}
                />

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col items-center text-center">
                            {/* Profile Image */}
                            <div className="w-48 h-64 bg-gray-300 rounded-lg mb-4 overflow-hidden">
                                <User className="w-full h-full p-12 text-gray-400" />
                            </div>

                            {/* Candidate Info */}
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    {candidate.candidate.name}
                                </h1>
                                <p className="text-lg text-black mb-3">{candidate.candidate.position}</p>

                                {/* Party Info */}
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">
                                            {candidate.candidate.party.substring(0, 3).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-gray-700">{candidate.candidate.party}</span>
                                </div>

                                {/* Location */}
                                <p className="text-sm text-gray-500 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    {candidate.candidate.constituency}
                                </p>
                            </div>

                            {/* Integrity Score */}
                            {candidate.integrity && (
                                <div className="w-full max-w-md mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-800">Integrity Score</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            candidate.integrity.risk_level === 'GREEN' ? 'bg-green-100 text-green-800' :
                                            candidate.integrity.risk_level === 'AMBER' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {candidate.integrity.score}% - {candidate.integrity.risk_level}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className={`h-3 rounded-full transition-all duration-500 ${
                                                candidate.integrity.risk_level === 'GREEN' ? 'bg-green-500' :
                                                candidate.integrity.risk_level === 'AMBER' ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                            style={{ width: `${candidate.integrity.score}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleCompare}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Compare Candidate
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleBookmark}
                                    disabled={bookmarkLoading}
                                    className={`p-2 rounded-full transition-colors ${
                                        isBookmarked 
                                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <Bookmark className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    {candidate.financial_summary && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">Financial Summary</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        ${candidate.financial_summary.total_estimated_spend.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Estimated Spend</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        ${candidate.financial_summary.total_digital_spend.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">Digital Spend</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        ${candidate.financial_summary.total_physical_spend.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">Physical Spend</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        ${candidate.financial_summary.spending_gap.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">Spending Gap</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Donor Information */}
                    {candidate.donor_count !== undefined && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">Donor Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {candidate.donor_count.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Donors</div>
                                </div>
                                {candidate.risk_summary && (
                                    <>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {candidate.risk_summary.high.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500">High Risk Donors</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {candidate.risk_summary.high_risk_percentage.toFixed(1)}%
                                            </div>
                                            <div className="text-sm text-gray-500">High Risk Percentage</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Red Flags */}
                    {candidate.red_flags && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-6 text-red-600">Risk Analysis</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {candidate.red_flags.briefcase_companies}
                                    </div>
                                    <div className="text-sm text-gray-500">Briefcase Companies</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {candidate.red_flags.unverifiable_entities}
                                    </div>
                                    <div className="text-sm text-gray-500">Unverifiable Entities</div>
                                </div>
                                {candidate.red_flags.concentration_risk && (
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {candidate.red_flags.concentration_risk.top_donor_percentage.toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-500">Top Donor Concentration</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default SingleCandidatePage;
