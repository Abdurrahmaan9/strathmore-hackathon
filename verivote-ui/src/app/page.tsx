"use client";
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import CandidatesToWatch from "../components/sections/home/candidates-to-watch";
import GetElectionReady from "../components/sections/home/get-election-ready";
import Hero from "../components/sections/home/hero";
import InformedVoting from "../components/sections/home/informed-voting";
import MainLayout from "../components/layouts/main-layout";
// import GlobalSearch from '@/components/common/global-search';
import { Candidate } from '@/types/candidate.types';
import useCandidates, { useCandidateSearch } from '@/hooks/use-candidates';
import CandidateCard from '@/components/sections/candidates/candidate-card';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  // Custom hooks for candidates data and search
  const {
    searchResults,
    filterOptions,
    loading,
    searchLoading,
    error,
    fetchInitialData,
    searchCandidates,
    clearSearch,
    clearError,
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
    fetchInitialData();
  }, [fetchInitialData]);

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

  // Handle try again for errors
  const handleTryAgain = () => {
    if (!isClient) return;
    fetchInitialData();
  };

  // Format candidate data for display
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

  // Component: Search Results
  const SearchResults = () => {
    if (!searchResults || !isClient) return null;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-black">
            Search Results
            {searchResults.total !== undefined && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({searchResults.total} found)
              </span>
            )}
          </h2>
          <button
            onClick={handleClearSearch}
            className="text-sm text-blue-400 hover:text-blue-300"
            type="button"
          >
            Clear Search
          </button>
        </div>

        {searchLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-400">Searching...</span>
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
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>No candidates found matching your search</p>
          </div>
        )}
      </div>
    );
  };

  // Don't render interactive elements during SSR
  if (!isClient) {
    return (
      <MainLayout className="bg-gray-900 text-black">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <span className="ml-3 text-gray-400">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error component
  if (error) {
    return (
      <MainLayout className="bg-gray-900 text-black">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={handleTryAgain}
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
    <MainLayout className="bg-gray-900 text-black">
      {/* Temporarily commented out GlobalSearch to fix build */}
      {/*
      <GlobalSearch
        placeholder="Search by name, office, party..."
        showLocationFilter={true}
        showAdvancedFilters={true}
        onSearch={handleSearch}
        variant="hero"
        className="bg-white border-b border-gray-200 custom-global-search"
        initialQuery={searchQuery}
        initialFilters={searchFilters}
        filterOptions={{
          counties: filterOptions?.counties || [],
          constituencies: filterOptions?.constituencies || [],
          parties: filterOptions?.parties || [],
        }}
      />
      */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <span className="ml-3 text-gray-400">Loading...</span>
          </div>
        ) : searchResults ? (
          <SearchResults />
        ) : (
          <>
            <Hero />
            <InformedVoting />
            <CandidatesToWatch />
            <GetElectionReady />
          </>
        )}
      </div>
    </MainLayout>
  );
}