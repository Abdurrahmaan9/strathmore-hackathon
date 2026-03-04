import { useState, useEffect, useCallback } from 'react';
import candidatesService from '@/services/candidates.service';
import {
    Candidate,
    CandidatesData,
    FilterOptions,
    SearchParams,
    ApiResponse,
    ActiveCategory,
    CandidateStatistics
} from '@/types/candidate.types';

interface SearchFilters {
    position?: string;
    county_id?: string;
    constituency_id?: string;
    party_id?: string;
    gender?: string;
    query?: string;
}

interface ComparisonFilters {
    position?: string;
    county_id?: string;
    party_id?: string;
    search?: string;
}

interface SearchResults {
    data: Candidate[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    pagination?: any;
}

interface ComparisonCandidate {
    id: string;
    slug: string;
    name: string;
    position: string;
    party: string;
    party_code: string;
    county: string;
    image: string;
}

interface ComparisonData {
    candidate1: any;
    candidate2: any;
    comparison: any;
}

interface UseCandidatesState {
    candidatesData: CandidatesData;
    searchResults: SearchResults | null;
    filterOptions: FilterOptions;
    loading: boolean;
    searchLoading: boolean;
    error: string | null;
    categoryLoading: Record<string, boolean>;
    statistics: CandidateStatistics | null;

    // Comparison specific state
    comparisonCandidates: ComparisonCandidate[];
    comparisonData: ComparisonData | null;
    comparisonLoading: boolean;
    comparisonError: string | null;
}

interface UseCandidatesReturn extends UseCandidatesState {
    // Data fetching methods
    fetchInitialData: () => Promise<void>;
    searchCandidates: (query: string, filters?: SearchFilters) => Promise<void>;
    getCandidatesByCategory: (category: ActiveCategory, params?: SearchParams) => Promise<void>;
    loadMoreCandidates: (category: string) => Promise<void>;
    getCandidateDetails: (slug: string) => Promise<any>;
    getStatistics: () => Promise<void>;

    // Comparison methods
    loadCandidatesForComparison: (filters?: ComparisonFilters) => Promise<void>;
    compareCandidates: (candidate1Slug: string, candidate2Slug: string) => Promise<void>;
    clearComparison: () => void;

