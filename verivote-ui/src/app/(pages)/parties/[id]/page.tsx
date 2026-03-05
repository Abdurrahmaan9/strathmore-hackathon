"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Users, Calendar, MapPin, ExternalLink, Play, AlertCircle, Loader2, Globe, Building } from 'lucide-react';
import MainLayout from '@/components/layouts/main-layout';
import { Breadcrumb } from '@/components/common/breadcrumb';
import partiesService, { PoliticalParty } from '@/services/parties.service';
import { useParams, useRouter } from 'next/navigation';

// Types for party data based on API response
interface PartyProfile extends PoliticalParty {
    full_description: string;
    registered_members: string;
    social_media?: {
        twitter?: string;
        facebook?: string;
        instagram?: string;
    };
}

interface PolicyPosition {
    category: string;
    stance: string;
    details?: string;
    quote?: {
        text: string;
        author: string;
        date: string;
    };
    media_link?: {
        title: string;
        url: string;
        type: 'interview' | 'speech' | 'article';
    };
}

interface CampaignEvent {
    id: string;
    title: string;
    date: string;
    location: string;
    description?: string;
    image?: string;
    type: 'rally' | 'interview' | 'speech' | 'debate';
}

interface MediaItem {
    id: string;
    title: string;
    description: string;
    url: string;
    type: 'video' | 'article' | 'interview';
    published_date: string;
}

interface PartyCandidateSimple {
    id: string;
    name: string;
    slug: string;
    position: string;
    county: string;
    image: string;
    tagline?: string;
}

const SinglePartyPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const slug = params?.id as string;

    const [isClient, setIsClient] = useState(false);
    const [party, setParty] = useState<PartyProfile | null>(null);
    const [candidates, setCandidates] = useState<PartyCandidateSimple[]>([]);
    const [policyPositions, setPolicyPositions] = useState<PolicyPosition[]>([]);
    const [campaignEvents, setCampaignEvents] = useState<CampaignEvent[]>([]);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPolicies, setExpandedPolicies] = useState<{ [key: string]: boolean }>({});
    const [showAllCandidates, setShowAllCandidates] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (slug && typeof slug === 'string') {
            loadPartyData(slug);
        }
    }, [slug]);

    const loadPartyData = async (partySlug: string) => {
        setLoading(true);
        setError(null);

        try {
            // Load all party data in parallel
            const [
                partyResponse,
                candidatesResponse,
                policiesResponse,
                mediaResponse,
                eventsResponse
            ] = await Promise.all([
                partiesService.getPartyDetails(partySlug),
                partiesService.getPartyCandidates(partySlug, { per_page: 50 }),
                partiesService.getPartyPolicyPositions(partySlug),
                partiesService.getPartyMediaContent(partySlug),
                partiesService.getPartyCampaignEvents(partySlug)
            ]);

            // Handle party details
            if (partyResponse.success) {
                setParty(partyResponse.data);
            } else {
                setError(partyResponse.message || 'Failed to load party details');
                return;
            }

            // Handle candidates
            if (candidatesResponse.success) {
                const candidatesData = candidatesResponse.data?.candidates?.data ||
                    candidatesResponse.data?.data ||
                    [];
                setCandidates(candidatesData);
            }

            // Handle policies
            if (policiesResponse.success) {
                setPolicyPositions(policiesResponse.data || []);
            }

            // Handle media
            if (mediaResponse.success) {
                setMediaItems(mediaResponse.data || []);
            }

            // Handle events
            if (eventsResponse.success) {
                setCampaignEvents(eventsResponse.data || []);
            }

        } catch (err) {
            console.error('Error loading party data:', err);
            setError('Failed to load party data');
        } finally {
            setLoading(false);
        }
    };

    const togglePolicyExpansion = (category: string) => {
        setExpandedPolicies(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const getDisplayedCandidates = () => {
        const filtered = candidates.filter(candidate =>
            candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.position.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return showAllCandidates ? filtered : filtered.slice(0, 6);
    };

    const getPartyColor = (colors: string | undefined): string => {
        if (!colors) return 'bg-blue-500';

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
        return colorMap[colorName] || 'bg-blue-500';
    };

    // Component: Party Header
    const PartyHeader: React.FC<{ party: PartyProfile }> = ({ party }) => {
        const partyColor = getPartyColor(party.colors);

        return (
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Search */}
                    <div className="max-w-md mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for a candidate..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-full focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Party Logo and Info */}
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-6">
                            {party.logo && party.logo !== '/api/placeholder/150/150' ? (
                                <img
                                    src={party.logo}
                                    alt={`${party.name} logo`}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className={`w-full h-full ${partyColor} rounded-full flex items-center justify-center`}>
                                    <span className="text-4xl font-bold text-black">
                                        {party.abbreviation?.charAt(0) || party.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            {party.name} {party.abbreviation && `(${party.abbreviation})`}
                        </h1>
                        {party.slogan && (
                            <p className="text-lg text-black italic mb-8">"{party.slogan}"</p>
                        )}

                        {/* Party Stats */}
                        <div className={`${partyColor} text-black rounded-lg p-6 max-w-md mx-auto`}>
                            <div className="space-y-3">
                                {party.founded_year && (
                                    <div className="flex justify-between items-center border-b border-white border-opacity-30 pb-2">
                                        <span className="font-medium">Year Founded:</span>
                                        <span className="font-bold">{party.founded_year}</span>
                                    </div>
                                )}
                                {party.leader && (
                                    <div className="flex justify-between items-center border-b border-white border-opacity-30 pb-2">
                                        <span className="font-medium">Party Leader:</span>
                                        <span className="font-bold">{party.leader}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-b border-white border-opacity-30 pb-2">
                                    <span className="font-medium">Candidates:</span>
                                    <span className="font-bold">{party.candidate_count || 0}</span>
                                </div>
                                {party.status && (
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Status:</span>
                                        <span className="font-bold capitalize">{party.status}</span>
                                    </div>
                                )}
                            </div>

                            {/* Party Links */}
                            <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                                <div className="flex justify-center space-x-4">
                                    {party.website && (
                                        <a
                                            href={party.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-black hover:text-gray-200"
                                        >
                                            <Globe className="w-4 h-4 mr-1" />
                                            Website
                                        </a>
                                    )}
                                    {party.headquarters && (
                                        <div className="flex items-center text-black">
                                            <Building className="w-4 h-4 mr-1" />
                                            {party.headquarters}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Component: Overview Section
    const OverviewSection: React.FC<{ party: PartyProfile }> = ({ party }) => (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Overview</h2>
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed text-lg">
                        {party.full_description || party.description}
                    </p>

                    {party.ideologies && party.ideologies.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Party Ideology</h3>
                            <div className="flex flex-wrap gap-2">
                                {party.ideologies.map((ideology, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                    >
                                        {ideology}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {party.type && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Party Type</h3>
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                                {party.type}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Component: Policy Position Card
    const PolicyPositionCard: React.FC<{ policy: PolicyPosition }> = ({ policy }) => {
        const isExpanded = expandedPolicies[policy.category];
        const partyColor = party ? getPartyColor(party.colors) : 'bg-blue-900';

        return (
            <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                <button
                    onClick={() => togglePolicyExpansion(policy.category)}
                    className={`w-full px-6 py-4 ${partyColor} text-black text-left hover:opacity-90 transition-opacity flex items-center justify-between`}
                >
                    <span className="font-medium">{policy.category}</span>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                    ) : (
                        <ChevronDown className="w-5 h-5" />
                    )}
                </button>

                {isExpanded && (
                    <div className="p-6 bg-gray-50">
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Party Stance:</h4>
                            <p className="text-gray-700 mb-2">{policy.stance}</p>
                            {policy.details && (
                                <p className="text-black text-sm">{policy.details}</p>
                            )}
                        </div>

                        {policy.quote && (
                            <div className="bg-blue-100 p-4 rounded-lg mb-4">
                                <div className="text-blue-900 font-medium mb-2">{policy.quote.author}</div>
                                <blockquote className="text-blue-800 italic mb-2">
                                    "{policy.quote.text}"
                                </blockquote>
                                <div className="text-blue-700 text-sm">{policy.quote.date}</div>
                            </div>
                        )}

                        {policy.media_link && (
                            <div className="mt-4">
                                <a
                                    href={policy.media_link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-600 hover:text-red-800 font-medium underline inline-flex items-center"
                                >
                                    {policy.media_link.title}
                                    <ExternalLink className="w-4 h-4 ml-1" />
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Component: Candidate Card
    const CandidateCard: React.FC<{ candidate: PartyCandidateSimple }> = ({ candidate }) => (
        <div className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            onClick={() => router.push(`/candidates/${candidate.slug}`)}>
            <div className="w-32 h-32 mx-auto mb-3 rounded-lg overflow-hidden bg-gray-200">
                {candidate.image && candidate.image !== '/api/placeholder/150/150' ? (
                    <img
                        src={candidate.image}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl font-bold">{candidate.name.charAt(0)}</span>
                    </div>
                )}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{candidate.name}</h3>
            <p className="text-sm text-black mb-1">{candidate.position}</p>
            {candidate.county && (
                <p className="text-xs text-gray-500">{candidate.county}</p>
            )}
        </div>
    );

    // Component: Campaign Event Card
    const CampaignEventCard: React.FC<{ event: CampaignEvent }> = ({ event }) => {
        const partyColor = party ? getPartyColor(party.colors) : 'bg-red-600';

        return (
            <div className="relative rounded-lg overflow-hidden shadow-lg">
                <div className={`relative h-64 ${partyColor}`}>
                    {event.image ? (
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl font-bold text-black opacity-50">
                                {party?.abbreviation || 'PARTY'}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                        <div className="p-6 text-black">
                            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                            <div className="space-y-1">
                                <p className="text-sm opacity-90">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Date: {new Date(event.date).toLocaleDateString()}
                                </p>
                                <p className="text-sm opacity-90">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Location: {event.location}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Component: Media Item
    const MediaItemCard: React.FC<{ item: MediaItem }> = ({ item }) => (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    {item.type === 'video' && <Play className="w-6 h-6 text-red-600" />}
                    {item.type === 'interview' && <Users className="w-6 h-6 text-blue-600" />}
                    {item.type === 'article' && <ExternalLink className="w-6 h-6 text-green-600" />}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-black mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            {new Date(item.published_date).toLocaleDateString()}
                        </span>
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            View
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!isClient) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <Breadcrumb pageTitle='Loading...' />
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-black">Loading party profile...</span>
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
                            onClick={() => slug && loadPartyData(slug as string)}
                            className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!party) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <Breadcrumb pageTitle='Party Not Found' />
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Party Not Found</h2>
                            <p className="text-black">The requested party profile could not be found.</p>
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
                    pageTitle={party.abbreviation || party.name}
                    breadcrumbs={[
                        { label: 'Home', href: '/' },
                        { label: 'Political Parties', href: '/parties' },
                        { label: party.abbreviation || party.name, href: `/parties/${party.slug}` }
                    ]}
                />

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-black">Loading party profile...</span>
                    </div>
                ) : (
                    <>
                        {/* Party Header */}
                        <PartyHeader party={party} />

                        {/* Overview Section */}
                        <div className="border-t border-gray-200">
                            <OverviewSection party={party} />
                        </div>

                        {/* Ideology & Policy Focus */}
                        {policyPositions.length > 0 && (
                            <div className="bg-gray-50 border-t border-gray-200">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                                        Ideology & Policy Focus
                                    </h2>
                                    <div className="space-y-4">
                                        {policyPositions.map((policy, index) => (
                                            <PolicyPositionCard key={index} policy={policy} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Candidates under Party */}
                        {candidates.length > 0 && (
                            <div className="bg-white border-t border-gray-200">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                                        Candidates under {party.abbreviation || party.name}
                                    </h2>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
                                        {getDisplayedCandidates().map((candidate) => (
                                            <CandidateCard key={candidate.id} candidate={candidate} />
                                        ))}
                                    </div>

                                    {candidates.length > 6 && (
                                        <div className="text-center">
                                            <button
                                                onClick={() => setShowAllCandidates(!showAllCandidates)}
                                                className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                            >
                                                {showAllCandidates ? 'Show Less' : `View All ${candidates.length} Candidates`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Campaign Trail & Media */}
                        {(campaignEvents.length > 0 || mediaItems.length > 0) && (
                            <div className="bg-gray-50 border-t border-gray-200">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                                        Campaign Trail & Media
                                    </h2>

                                    {/* Campaign Events */}
                                    {campaignEvents.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Events</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {campaignEvents.map((event) => (
                                                    <CampaignEventCard key={event.id} event={event} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Media Section */}
                                    {mediaItems.length > 0 && (
                                        <div className="bg-white rounded-lg p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">Media</h3>
                                            <p className="text-black mb-6">
                                                Catch up on speeches, interviews, and campaign videos shared by the party
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {mediaItems.map((item) => (
                                                    <MediaItemCard key={item.id} item={item} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Empty States */}
                        {candidates.length === 0 && policyPositions.length === 0 &&
                            campaignEvents.length === 0 && mediaItems.length === 0 && (
                                <div className="bg-white border-t border-gray-200">
                                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                                        <div className="text-center">
                                            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                                No Additional Information Available
                                            </h3>
                                            <p className="text-black">
                                                Detailed information about candidates, policies, and events will be displayed here when available.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default SinglePartyPage;