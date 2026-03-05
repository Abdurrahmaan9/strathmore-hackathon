"use client";
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react';
import { Shield, Scale, Unlock, Loader2, AlertCircle, Users, DollarSign } from 'lucide-react';
import MainLayout from '@/components/layouts/main-layout';
import { ExpandableSection } from '@/components/sections/about/expandable-section';
import { ValueCard } from '@/components/sections/about/value-card';
import { TeamMember } from '@/components/sections/about/team-member';
import { Breadcrumb } from '@/components/common/breadcrumb';
import GlobalSearch from '@/components/common/global-search';
import { Candidate } from '@/types/candidate.types';
import useCandidates, { useCandidateSearch } from '@/hooks/use-candidates';
import CandidateCard from '@/components/sections/candidates/candidate-card';

// Inline styles to override filter text color in GlobalSearch
const styles = `
  .custom-global-search select,
  .custom-global-search label,
  .custom-global-search button,
  .custom-global-search input,
  .custom-global-search .filter-text {
    color: #111827 !important; /* text-gray-900 for light backgrounds (e.g., dropdowns) */
  }
  .custom-global-search {
    color: #F3F4F6 !important; /* text-gray-100 for main text against dark gradient */
  }
`;

interface TeamMemberType {
    name: string;
    role: string;
}

type ExpandedSectionType = 'mission' | 'vision' | 'values' | null;