    // UI state management
    clearSearch: () => void;
    clearError: () => void;
    resetData: () => void;
}

export const useCandidates = (): UseCandidatesReturn => {
    const [state, setState] = useState<any>({
        candidatesData: {
            presidential: [],
            governors: [],
            senators: [],
            mps: [],
            mcas: [],
            women_reps: []
        },
        searchResults: null,
        filterOptions: {
            counties: [],
            constituencies: [],
            parties: []
        },
        loading: false,
        searchLoading: false,
        error: null,
        categoryLoading: {},
        statistics: null,

        // Comparison state
        comparisonCandidates: [],
        comparisonData: null,
        comparisonLoading: false,
        comparisonError: null
    });

    // Update specific state properties
    const updateState = useCallback((updates: Partial<UseCandidatesState>) => {
        setState((prev: any) => ({ ...prev, ...updates }));
    }, []);

    // Fetch initial candidates data
    const fetchInitialData = useCallback(async () => {
        try {
            updateState({ loading: true, error: null });

            const response = await candidatesService.getAllCandidates();

            if (response.success) {
                updateState({
                    candidatesData: response.data?.candidates || {
                        presidential: [],
                        governors: [],
                        senators: [],
                        mps: [],
                        mcas: [],
                        women_reps: []
                    },
                    filterOptions: response.data?.filters || {
                        counties: [],
                        constituencies: [],
                        parties: []
                    }
                });
            } else {
                updateState({ error: response.message || 'Failed to fetch candidates' });
            }
        } catch (err) {
            console.error('Error fetching initial data:', err);
            updateState({ error: 'An unexpected error occurred while fetching candidates' });
        } finally {
            updateState({ loading: false });
        }
    }, [updateState]);

    // Search candidates - Updated to match the interface
    const searchCandidates = useCallback(async (query: string, filters: SearchFilters = {}) => {
        try {
            updateState({ searchLoading: true, error: null });

            // Prepare search parameters
            const searchParams: any = {
                query: query.trim(),
                ...filters,
                per_page: 12
            };

            const response = await candidatesService.searchCandidates(searchParams);

            if (response.success) {
                // Transform the response to match our SearchResults interface
                const searchResults: SearchResults = {
                    data: response.data?.data || response.data || [],
                    total: response.data?.pagination?.total || response.data?.total || 0,
                    current_page: response.data?.pagination?.current_page || response.data?.current_page || 1,
                    last_page: response.data?.pagination?.last_page || response.data?.last_page || 1,
                    per_page: response.data?.pagination?.per_page || response.data?.per_page || 12,
                    pagination: response.data?.pagination
                };

                updateState({ searchResults });
            } else {
                updateState({
                    error: response.message || 'Search failed',
                    searchResults: null
                });
            }
        } catch (err) {
            console.error('Error searching candidates:', err);
            updateState({
                error: 'Search failed due to an unexpected error',
                searchResults: null
            });
        } finally {
            updateState({ searchLoading: false });
        }
    }, [updateState]);

    // Get candidates by category
    const getCandidatesByCategory = useCallback(async (category: ActiveCategory, params: SearchParams = {}) => {
        try {
            updateState({
                categoryLoading: { ...state.categoryLoading, [category]: true },
                error: null
            });

            const response = await candidatesService.getCandidatesByCategory(category, params);

            if (response.success) {
                updateState({
                    candidatesData: {
                        ...state.candidatesData,
                        [category]: response.data?.data || response.data || []
                    }
                });
            } else {
                updateState({ error: response.message || `Failed to fetch ${category} candidates` });
            }
        } catch (err) {
            console.error(`Error fetching ${category} candidates:`, err);
            updateState({ error: `Failed to fetch ${category} candidates` });
        } finally {
            updateState({
                categoryLoading: { ...state.categoryLoading, [category]: false }
            });
        }
    }, [updateState, state.candidatesData, state.categoryLoading]);

    // Load more candidates for a category
    const loadMoreCandidates = useCallback(async (category: string) => {
        try {
            updateState({
                categoryLoading: { ...state.categoryLoading, [category]: true },
                error: null
            });

            const response = await candidatesService.getCandidatesByCategory(
                category as ActiveCategory,
                { per_page: 100 }
            );

            if (response.success) {
                updateState({
                    candidatesData: {
                        ...state.candidatesData,
                        [category]: response.data?.data || response.data || []
                    }
                });
            } else {
                updateState({ error: response.message || `Failed to load more ${category} candidates` });
            }
        } catch (err) {
            console.error(`Error loading more ${category} candidates:`, err);
            updateState({ error: `Failed to load more ${category} candidates` });
        } finally {
            updateState({
                categoryLoading: { ...state.categoryLoading, [category]: false }
            });
        }
    }, [updateState, state.candidatesData, state.categoryLoading]);

    // Get candidate details
    const getCandidateDetails = useCallback(async (slug: string) => {
        try {
            const response = await candidatesService.getCandidateDetails(slug);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch candidate details');
            }
        } catch (err) {
            console.error('Error fetching candidate details:', err);
            throw err;
        }
    }, []);

    // Get statistics
    const getStatistics = useCallback(async () => {
        try {
            const response = await candidatesService.getCandidatesStatistics();

            if (response.success) {
                updateState({ statistics: response.data });
            } else {
                console.error('Failed to fetch statistics:', response.message);
            }
        } catch (err) {
            console.error('Error fetching statistics:', err);
        }
    }, [updateState]);

