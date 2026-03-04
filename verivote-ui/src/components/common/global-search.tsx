"use client";
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Search, MapPin, X, Filter } from 'lucide-react';

interface SearchComponentProps {
    placeholder?: string;
    showLocationFilter?: boolean;
    showAdvancedFilters?: boolean;
    onSearch?: (query: string, filters?: SearchFilters) => void;
    onLocationChange?: (location: string) => void;
    className?: string;
    variant?: 'default' | 'compact' | 'hero';
    initialQuery?: string;
    initialFilters?: SearchFilters;
    filterOptions?: any;
    // filterOptions?: {
    //     counties?: Array<{ id: string; county: string; county_code: string }>;
    //     constituencies?: Array<{ id: string; constituency: string; constituency_code: string }>;
    //     parties?: Array<{ id: string; party_name: string; party_code: string }>;
    // };
}

interface SearchFilters {
    position?: string;
    county_id?: string;
    constituency_id?: string;
    party_id?: string;
    gender?: string;
    location?: string;
    category?: string;
    electionType?: string;
}

interface SearchSuggestion {
    id: string;
    text: string;
    type: 'candidate' | 'position' | 'party' | 'location';
    category?: string;
    value?: string;
}

const GlobalSearch: React.FC<SearchComponentProps> = ({
    placeholder = "Search by candidate, party, or position...",
    showLocationFilter = true,
    showAdvancedFilters = false,
    onSearch,
    onLocationChange,
    className = "",
    variant = 'default',
    initialQuery = '',
    initialFilters = {},
    filterOptions
}) => {
    const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [filters, setFilters] = useState<SearchFilters>(initialFilters);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Enhanced suggestions for candidate search - Move outside component to prevent recreation
    const mockSuggestions: SearchSuggestion[] = useMemo(() => [
        // Position suggestions
        { id: 'pos1', text: 'Presidential Candidates', type: 'position', value: 'president' },
        { id: 'pos2', text: 'Governors', type: 'position', value: 'governor' },
        { id: 'pos3', text: 'Senators', type: 'position', value: 'senator' },
        { id: 'pos4', text: 'Members of Parliament', type: 'position', value: 'mp' },
        { id: 'pos5', text: 'MCAs', type: 'position', value: 'mca' },
        { id: 'pos6', text: 'Women Representatives', type: 'position', value: 'women_rep' },

        // Party suggestions (these would typically come from your API)
        { id: 'party1', text: 'Jubilee Party', type: 'party', value: 'jubilee' },
        { id: 'party2', text: 'ODM', type: 'party', value: 'odm' },
        { id: 'party3', text: 'UDA', type: 'party', value: 'uda' },
        { id: 'party4', text: 'Wiper', type: 'party', value: 'wiper' },

        // Location suggestions
        { id: 'loc1', text: 'Nairobi County', type: 'location', value: 'nairobi' },
        { id: 'loc2', text: 'Mombasa County', type: 'location', value: 'mombasa' },
        { id: 'loc3', text: 'Kisumu County', type: 'location', value: 'kisumu' },
        { id: 'loc4', text: 'Nakuru County', type: 'location', value: 'nakuru' },
    ], []);

    // Handle search input changes with debouncing
    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);

        if (value.length > 1) {
            // Filter suggestions based on input
            const filtered = mockSuggestions.filter(
                suggestion =>
                    suggestion.text.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 6)); // Limit to 6 suggestions
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    }, [mockSuggestions]);

    // Handle search submission
    const handleSearch = useCallback(async () => {
        if (searchQuery.trim() || Object.keys(filters).some(key => filters[key as keyof SearchFilters])) {
            setIsSearching(true);

            try {
                // Prepare search filters
                const searchFilters: SearchFilters = {
                    ...filters
                };

                // Call the search function
                if (onSearch) {
                    await onSearch(searchQuery.trim(), searchFilters);
                }
                setShowSuggestions(false);
            } finally {
                setIsSearching(false);
            }
        }
    }, [searchQuery, filters, onSearch]);

    // Handle suggestion selection
    const handleSuggestionSelect = useCallback(async (suggestion: SearchSuggestion) => {
        setIsSearching(true);

        try {
            let searchFilters: SearchFilters = { ...filters };
            let queryText = '';

            // Handle different suggestion types
            switch (suggestion.type) {
                case 'position':
                    searchFilters.position = suggestion.value;
                    queryText = ''; // Clear query for position filter
                    break;
                case 'party':
                    searchFilters.party_id = suggestion.value;
                    queryText = suggestion.text;
                    break;
                case 'location':
                    searchFilters.county_id = suggestion.value;
                    queryText = '';
                    break;
                case 'candidate':
                default:
                    queryText = suggestion.text;
                    break;
            }

            setSearchQuery(queryText);
            setFilters(searchFilters);
            setShowSuggestions(false);

            if (onSearch) {
                await onSearch(queryText, searchFilters);
            }
        } finally {
            setIsSearching(false);
        }
    }, [filters, onSearch]);

    // Clear search and filters
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setFilters({});
        setShowSuggestions(false);
        if (onSearch) {
            onSearch('', {});
        }
    }, [onSearch]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    }, [handleSearch]);

    // Update component when external props change
    useEffect(() => {
        if (initialQuery !== searchQuery) {
            setSearchQuery(initialQuery);
        }
    }, [initialQuery]);

    useEffect(() => {
        if (JSON.stringify(initialFilters) !== JSON.stringify(filters)) {
            setFilters(initialFilters);
        }
    }, [initialFilters]);

    const SuggestionItem: React.FC<{ suggestion: SearchSuggestion }> = ({ suggestion }) => {
        const getTypeIcon = () => {
            switch (suggestion.type) {
                case 'candidate': return '👤';
                case 'position': return '🏛️';
                case 'party': return '🏢';
                case 'location': return '📍';
                default: return '🔍';
            }
        };

        const getTypeLabel = () => {
            switch (suggestion.type) {
                case 'candidate': return 'Candidate';
                case 'position': return 'Position';
                case 'party': return 'Party';
                case 'location': return 'Location';
                default: return 'Search';
            }
        };

        return (
            <button
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-colors"
                onClick={() => handleSuggestionSelect(suggestion)}
            >
                <span className="text-lg">{getTypeIcon()}</span>
                <div className="flex-1">
                    <div className="font-medium text-gray-900">{suggestion.text}</div>
                    {suggestion.category && (
                        <div className="text-sm text-gray-500">{suggestion.category}</div>
                    )}
                </div>
                <span className="text-xs text-gray-400 capitalize">{getTypeLabel()}</span>
            </button>
        );
    };

    // Handle filter changes with auto-apply
    const handleFilterChange = useCallback((filterKey: keyof SearchFilters, value: string) => {
        const newFilters = {
            ...filters,
            [filterKey]: value || undefined
        };

        // Remove undefined values
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key as keyof SearchFilters] === undefined) {
                delete newFilters[key as keyof SearchFilters];
            }
        });

        setFilters(newFilters);

        // Auto-apply filter
        if (onSearch) {
            onSearch(searchQuery, newFilters);
        }
    }, [filters, searchQuery, onSearch]);

    return (
        <div className={`bg-transparent py-4 ${className}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={searchRef} className="relative">
                    <div className="flex items-center space-x-3">
                        {/* Main Search Input */}
                        <div className="flex-1 relative">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 ${isSearching ? 'animate-pulse' : ''}`} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={placeholder}
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isSearching}
                                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                aria-label="Search for candidates, parties, or positions"
                            />

                            {/* Clear button */}
                            {(searchQuery || Object.keys(filters).length > 0) && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                            {/* Search Suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-lg shadow-xl z-50 mt-1 max-h-80 overflow-y-auto">
                                    <div className="py-2">
                                        {suggestions.map((suggestion) => (
                                            <SuggestionItem key={suggestion.id} suggestion={suggestion} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isSearching ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    <span>Search</span>
                                </>
                            )}
                        </button>

                        {/* Filter Button */}
                        {showAdvancedFilters && (
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-2.5 rounded-full font-medium transition-colors duration-200 flex items-center space-x-2 ${showFilters || Object.keys(filters).length > 0
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                                {Object.keys(filters).length > 0 && (
                                    <span className="bg-white text-green-600 rounded-full px-2 py-1 text-xs font-bold">
                                        {Object.keys(filters).length}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Advanced Filters Panel */}
                    {showAdvancedFilters && showFilters && (
                        <div className="mt-4 p-4 bg-white/90 backdrop-blur-md rounded-lg border border-gray-200/50 shadow-lg">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Position Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Position
                                    </label>
                                    <select
                                        value={filters.position || ''}
                                        onChange={(e) => handleFilterChange('position', e.target.value)}
                                        className="w-full px-3 py-2 bg-white/90 border border-gray-300/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                                    >
                                        <option value="">All Positions</option>
                                        <option value="president">President</option>
                                        <option value="governor">Governor</option>
                                        <option value="senator">Senator</option>
                                        <option value="mp">MP</option>
                                        <option value="mca">MCA</option>
                                        <option value="women_rep">Women Rep</option>
                                    </select>
                                </div>

                                {/* Party Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Party
                                    </label>
                                    <select
                                        value={filters.party_id || ''}
                                        onChange={(e) => handleFilterChange('party_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-white/90 border border-gray-300/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                                    >
                                        <option value="">All Parties</option>
                                        {filterOptions?.parties?.map((party: any) => (
                                            <option key={party.id} value={party.id}>
                                                {party.party_name} ({party.party_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* County Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        County
                                    </label>
                                    <select
                                        value={filters.county_id || ''}
                                        onChange={(e) => handleFilterChange('county_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-white/90 border border-gray-300/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                                    >
                                        <option value="">All Counties</option>
                                        {filterOptions?.counties?.map((county: any) => (
                                            <option key={county.county_code || county.id} value={county.county_code || county.id}>
                                                {county.county}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Gender Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={filters.gender || ''}
                                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                                        className="w-full px-3 py-2 bg-white/90 border border-gray-300/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                                    >
                                        <option value="">All Genders</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="md:col-span-4 flex items-end justify-end space-x-2">
                                    <button
                                        onClick={() => {
                                            setFilters({});
                                            // Trigger search with cleared filters
                                            if (onSearch) {
                                                onSearch(searchQuery, {});
                                            }
                                        }}
                                        className="px-4 py-2 text-sm text-gray-600 bg-white/90 border border-gray-300/50 rounded-md hover:bg-white hover:border-gray-300 backdrop-blur-sm transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Apply current filters
                                            handleSearch();
                                        }}
                                        disabled={isSearching}
                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 backdrop-blur-sm transition-colors disabled:opacity-50"
                                    >
                                        {isSearching ? 'Applying...' : 'Apply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Filters Display */}
                    {Object.keys(filters).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(filters).map(([key, value]) => {
                                if (!value) return null;

                                const getFilterLabel = (filterKey: string, filterValue: string) => {
                                    switch (filterKey) {
                                        case 'position':
                                            const positionLabels: { [key: string]: string } = {
                                                'president': 'President',
                                                'governor': 'Governor',
                                                'senator': 'Senator',
                                                'mp': 'MP',
                                                'mca': 'MCA',
                                                'women_rep': 'Women Rep'
                                            };
                                            return positionLabels[filterValue] || filterValue;
                                        case 'gender':
                                            return filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
                                        case 'county_id':
                                            // Find county name from filterOptions
                                            const county = filterOptions?.counties?.find((c: any) => c.county_code === filterValue || c.id === filterValue);
                                            return county ? county.county : `County: ${filterValue}`;
                                        case 'party_id':
                                            // Find party name from filterOptions
                                            const party = filterOptions?.parties?.find((p: any) => p.id === filterValue);
                                            return party ? party.party_name : `Party: ${filterValue}`;
                                        default:
                                            return filterValue;
                                    }
                                };

                                return (
                                    <span
                                        key={key}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                        {getFilterLabel(key, value)}
                                        <button
                                            onClick={() => handleFilterChange(key as keyof SearchFilters, '')}
                                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;