const AboutUs: React.FC = () => {
    const [expandedSection, setExpandedSection] = useState<ExpandedSectionType>(null);
    const [isClient, setIsClient] = useState(false);

    // Custom hooks for candidates data and search (updated for VoteTrace360 API)
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

    const {
        query: searchQuery,
        setQuery: setSearchQuery,
        filters: searchFilters,
        setFilters: setSearchFilters,
    } = useCandidateSearch();

    // Set client-side flag and load initial data
    useEffect(() => {
        setIsClient(true);
        fetchCandidates();
    }, [fetchCandidates]);

    // Handle search from GlobalSearch component
    const handleSearch = async (query: string, filters?: any) => {
        if (!isClient) return;
        setSearchQuery(query);
        setSearchFilters(filters || {});
        await searchCandidates(query, filters || {});
    };

    // Clear search handler
    const handleClearSearch = () => {
        if (!isClient) return;
        setSearchQuery('');
        clearSearch();
    };

    // Format candidate data for display (same as Home page)
    const formatCandidateForDisplay = (candidate: any): Candidate => {
        return {
            ...candidate,
            party: typeof candidate.party === 'object' && candidate.party?.party_name
                ? candidate.party.party_name
                : candidate.party || 'Independent',
            partyAbbreviation: typeof candidate.party === 'object' && candidate.party?.party_code
                ? candidate.party.party_code
                : candidate.partyAbbreviation || 'IND',
            partyLogo: typeof candidate.party === 'object' && candidate.party?.party_logo
                ? candidate.party.party_logo
                : candidate.partyLogo || null,
            location: typeof candidate.county === 'object' && candidate.county?.county
                ? candidate.county.county
                : candidate.location || null,
            constituency: typeof candidate.county === 'object' && candidate.county?.constituency
                ? candidate.county.constituency
                : candidate.constituency || null,
        };
    };

    // Component: Search Results (same as Home page)
    const SearchResults = () => {
        if (!searchResults || !isClient) return null;

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                        Search Results
                        {searchResults.total !== undefined && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({searchResults.total} found)
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={handleClearSearch}
                        className="text-sm text-blue-600 hover:text-blue-800"
                        type="button"
                    >
                        Clear Search
                    </button>
                </div>

                {searchLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-black">Searching...</span>
                    </div>
                ) : searchResults.data && searchResults.data.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                        {searchResults.data.map((candidate: Candidate) => (
                            <CandidateCard
                                key={candidate.id}
                                candidate={formatCandidateForDisplay(candidate)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>No candidates found matching your search</p>
                    </div>
                )}
            </div>
        );
    };

    // Toggle expandable sections
    const toggleSection = (id: string | number) => {
        if (!isClient) return;
        if (id === 'mission' || id === 'vision' || id === 'values') {
            setExpandedSection(expandedSection === id ? null : id);
        }
    };

    // Handle explore candidates button click
    const handleExploreCandidates = () => {
        if (!isClient) return;
        // Add your navigation logic here
        console.log('Navigate to candidates page');
    };

    const teamMembers: TeamMemberType[] = [
        { name: "Michael Johnson", role: "Executive Director" },
        { name: "Sarah Williams", role: "Product Manager" },
        { name: "David Chen", role: "Lead Developer" },
        { name: "Maria Rodriguez", role: "UX Designer" },
        { name: "James Thompson", role: "Data Analyst" },
        { name: "Lisa Davis", role: "Community Outreach" },
    ];

    const missionContent = "Our mission is to empower every voter with accurate, verified, and accessible information about candidates and elections. We believe that democracy thrives when citizens have the tools and knowledge they need to make informed decisions at the ballot box.";

    const visionContent = "We envision a future where every voter can easily access comprehensive, unbiased information about their electoral choices, leading to more engaged citizens and stronger democratic institutions across all communities.";

    const coreValuesContent = "Transparency, accuracy, and neutrality form the foundation of everything we do. We are committed to providing fact-based information without political bias, ensuring open access to all, and maintaining the highest standards of data verification and user privacy.";

    // Don't render interactive elements during SSR
    if (!isClient) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-black">Loading...</span>
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

    return (
        <MainLayout>
            {/* Inline styles for filter text color */}
            <style jsx>{styles}</style>

            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <Breadcrumb pageTitle="About Us" />

                {/* Global Search */}
                <GlobalSearch
                    placeholder="Find your candidates and make informed decisions..."
                    showLocationFilter={true}
                    showAdvancedFilters={true}
                    onSearch={handleSearch}
                    variant="hero"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 custom-global-search"
                    initialQuery={searchQuery}
                    initialFilters={searchFilters}
                    filterOptions={{
                        counties: [],
                        constituencies: [],
                        parties: [],
                    }}
                />

                {/* Main Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-black">Loading...</span>
                    </div>
                ) : searchResults ? (
                    <SearchResults />
                ) : (
                    <>
                        {/* Hero Section */}
                        <section className="relative bg-gray-100 py-8 md:py-16 lg:py-20">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="relative">
                                    <div className="w-full h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 bg-gray-300 rounded-lg mb-6 md:mb-8 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                                        <div className="relative z-10 text-black text-left max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl ml-4 sm:ml-6 md:ml-8">
                                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 md:mb-4 leading-tight">
                                                Empowering Every Voter with Clarity, Truth, and Choice
                                            </h1>
                                        </div>
                                        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 right-4 sm:right-6 md:right-8 text-black/20 text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold">
                                            VOTE
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Our Story Section */}
                        {/* <section className="py-12 md:py-16 lg:py-20 bg-white">
                            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 md:mb-8 lg:mb-12 text-center">Our Story</h2>
                                <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-gray-300 rounded-lg mb-6 md:mb-8 lg:mb-12 flex items-center justify-center">
                                    <div className="text-gray-500 text-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-400 rounded mx-auto mb-2 md:mb-4"></div>
                                        <p className="text-sm md:text-base">Voting process image</p>
                                    </div>
                                </div>
                                <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-700">
                                    <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-6 lg:gap-8">
                                        <p className="text-base md:text-lg lg:text-xl leading-relaxed mb-4 md:mb-6 text-center lg:text-left">
                                            VOTE-TRACE KENYA was born out of a simple yet powerful idea — that democracy thrives when voters are informed.
                                            In a digital age where misinformation spreads fast, we built VOTE-TRACE KENYA to serve as a non-partisan, fact-verified,
                                            and user-friendly platform that puts candidate information in the hands of citizens.
                                        </p>
                                        <p className="text-base md:text-lg lg:text-xl leading-relaxed text-center lg:text-left">
                                            Whether you&apos;re a first-time voter or a seasoned civic participant, VOTE-TRACE KENYA helps you cut through the clutter
                                            and vote with confidence.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-8 md:mt-12 lg:mt-16 space-y-3 md:space-y-4">
                                    <ExpandableSection
                                        id="mission"
                                        title="Mission"
                                        content={missionContent}
                                        isExpanded={expandedSection === 'mission'}
                                        onToggle={toggleSection}
                                    />
                                    <ExpandableSection
                                        id="vision"
                                        title="Vision"
                                        content={visionContent}
                                        isExpanded={expandedSection === 'vision'}
                                        onToggle={toggleSection}
                                    />
                                    <ExpandableSection
                                        id="values"
                                        title="Core Values"
                                        content={coreValuesContent}
                                        isExpanded={expandedSection === 'values'}
                                        onToggle={toggleSection}
                                    />
                                </div>
                            </div>
                        </section> */}

                        {/* What We Stand For Section */}
                        {/* <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
                            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 md:mb-12 lg:mb-16 text-center">What We Stand For</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                                    <ValueCard
                                        icon={<Shield className="w-10 h-10 md:w-12 md:h-12 text-black" />}
                                        title="Data Verified"
                                        description="We go through a comprehensive verification process to ensure the accuracy of the information you see."
                                    />
                                    <ValueCard
                                        icon={<Scale className="w-10 h-10 md:w-12 md:h-12 text-black" />}
                                        title="Non-Partisan"
                                        description="We are committed to neutrality. Our platform provides information without political bias."
                                    />
                                    <ValueCard
                                        icon={<Unlock className="w-10 h-10 md:w-12 md:h-12 text-black" />}
                                        title="Open Access"
                                        description="All information on our platform is freely available to everyone, ensuring democratic access to knowledge."
                                    />
                                </div>
                            </div>
                        </section> */}

                        {/* VoteTrace360 System Section */}
                        <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 md:mb-8 lg:mb-12 text-center">VoteTrace360 System</h2>
                                
                                {/* System Overview */}
                                <div className="text-center mb-12 md:mb-16">
                                    <p className="text-base md:text-lg lg:text-xl text-black max-w-4xl mx-auto leading-relaxed">
                                        VoteTrace360 is a comprehensive electoral integrity platform that provides real-time monitoring and analysis of campaign finance, 
                                        donor contributions, and candidate compliance. Our system leverages advanced data analytics to ensure transparency and accountability 
                                        in the electoral process.
                                    </p>
                                </div>

                                {/* Key Features Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-black mb-3">Candidate Monitoring</h3>
                                        <p className="text-sm text-black leading-relaxed">
                                            Real-time tracking of candidate integrity scores, risk assessments, and compliance status. 
                                            Monitor spending patterns and red flags across all candidates.
                                        </p>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                            <DollarSign className="w-6 h-6 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-black mb-3">Digital Spend Analysis</h3>
                                        <p className="text-sm text-black leading-relaxed">
                                            Track digital advertising spend across Meta, Google, and X/Twitter platforms. 
                                            Analyze spending patterns and identify potential violations.
                                        </p>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                            <AlertCircle className="w-6 h-6 text-red-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-black mb-3">Donor Risk Assessment</h3>
                                        <p className="text-sm text-black leading-relaxed">
                                            Comprehensive analysis of donor contributions with risk level identification. 
                                            Flag suspicious donations and briefcase companies automatically.
                                        </p>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                            <Scale className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-black mb-3">Candidate Comparison</h3>
                                        <p className="text-sm text-black leading-relaxed">
                                            Side-by-side comparison of candidates based on integrity scores, 
                                            spending patterns, and risk factors for informed decision-making.
                                        </p>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                            <Shield className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-black mb-3">Risk Level Classification</h3>
                                        <p className="text-sm text-black leading-relaxed">
                                            Automated risk assessment with color-coded classification: 
                                            Green (Low Risk), Amber (Medium Risk), Red (High Risk).
                                        </p>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                            <Unlock className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-black mb-3">Data Transparency</h3>
                                        <p className="text-sm text-black leading-relaxed">
                                            Open access to electoral data with detailed breakdowns of spending sources, 
                                            donor information, and compliance metrics.
                                        </p>
                                    </div>
                                </div>

                                {/* System Architecture */}
                                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                                    <h3 className="text-xl font-semibold text-black mb-6 text-center">System Architecture</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                                                <span className="text-white font-bold">API</span>
                                            </div>
                                            <h4 className="font-semibold text-black mb-2">VoteTrace360 API</h4>
                                            <p className="text-sm text-black">
                                                RESTful API providing real-time data access for candidates, 
                                                digital spend, and donor analysis.
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                                                <span className="text-white font-bold">UI</span>
                                            </div>
                                            <h4 className="font-semibold text-black mb-2">Modern Interface</h4>
                                            <p className="text-sm text-black">
                                                Responsive web application built with Next.js and Tailwind CSS 
                                                for optimal user experience.
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                                                <span className="text-white font-bold">DB</span>
                                            </div>
                                            <h4 className="font-semibold text-black mb-2">Secure Database</h4>
                                            <p className="text-sm text-black">
                                                Robust data storage with encryption and regular backups 
                                                ensuring data integrity and security.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Who We Are Section */}
                        {/* <section className="py-12 md:py-16 lg:py-20 bg-white">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="max-w-4xl">
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 md:mb-8">Who we are</h2>
                                    <p className="text-base md:text-lg lg:text-xl text-black mb-8 md:mb-12 lg:mb-16 max-w-4xl leading-relaxed">
                                        We&apos;re a team of developers, designers, civic educators, and researchers committed to
                                        strengthening electoral integrity through digital tools. Our work is driven by a deep belief
                                        that informed voters make stronger democracies.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
                                    {teamMembers.map((member: TeamMemberType, index: number) => (
                                        <TeamMember
                                            key={`${member.name}-${index}`}
                                            name={member.name}
                                            role={member.role}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section> */}

                        {/* Call to Action Section */}
                        {/* <section className="py-12 md:py-16 lg:py-20 bg-blue-50">
                            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 md:mb-4 lg:mb-6">
                                    Join us in creating a more transparent electoral process.
                                </h2>
                                <p className="text-base md:text-lg lg:text-xl text-black mb-6 md:mb-8 lg:mb-10 max-w-3xl mx-auto">
                                    Whether you&apos;re voting, volunteering, or sharing, your action matters.
                                </p>
                                <button
                                    onClick={handleExploreCandidates}
                                    className="bg-blue-600 text-black px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 rounded-lg text-base md:text-lg lg:text-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    aria-label="Explore candidates and election information"
                                    type="button"
                                >
                                    Explore Candidates Now
                                </button>
                            </div>
                        </section> */}
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default AboutUs;