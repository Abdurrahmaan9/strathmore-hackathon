"use client";
import React, { useState, useEffect } from 'react';
import { Search, Users, MapPin, ExternalLink, AlertCircle, Loader2, Play, Calendar, Globe } from 'lucide-react';
import MainLayout from '@/components/layouts/main-layout';
import { Breadcrumb } from '@/components/common/breadcrumb';
import GlobalSearch from '@/components/common/global-search';
// import partiesService, { PoliticalParty, FeaturedContent } from '@/services/parties.service';

const PoliticalPartiesPage: React.FC = () => {
    const [isClient, setIsClient] = useState(false);
    const [parties, setParties] = useState<PoliticalParty[]>([]);
    const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>([]);
    const [filteredParties, setFilteredParties] = useState<PoliticalParty[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllParties, setShowAllParties] = useState(false);
    const [filters, setFilters] = useState({
        status: 'active',
        sort_by: 'name',
        sort_order: 'asc'
    });

    useEffect(() => {
        setIsClient(true);
        loadPartiesData();
    }, []);

    useEffect(() => {
        loadPartiesData();
    }, [filters]);

    useEffect(() => {
        if (searchQuery.trim()) {
            searchParties();
        } else {
            setFilteredParties(parties);
        }
    }, [searchQuery, parties]);

    const loadPartiesData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Load parties and featured content in parallel
            const [partiesResponse, featuredResponse] = await Promise.all([
                partiesService.getAllParties(filters),
                partiesService.getFeaturedParties()
            ]);

            if (partiesResponse.success) {
                const partiesData = partiesResponse.data?.data || partiesResponse.data || [];
                setParties(partiesData);
                setFilteredParties(partiesData);
            } else {
                setError(partiesResponse.message || 'Failed to load parties');
            }

            if (featuredResponse.success) {
                setFeaturedContent(featuredResponse.data?.content || []);
            }
        } catch (err) {
            console.error('Error loading parties data:', err);
            setError('Failed to load political parties data');
        } finally {
            setLoading(false);
        }
    };

    const searchParties = async () => {
        if (!searchQuery.trim()) {
            setFilteredParties(parties);
            return;
        }

        try {
            const response = await partiesService.searchPartiesByName(searchQuery, filters);

            if (response.success) {
                const searchResults = response.data?.data || response.data || [];
                setFilteredParties(searchResults);
            } else {
                console.error('Search failed:', response.message);
                setFilteredParties([]);
            }
        } catch (err) {
            console.error('Error searching parties:', err);
            setFilteredParties([]);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getDisplayedParties = () => {
        return showAllParties ? filteredParties : filteredParties.slice(0, 6);
    };

    const getPartyColor = (colors: string | undefined): string => {
        if (!colors) return 'bg-gray-500';

        // Try to extract a valid Tailwind class or convert hex to a reasonable class
        if (colors.includes('bg-')) return colors.split(' ')[0];
        if (colors.includes('#')) return 'bg-blue-500'; // Default fallback

        // Map common color names to Tailwind classes
        const colorMap: Record<string, string> = {
            'red': 'bg-red-500',
            'blue': 'bg-blue-500',
            'green': 'bg-green-500',
            'yellow': 'bg-yellow-500',
            'orange': 'bg-orange-500',
            'purple': 'bg-purple-500',
            'indigo': 'bg-indigo-500',
            'pink': 'bg-pink-500'
        };

        const colorName = colors.toLowerCase();
        return colorMap[colorName] || 'bg-gray-500';
    };

    // Component: Party Card
    const PartyCard: React.FC<{ party: PoliticalParty }> = ({ party }) => {
        const partyColor = getPartyColor(party.colors);

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Party Logo and Header */}
                <div className={`${partyColor} p-6 text-black relative`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                            {party.logo && party.logo !== '/api/placeholder/150/150' ? (
                                <img
                                    src={party.logo}
                                    alt={`${party.name} logo`}
                                    className="w-12 h-12 object-contain"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-black">
                                    {party.abbreviation?.charAt(0) || party.name.charAt(0)}
                                </span>
                            )}
                        </div>
                        {party.founded_year && (
                            <div className="text-right">
                                <div className="text-xs opacity-75">Est.</div>
                                <div className="text-sm font-semibold">{party.founded_year}</div>
                            </div>
                        )}
                    </div>
                    <h3 className="text-lg font-bold mb-1">
                        {party.name} {party.abbreviation && `(${party.abbreviation})`}
                    </h3>
                    {party.slogan && (
                        <p className="text-sm opacity-90 italic">"{party.slogan}"</p>
                    )}
                </div>

                {/* Party Details */}
                <div className="p-6">
                    <div className="space-y-3 mb-4">
                        {party.leader && (
                            <div className="flex items-center text-sm text-black">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                <span><strong>Leader:</strong> {party.leader}</span>
                            </div>
                        )}

                        {party.headquarters && (
                            <div className="flex items-center text-sm text-black">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                <span><strong>HQ:</strong> {party.headquarters}</span>
                            </div>
                        )}

                        <div className="flex items-center text-sm text-black">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            <span><strong>Candidates:</strong> {party.candidate_count}</span>
                        </div>

                        {party.website && (
                            <div className="flex items-center text-sm text-black">
                                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                                <a
                                    href={party.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                    Visit Website
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Party Description */}
                    {party.description && (
                        <div className="mb-4">
                            <p className="text-sm text-black line-clamp-3">
                                {party.description}
                            </p>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${party.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-black'
                            }`}>
                            {party.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {party.type && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {party.type}
                            </span>
                        )}
                    </div>

                    {/* View Party Profile Button */}
                    <button
                        onClick={() => window.location.href = `/parties/${party.slug}`}
                        className="w-full py-2 px-4 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                    >
                        View Party Profile
                    </button>
                </div>
            </div>
        );
    };

    // Component: Featured Content Card
    const FeaturedContentCard: React.FC<{ content: FeaturedContent }> = ({ content }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
                {content.thumbnail ? (
                    <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Play className="w-12 h-12 text-black" />
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 bg-black bg-opacity-75 text-black text-xs rounded-full">
                        {content.type.toUpperCase()}
                    </span>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                    <div className="p-4 text-black w-full">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{content.title}</h3>
                        <div className="space-y-1">
                            <p className="text-sm opacity-90">{content.party_name}</p>
                            <div className="flex items-center text-xs opacity-75">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(content.published_date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <p className="text-sm text-black mb-3">{content.description}</p>
                <div className="flex space-x-2">
                    {content.video_url && (
                        <a
                            href={content.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-red-600 text-black text-center rounded text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                            Watch Video
                        </a>
                    )}
                    {content.article_url && (
                        <a
                            href={content.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-blue-600 text-black text-center rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Read Article
                        </a>
                    )}
                </div>
            </div>
        </div>
    );

    // Component: Filter Controls
    const FilterControls: React.FC = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                        <option value="all">All Parties</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                        value={filters.sort_by}
                        onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="name">Name</option>
                        <option value="founded">Year Founded</option>
                        <option value="candidates">Candidate Count</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                    <select
                        value={filters.sort_order}
                        onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
            </div>
        </div>
    );

    if (!isClient) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <Breadcrumb pageTitle='Political Parties' />
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-black">Loading political parties...</span>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                        <p className="text-black mb-4">{error}</p>
                        <button
                            onClick={loadPartiesData}
                            className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <Breadcrumb pageTitle='Political Parties' />

                {/* Hero Section */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Search */}
                        <div className="max-w-md mx-auto mb-8">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for a party..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-full focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Hero Text */}
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Learn about the parties shaping Kenya's political future.
                            </h1>
                            <p className="text-lg text-black leading-relaxed">
                                VOTE-TRACE KENYA helps you explore Kenya's registered political parties to understand their values,
                                leadership, key issues, and affiliated candidates in one place.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-black">Loading political parties...</span>
                        </div>
                    ) : (
                        <>
                            {/* Filter Controls */}
                            <FilterControls />

                            {/* Results Summary */}
                            <div className="mb-6">
                                <p className="text-black">
                                    {searchQuery ?
                                        `Found ${filteredParties.length} parties matching "${searchQuery}"` :
                                        `Showing ${filteredParties.length} political parties`
                                    }
                                </p>
                            </div>

                            {/* Parties Grid */}
                            <div className="mb-12">
                                {filteredParties.length === 0 ? (
                                    <div className="text-center py-16">
                                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                                            No parties found
                                        </h3>
                                        <p className="text-black">
                                            Try adjusting your search terms or filters to find political parties.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                            {getDisplayedParties().map((party) => (
                                                <PartyCard key={party.id} party={party} />
                                            ))}
                                        </div>

                                        {/* Show More/Less Button */}
                                        {filteredParties.length > 6 && (
                                            <div className="text-center">
                                                <button
                                                    onClick={() => setShowAllParties(!showAllParties)}
                                                    className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                                >
                                                    {showAllParties ? 'Show Less' : `View All ${filteredParties.length} Parties`}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Featured Parties Section */}
                            {featuredContent.length > 0 && (
                                <div className="mb-12">
                                    <div className="mb-8">
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                            Featured Parties
                                        </h2>
                                        <p className="text-black max-w-3xl">
                                            Keep up with parties that have recently been in the public spotlight through rallies,
                                            media appearances, or active participation in major national discussions.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {featuredContent.map((content) => (
                                            <FeaturedContentCard key={content.id} content={content} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Call to Action */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Want to compare parties side by side?
                                </h3>
                                <p className="text-black mb-6">
                                    Use our party comparison tool to see how different political parties stack up
                                    against each other in terms of policies, leadership, and track record.
                                </p>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => window.location.href = '/parties/compare'}
                                        className="w-full max-w-sm py-3 px-6 bg-blue-600 text-black rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Compare Parties
                                    </button>

                                    <div className="text-sm text-gray-500">
                                        <span>Don't see a party? </span>
                                        <a href="/parties/all" className="text-blue-600 hover:text-blue-800 underline">
                                            View full list of all registered political parties
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default PoliticalPartiesPage;