    // Load candidates for comparison with filters
    const loadCandidatesForComparison = useCallback(async (filters: ComparisonFilters = {}) => {
        try {
            updateState({ comparisonLoading: true, comparisonError: null });

            const response = await candidatesService.getCandidatesForComparison(filters);

            if (response.success) {
                updateState({
                    comparisonCandidates: response.data || [],
                    comparisonLoading: false
                });
            } else {
                updateState({
                    comparisonError: response.message || 'Failed to load candidates for comparison',
                    comparisonLoading: false
                });
            }
        } catch (err) {
            console.error('Error loading candidates for comparison:', err);
            updateState({
                comparisonError: 'Failed to load candidates for comparison',
                comparisonLoading: false
            });
        }
    }, [updateState]);

    // Compare two candidates
    const compareCandidates = useCallback(async (candidate1Slug: string, candidate2Slug: string) => {
        try {
            updateState({ comparisonLoading: true, comparisonError: null });

            const response = await candidatesService.compareCandidates({
                candidate1_slug: candidate1Slug,
                candidate2_slug: candidate2Slug
            });

            if (response.success) {
                updateState({
                    comparisonData: response.data,
                    comparisonLoading: false
                });
            } else {
                updateState({
                    comparisonError: response.message || 'Failed to compare candidates',
                    comparisonLoading: false
                });
            }
        } catch (err) {
            console.error('Error comparing candidates:', err);
            updateState({
                comparisonError: 'Failed to compare candidates',
                comparisonLoading: false
            });
        }
    }, [updateState]);

    // Clear comparison data
    const clearComparison = useCallback(() => {
        updateState({
            comparisonData: null,
            comparisonError: null,
            comparisonLoading: false
        });
    }, [updateState]);

    // Clear search results
    const clearSearch = useCallback(() => {
        updateState({ searchResults: null, searchLoading: false, error: null });
    }, [updateState]);

    // Clear error
    const clearError = useCallback(() => {
        updateState({ error: null, comparisonError: null });
    }, [updateState]);

    // Reset all data
    const resetData = useCallback(() => {
        setState({
            candidatesData: {
                presidential: [],
                governors: [],
                senators: [],
                mps: [],
                mcas: [],
                women_reps: []
            },
            searchResults: null,
            filterOptions: {
                counties: [],
                constituencies: [],
                parties: []
            },
            loading: false,
            searchLoading: false,
            error: null,
            categoryLoading: {},
            statistics: null,

            // Reset comparison state
            comparisonCandidates: [],
            comparisonData: null,
            comparisonLoading: false,
            comparisonError: null
        });
    }, []);

    return {
        ...state,
        fetchInitialData,
        searchCandidates,
        getCandidatesByCategory,
        loadMoreCandidates,
        getCandidateDetails,
        getStatistics,
        loadCandidatesForComparison,
        compareCandidates,
        clearComparison,
        clearSearch,
        clearError,
        resetData
    };
};

// Custom hook for debounced search
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Simplified search hook for manual search triggers
export const useCandidateSearch = () => {
    const [query, setQuery] = useState<string>('');
    const [filters, setFilters] = useState<SearchFilters>({});

    const clearFilters = useCallback(() => {
        setFilters({});
    }, []);

    const clearQuery = useCallback(() => {
        setQuery('');
    }, []);

    const clearAll = useCallback(() => {
        setQuery('');
        setFilters({});
    }, []);

    return {
        query,
        setQuery,
        filters,
        setFilters,
        clearFilters,
        clearQuery,
        clearAll
    };
};

// Hook specifically for candidate comparison
export const useCandidateComparison = () => {
    const [selectedCandidates, setSelectedCandidates] = useState<[string | null, string | null]>([null, null]);
    const [comparisonFilters, setComparisonFilters] = useState<ComparisonFilters>({});

    const selectCandidate = useCallback((index: 0 | 1, candidateSlug: string | null) => {
        setSelectedCandidates(prev => {
            const newSelection: [string | null, string | null] = [...prev];
            newSelection[index] = candidateSlug;
            return newSelection;
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedCandidates([null, null]);
    }, []);

    const canCompare = selectedCandidates[0] && selectedCandidates[1];

    return {
        selectedCandidates,
        selectCandidate,
        clearSelection,
        canCompare,
        comparisonFilters,
        setComparisonFilters
    };
};

export default useCandidates;