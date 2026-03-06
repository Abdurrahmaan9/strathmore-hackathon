// "use client";
// import React, { useState, useEffect } from 'react';
// import { Menu, Loader2, AlertCircle } from 'lucide-react';
// import MainLayout from '@/components/layouts/main-layout';
// import { Breadcrumb } from '@/components/common/breadcrumb';
// import GlobalSearch from '@/components/common/global-search';
// import { CategoryConfig, Candidate } from '@/types/candidate.types';
// import { BaseCandidate } from '@/types/api';

// // Extend ActiveCategory type to include 'all'
// type ActiveCategory = 'all' | 'presidential' | 'governors' | 'senators' | 'mps' | 'mcas' | 'women_reps';
// import useCandidates, { useCandidateSearch } from '@/hooks/use-candidates';
// import CandidateCard from '@/components/sections/candidates/candidate-card';

// const CandidatesPage: React.FC = () => {
//     const [isClient, setIsClient] = useState(false);

//     // Custom hooks for candidates data and search
//     const {
//         candidates,
//         searchResults,
//         loading,
//         searchLoading,
//         error,
//         fetchCandidates,
//         searchCandidates,
//         clearSearch,
//         clearError
//     } = useCandidates();

//     const {
//         query: searchQuery,
//         setQuery: setSearchQuery,
//         filters: searchFilters,
//         setFilters: setSearchFilters
//     } = useCandidateSearch();

//     // Local state
//     const [activeCategory, setActiveCategory] = useState<ActiveCategory>('all'); // Changed to 'all' by default
//     const [showAllCandidates, setShowAllCandidates] = useState<{ [key: string]: boolean }>({});
//     const [selectedCounty, setSelectedCounty] = useState<string>('');
//     const [selectedConstituency, setSelectedConstituency] = useState<string>('');

//     // Category configurations - Added 'All' option
//     const categories: CategoryConfig[] = [
//         {
//             id: 'all',
//             title: 'All Candidates',
//             key: 'all',
//             color: 'bg-purple-500',
//             filterType: 'none',
//             filterLabel: ''
//         },
//         {
//             id: 'presidential',
//             title: 'Presidential Candidates',
//             key: 'presidential',
//             color: 'bg-gray-500',
//             filterType: 'location',
//             filterLabel: 'All Regions'
//         },
//         {
//             id: 'governors',
//             title: 'Gubernatorial Candidates',
//             key: 'governors',
//             color: 'bg-blue-500',
//             filterType: 'location',
//             filterLabel: 'Select County'
//         },
//         {
//             id: 'senators',
//             title: 'Senatorial Candidates',
//             key: 'senators',
//             color: 'bg-yellow-500',
//             filterType: 'location',
//             filterLabel: 'Select County'
//         },
//         {
//             id: 'mps',
//             title: 'Members of Parliament',
//             key: 'mps',
//             color: 'bg-green-500',
//             filterType: 'constituency',
//             filterLabel: 'Select Constituency'
//         },
//         {
//             id: 'mcas',
//             title: 'MCAs',
//             key: 'mcas',
//             color: 'bg-orange-200',
//             filterType: 'constituency',
//             filterLabel: 'Select Constituency'
//         },
//         {
//             id: 'women_reps',
//             title: 'Women Representatives',
//             key: 'women_reps',
//             color: 'bg-pink-300',
//             filterType: 'location',
//             filterLabel: 'Select County'
//         }
//     ];

//     // Set client-side flag and load initial data
//     useEffect(() => {
//         setIsClient(true);
//         fetchCandidates();
//     }, [fetchCandidates]);

//     // Handle search from GlobalSearch component
//     const handleSearch = async (query: string, filters?: any) => {
//         if (!isClient) return;
//         setSearchQuery(query);

//         // Combine search filters with current category filter
//         const combinedFilters = {
//             ...filters,
//             // If a specific category is active, add it to search filters
//             ...(activeCategory !== 'all' && { position: mapCategoryToPosition(activeCategory) }),
//             // Add location filters if selected
//             ...(selectedCounty && { county_id: selectedCounty }),
//             ...(selectedConstituency && { constituency_id: selectedConstituency })
//         };

//         setSearchFilters(combinedFilters);

//         // Call the search function from the hook
//         await searchCandidates(query, combinedFilters);
//     };

