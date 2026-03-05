import { useState, useEffect, useCallback } from 'react';
import candidatesService from '@/services/candidates.service';
import { BaseCandidate, CandidateSummary, RiskLevel } from '@/types/api';

interface SearchFilters {
    risk_level?: RiskLevel;
    min_integrity_score?: number;
    max_integrity_score?: number;
    min_total_spend?: number;
    max_total_spend?: number;
    search?: string;
}

interface SearchResults {
    data: BaseCandidate[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
}

interface UseCandidatesState {
    candidates: BaseCandidate[];
    candidateDetails: CandidateSummary | null;
    searchResults: SearchResults | null;
    loading: boolean;
    searchLoading: boolean;
    error: string | null;
}

interface UseCandidatesReturn extends UseCandidatesState {
    fetchCandidates: () => Promise<void>;
    searchCandidates: (query: string, filters?: SearchFilters) => Promise<void>;
    getCandidateDetails: (id: number) => Promise<void>;
    clearSearch: () => void;
    clearError: () => void;
}

export const useCandidates = (): UseCandidatesReturn => {
    const [state, setState] = useState<UseCandidatesState>({
        candidates: [],
        candidateDetails: null,
        searchResults: null,
        loading: false,
        searchLoading: false,
        error: null,
    });

    // Update specific state properties
    const updateState = useCallback((updates: Partial<UseCandidatesState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    // Fetch all candidates
    const fetchCandidates = useCallback(async () => {
        try {
            updateState({ loading: true, error: null });

            const response = await candidatesService.getAllCandidates();

            if (response.success && response.data) {
                updateState({
                    candidates: response.data,
                });
            } else {
                updateState({ error: response.message || 'Failed to fetch candidates' });
            }
        } catch (err) {
            console.error('Error fetching candidates:', err);
            updateState({ error: 'An unexpected error occurred while fetching candidates' });
        } finally {
            updateState({ loading: false });
        }
    }, [updateState]);

    // Search candidates
    const searchCandidates = useCallback(async (query: string, filters: SearchFilters = {}) => {
        try {
            updateState({ searchLoading: true, error: null });

            // For now, we'll filter the existing candidates locally
            // In a real implementation, this would call a search endpoint
            const response = await candidatesService.getAllCandidates();

            if (response.success && response.data) {
                let filteredCandidates = response.data;

                // Apply search query
                if (query.trim()) {
                    filteredCandidates = filteredCandidates.filter(candidate =>
                        candidate.name.toLowerCase().includes(query.toLowerCase())
                    );
                }

                // Apply filters
                if (filters.risk_level) {
                    filteredCandidates = filteredCandidates.filter(candidate =>
                        candidate.risk_level === filters.risk_level
                    );
                }

                if (filters.min_integrity_score !== undefined) {
                    filteredCandidates = filteredCandidates.filter(candidate =>
                        candidate.integrity_score >= filters.min_integrity_score!
                    );
                }

                if (filters.max_integrity_score !== undefined) {
                    filteredCandidates = filteredCandidates.filter(candidate =>
                        candidate.integrity_score <= filters.max_integrity_score!
                    );
                }

                if (filters.min_total_spend !== undefined) {
                    filteredCandidates = filteredCandidates.filter(candidate =>
                        candidate.total_spend >= filters.min_total_spend!
                    );
                }

                if (filters.max_total_spend !== undefined) {
                    filteredCandidates = filteredCandidates.filter(candidate =>
                        candidate.total_spend <= filters.max_total_spend!
                    );
                }

                const searchResults: SearchResults = {
                    data: filteredCandidates,
                    total: filteredCandidates.length,
                    current_page: 1,
                    last_page: 1,
                    per_page: filteredCandidates.length,
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

    // Get candidate details
    const getCandidateDetails = useCallback(async (id: number) => {
        try {
            updateState({ loading: true, error: null });

            const response = await candidatesService.getCandidateSummary(id);

            if (response.success && response.data) {
                updateState({
                    candidateDetails: response.data,
                });
            } else {
                updateState({ error: response.message || 'Failed to fetch candidate details' });
            }
        } catch (err) {
            console.error('Error fetching candidate details:', err);
            updateState({ error: 'Failed to fetch candidate details' });
        } finally {
            updateState({ loading: false });
        }
    }, [updateState]);

    // Clear search results
    const clearSearch = useCallback(() => {
        updateState({ searchResults: null, searchLoading: false, error: null });
    }, [updateState]);

    // Clear error
    const clearError = useCallback(() => {
        updateState({ error: null });
    }, [updateState]);

    return {
        ...state,
        fetchCandidates,
        searchCandidates,
        getCandidateDetails,
        clearSearch,
        clearError,
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

export default useCandidates;