//     // Handle category button click - NEW IMPLEMENTATION
//     const handleCategoryClick = async (categoryId: ActiveCategory) => {
//         if (!isClient) return;
//         setActiveCategory(categoryId);

//         // Clear previous search when changing categories
//         clearSearch();
//         setSearchQuery('');

//         // If searching for a specific category, trigger search with position filter
//         if (categoryId !== 'all') {
//             const position = mapCategoryToPosition(categoryId);
//             if (position) {
//                 // Update the search filters to reflect the category change
//                 const newFilters = { position };
//                 setSearchFilters(newFilters);
//                 await searchCandidates('', newFilters);
//             }
//         } else {
//             // Clear filters when selecting 'All'
//             setSearchFilters({});
//         }
//     };

//     // Handle location filter changes
//     const handleCountyChange = async (countyId: string) => {
//         if (!isClient) return;
//         setSelectedCounty(countyId);
//         // Re-trigger search with new county filter
//         if (searchQuery || activeCategory !== 'all') {
//             const position = mapCategoryToPosition(activeCategory);
//             await searchCandidates(searchQuery, {
//                 county_id: countyId,
//                 ...(activeCategory !== 'all' && position ? { position } : {})
//             });
//         }
//     };

//     const handleConstituencyChange = async (constituencyId: string) => {
//         if (!isClient) return;
//         setSelectedConstituency(constituencyId);
//         // Re-trigger search with new constituency filter
//         const position = mapCategoryToPosition(activeCategory);
//         await searchCandidates(searchQuery, {
//             constituency_id: constituencyId,
//             ...(activeCategory !== 'all' && position ? { position } : {})
//         });
//     };

//     // Toggle show all candidates for a category
//     const toggleShowAll = (categoryKey: string) => {
//         if (!isClient) return;
//         const isCurrentlyShowingAll = showAllCandidates[categoryKey];

//         setShowAllCandidates(prev => ({
//             ...prev,
//             [categoryKey]: !isCurrentlyShowingAll
//         }));
//     };

//     // Handle clear search
//     const handleClearSearch = () => {
//         if (!isClient) return;
//         setSearchQuery('');
//         clearSearch();
//         setActiveCategory('all'); // Reset to show all categories
//     };

//     // Handle try again
//     const handleTryAgain = () => {
//         if (!isClient) return;
//         fetchCandidates();
//     };

//     // Helper function to filter candidates by position
//     const getCandidatesByPosition = (position: string): BaseCandidate[] => {
//         return candidates.filter(candidate => 
//             candidate.position?.toLowerCase() === position.toLowerCase()
//         );
//     };

//     // Get displayed candidates based on show all state and active category
//     const getDisplayedCandidates = (categoryKey: string, candidates: BaseCandidate[]) => {
//         // If a specific category is active and it's not the current category, don't show
//         if (activeCategory !== 'all' && activeCategory !== categoryKey) {
//             return [];
//         }

//         const showAll = showAllCandidates[categoryKey];
//         return showAll ? candidates : candidates.slice(0, 4);
//     };

//     // Map frontend category names to database position values
//     const mapCategoryToPosition = (category: string): string | null => {
//         const mapping: { [key: string]: string } = {
//             'presidential': 'president',
//             'governors': 'governor',
//             'senators': 'senator',
//             'mps': 'mp',
//             'mcas': 'mca',
//             'women_reps': 'women_rep',
//         };
//         return mapping[category] || null;
//     };

//     // Helper function to format candidate data for display
//     const formatCandidateForDisplay = (candidate: BaseCandidate): Candidate => {
//         return {
//             ...candidate,
//             id: candidate.id.toString(),
//             first_name: candidate.name.split(' ')[0] || '',
//             last_name: candidate.name.split(' ').slice(1).join(' ') || '',
//             party: candidate.party || 'Independent',
//             partyAbbreviation: candidate.party?.substring(0, 3).toUpperCase() || 'IND',
//             location: candidate.constituency || '',
//             image: '/api/placeholder/150/150',
//             slug: candidate.id.toString()
//         };
//     };

//     // Component: Category Button
//     const CategoryButton: React.FC<{
//         category: CategoryConfig;
//         isActive: boolean;
//         onClick: () => void;
//     }> = ({ category, isActive, onClick }) => (
//         <button
//             onClick={onClick}
//             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
//                 ? `${category.color} text-black shadow-md transform scale-105`
//                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//             type="button"
//         >
//             {category.title.includes('Candidates')
//                 ? category.title.replace(' Candidates', '')
//                 : category.title
//             }
//         </button>
//     );

//     // Component: Category Section with improved filtering
//     const CategorySection: React.FC<{
//         category: CategoryConfig;
//         candidates: BaseCandidate[];
//         showViewAll?: boolean;
//     }> = ({ category, candidates, showViewAll = true }) => {
//         const displayedCandidates = getDisplayedCandidates(category.key, candidates);

//         // Don't render if category is filtered out
//         if (activeCategory !== 'all' && activeCategory !== category.id) {
//             return null;
//         }

//         const hasMoreCandidates = candidates.length > 4;
//         const isShowingAll = showAllCandidates[category.key];
//         const isLoading = false; // Simplified since we don't have categoryLoading

//         return (
//             <section className="mb-8 md:mb-12">
//                 <div className="flex items-center justify-between mb-4 md:mb-6">
//                     <h2 className="text-xl md:text-2xl font-bold text-gray-900">
//                         {category.title}
//                         {candidates.length > 0 && (
//                             <span className="text-sm font-normal text-gray-500 ml-2">
//                                 ({candidates.length})
//                             </span>
//                         )}
//                     </h2>
//                     {isClient && category.filterType && category.filterType !== 'none' && (
//                         <div className="flex items-center space-x-2">
//                             <select
//                                 className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
//                                 value={category.filterType === 'location' ? selectedCounty : selectedConstituency}
//                                 onChange={(e) => {
//                                     if (category.filterType === 'location') {
//                                         handleCountyChange(e.target.value);
//                                     } else {
//                                         handleConstituencyChange(e.target.value);
//                                     }
//                                 }}
//                             >
//                                 <option value="">{category.filterLabel}</option>
//                                 {/* Placeholder for counties - would need to be implemented */}
//                                 <option value="" disabled>No counties available</option>
//                             </select>
//                             <button className="p-1.5 text-black hover:text-gray-900" type="button">
//                                 <Menu className="w-4 h-4" />
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 {isLoading ? (
//                     <div className="flex items-center justify-center py-8">
//                         <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
//                         <span className="ml-2 text-black">Loading candidates...</span>
//                     </div>
//                 ) : candidates.length === 0 ? (
//                     <div className="text-center py-8 text-gray-500">
//                         <AlertCircle className="w-8 h-8 mx-auto mb-2" />
//                         <p>No {category.title.toLowerCase()} found</p>
//                     </div>
//                 ) : (
//                     <>
//                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
//                             {displayedCandidates.map((candidate) => (
//                                 <CandidateCard
//                                     key={candidate.id}
//                                     candidate={formatCandidateForDisplay(candidate)}
//                                 />
//                             ))}
//                         </div>

//                         {isClient && hasMoreCandidates && showViewAll && (
//                             <div className="text-center mt-6">
//                                 <button
//                                     onClick={() => toggleShowAll(category.key)}
//                                     disabled={isLoading}
//                                     className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50"
//                                     type="button"
//                                 >
//                                     {isLoading ? (
//                                         <>
//                                             <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
//                                             Loading...
//                                         </>
//                                     ) : (
//                                         isShowingAll ? 'Show Less' : 'View All'
//                                     )}
//                                 </button>
//                             </div>
//                         )}
//                     </>
//                 )}
//             </section>
//         );
//     };

//     // Component: Search Results
//     const SearchResults: React.FC = () => {
//         if (!searchResults || !isClient) return null;

//         return (
//             <div className="mb-8">
//                 <div className="flex items-center justify-between mb-4">
//                     <h2 className="text-xl md:text-2xl font-bold text-gray-900">
//                         Search Results
//                         {searchResults.total !== undefined && (
//                             <span className="text-sm font-normal text-gray-500 ml-2">
//                                 ({searchResults.total} found)
//                             </span>
//                         )}
//                     </h2>
//                     <button
//                         onClick={handleClearSearch}
//                         className="text-sm text-blue-600 hover:text-blue-800"
//                         type="button"
//                     >
//                         Clear Search
//                     </button>
//                 </div>

//                 {searchLoading ? (
//                     <div className="flex items-center justify-center py-8">
//                         <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
//                         <span className="ml-2 text-black">Searching...</span>
//                     </div>
//                 ) : searchResults.data && searchResults.data.length > 0 ? (
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
//                         {searchResults.data.map((candidate: BaseCandidate) => (
//                             <CandidateCard
//                                 key={candidate.id}
//                                 candidate={formatCandidateForDisplay(candidate)}
//                             />
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-8 text-gray-500">
//                         <AlertCircle className="w-8 h-8 mx-auto mb-2" />
//                         <p>No candidates found matching your search</p>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     // Don't render interactive elements during SSR
//     if (!isClient) {
//         return (
//             <MainLayout>
//                 <div className="min-h-screen bg-gray-50">
//                     <Breadcrumb pageTitle='Candidates' />
//                     <div className="flex items-center justify-center py-16">
//                         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//                         <span className="ml-3 text-black">Loading candidates...</span>
//                     </div>
//                 </div>
//             </MainLayout>
//         );
//     }

//     // Error component
//     if (error) {
//         return (
//             <MainLayout>
//                 <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                     <div className="text-center">
//                         <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//                         <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
//                         <p className="text-black mb-4">{error}</p>
//                         <button
//                             onClick={handleTryAgain}
//                             className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700"
//                             type="button"
//                         >
//                             Try Again
//                         </button>
//                     </div>
//                 </div>
//             </MainLayout>
//         );
//     }

//     return (
//         <MainLayout>
//             <div className="min-h-screen bg-gray-50">
//                 {/* Breadcrumb */}
//                 <Breadcrumb pageTitle='Candidates' />

//                 {/* Global Search - Fixed with proper filter options */}
//                 <GlobalSearch
//                     placeholder="Search by name, office, party..."
//                     showLocationFilter={true}
//                     showAdvancedFilters={true}
//                     onSearch={handleSearch}
//                     variant="hero"
//                     className="bg-white border-b border-gray-200"
//                     initialQuery={searchQuery}
//                     initialFilters={searchFilters}
//                 />

//                 {/* Main Content */}
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
//                     {loading ? (
//                         <div className="flex items-center justify-center py-16">
//                             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//                             <span className="ml-3 text-black">Loading candidates...</span>
//                         </div>
//                     ) : (
//                         <>
//                             {/* Category Navigation Buttons - Only render after client hydration */}
//                             {isClient && (
//                                 <div className="mb-6 md:mb-8">
//                                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 md:gap-3">
//                                         {categories.map((category) => (
//                                             <CategoryButton
//                                                 key={category.id}
//                                                 category={category}
//                                                 isActive={activeCategory === category.id}
//                                                 onClick={() => handleCategoryClick(category.id as ActiveCategory)}
//                                             />
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Search Results or Categories Content */}
//                             {searchResults ? (
//                                 <SearchResults />
//                             ) : (
//                                 <div className="space-y-8 md:space-y-12">
//                                     {/* Presidential Candidates */}
//                                     <CategorySection
//                                         category={categories.find(c => c.id === 'presidential')!}
//                                         candidates={getCandidatesByPosition('president')}
//                                     />

//                                     {/* Gubernatorial Candidates */}
//                                     <CategorySection
//                                         category={categories.find(c => c.id === 'governors')!}
//                                         candidates={getCandidatesByPosition('governor')}
//                                     />

//                                     {/* Senatorial Candidates */}
//                                     <CategorySection
//                                         category={categories.find(c => c.id === 'senators')!}
//                                         candidates={getCandidatesByPosition('senator')}
//                                     />

//                                     {/* Women Representatives */}
//                                     <CategorySection
//                                         category={categories.find(c => c.id === 'women_reps')!}
//                                         candidates={getCandidatesByPosition('women_rep')}
//                                     />

//                                     {/* Members of Parliament */}
//                                     <CategorySection
//                                         category={categories.find(c => c.id === 'mps')!}
//                                         candidates={getCandidatesByPosition('mp')}
//                                     />

//                                     {/* MCAs Section */}
//                                     <CategorySection
//                                         category={categories.find(c => c.id === 'mcas')!}
//                                         candidates={getCandidatesByPosition('mca')}
//                                     />
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>
//             </div>
//         </MainLayout>
//     );
// };

// export default CandidatesPage;