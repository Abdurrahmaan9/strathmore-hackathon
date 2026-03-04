// candidates.service.ts
// Service for handling candidate API calls using axios

import {
    apiClient,
    handleApiResponse,
    API_ENDPOINTS,
    buildUrl,
    apiMethods,
    type ApiResponse,
    type PaginatedResponse,
    type FilterOption,
    type ComparisonFilters
} from '@/lib/api';

// Define allowed category values
type CandidateCategory = 'presidential' | 'governors' | 'senators' | 'mps' | 'mcas' | 'women_reps';

// Define search parameters interface
interface SearchParams {
    query?: string;
    position?: string;
    county_id?: number;
    party_id?: number;
    gender?: 'male' | 'female';
    per_page?: number;
    page?: number;
    [key: string]: unknown; // Allow additional params for flexibility
}

// Define comparison parameters interface
interface ComparisonParams {
    candidate1_slug: string;
    candidate2_slug: string;
}

// Define candidate data interfaces based on API responses
interface BaseCandidate {
    id: string;
    name: string;
    slug: string;
    position: string;
    party: string;
    party_code: string;
    county: string;
    image: string;
}

interface ComparisonCandidate extends BaseCandidate {
    party: any
    tagline: string;
    bio: string;
}

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

// Define scoring interfaces
interface CandidateScoring {
    total_score: number;
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
        subcategories: Array<{
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
                notes: string;
            }>;
        }>;
    }>;
}

interface LeaderboardCandidate {
    candidate: ComparisonCandidate;
    scoring: CandidateScoring;
    ranking: {
        position: number;
        total_candidates: number;
    };
    meta: {
        is_scored: boolean;
        scored_indicators: number;
        completion_percentage: number;
    };
}

interface LeaderboardResponse {
    leaderboard: LeaderboardCandidate[];
    statistics: {
        total_candidates: number;
        scored_candidates: number;
        average_score: number;
        highest_score: number;
        lowest_score: number;
        grade_distribution: Record<string, number>;
    };
    filters_applied: {
        position?: string;
        county_id?: string;
        party_id?: string;
        limit: number;
        min_score?: number;
        include_unscored: boolean;
    };
}

// Define statistics data type
interface CandidateStatistics {
    total: number;
    by_category: Record<CandidateCategory, number>;
}

// Define comparison response interfaces
interface ComparisonResponse {
    candidate1: ComparisonCandidate;
    candidate2: ComparisonCandidate;
    comparison: {
        basic_info: {
            age: { candidate1: string | number; candidate2: string | number };
            gender: { candidate1: string; candidate2: string };
            location: { candidate1: string; candidate2: string };
            party: { candidate1: string; candidate2: string };
        };
        education: {
            candidate1: Array<{
                institution: string;
                qualification: string;
                field_of_study: string;
                education_level: string;
                period: string;
            }>;
            candidate2: Array<{
                institution: string;
                qualification: string;
                field_of_study: string;
                education_level: string;
                period: string;
            }>;
        };
        experience: {
            candidate1: Array<{
                company: string;
                position: string;
                type: string;
                period: string;
                description: string;
            }>;
            candidate2: Array<{
                company: string;
                position: string;
                type: string;
                period: string;
                description: string;
            }>;
        };
        political_experience: {
            candidate1: Array<{
                position: string;
                party: string;
                period: string;
                election_year: string;
                achievements: string;
                description: string;
            }>;
            candidate2: Array<{
                position: string;
                party: string;
                period: string;
                election_year: string;
                achievements: string;
                description: string;
            }>;
        };
        policies: {
            candidate1: Array<{
                name: string;
                description: string;
                key_points: string;
                vision_statement: string;
                mission_statement: string;
            }>;
            candidate2: Array<{
                name: string;
                description: string;
                key_points: string;
                vision_statement: string;
                mission_statement: string;
            }>;
        };
        endorsements: {
            candidate1: Array<{
                name: string;
                type: string;
                statement: string;
            }>;
            candidate2: Array<{
                name: string;
                type: string;
                statement: string;
            }>;
        };
        finance: {
            candidate1: Array<{
                sources_of_funds: string;
                funds_raised: string;
                has_financial_info: boolean;
                has_assets_declared: boolean;
            }>;
            candidate2: Array<{
                sources_of_funds: string;
                funds_raised: string;
                has_financial_info: boolean;
                has_assets_declared: boolean;
            }>;
        };
        suitability_scores: {
            candidate1: CandidateScoring;
            candidate2: CandidateScoring;
        };
    };
}

interface MultiCandidateComparisonResponse {
    candidates: Array<{
        candidate: ComparisonCandidate;
        scoring: CandidateScoring;
    }>;
    comparison_summary: {
        winner: {
            id: string;
            name: string;
        };
        total_candidates: number;
        score_differences: Record<string, number>;
        category_wins: Record<string, number>;
        largest_gap: number;
        closest_gap: number;
    };
}

class CandidatesService {
    /**
     * Get all candidates organized by categories
     */
    async getAllCandidates(params: Record<string, unknown> = {}): Promise<any> {
        return apiMethods.get<BaseCandidate[]>(API_ENDPOINTS.candidates.getAll, params);
    }

    /**
     * Search candidates with filters
     */
    async searchCandidates(searchParams: SearchParams = {}): Promise<any> {
        return apiMethods.get<PaginatedResponse<BaseCandidate>>(API_ENDPOINTS.candidates.search, searchParams);
    }

    /**
     * Get candidates by category
     */
    async getCandidatesByCategory(category: CandidateCategory, params: Record<string, any> = {}): Promise<any> {
        const endpoint = API_ENDPOINTS.candidates.getByCategory(category);
        return apiMethods.get<BaseCandidate[]>(endpoint, params);
    }

    /**
     * Get single candidate details
     */
    async getCandidateDetails(slug: string): Promise<ApiResponse<any>> {
        const endpoint = API_ENDPOINTS.candidates.getBySlug(slug);
        return handleApiResponse<any>(apiClient.get(endpoint));
    }

    /**
     * Get candidates statistics
     */
    async getCandidatesStatistics(): Promise<any> {
        return apiMethods.get<CandidateStatistics>(API_ENDPOINTS.candidates.statistics);
    }

    /**
     * Get candidates for comparison with filters
     */
    async getCandidatesForComparison(filters: ComparisonFilters = {}): Promise<ApiResponse<BaseCandidate[]>> {
        try {
            // Clean up filters - only send non-empty values
            const cleanFilters: Record<string, string> = {};

            Object.entries(filters).forEach(([key, value]) => {
                if (value && value.toString().trim() !== '') {
                    cleanFilters[key] = value.toString().trim();
                }
            });

            return apiMethods.get<BaseCandidate[]>('/candidates/for-comparison', cleanFilters);
        } catch (error) {
            console.error('Error fetching candidates for comparison:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch candidates for comparison'
            };
        }
    }

    /**
 * Get a single candidate for comparison (used when coming from single candidate page)
 * This method fetches candidate data in the format needed for comparison
 */
    async getCandidateForComparison(slug: string): Promise<ApiResponse<ComparisonCandidate>> {
        try {
            const endpoint = `/candidates/${slug}/for-comparison`;
            const response = await handleApiResponse<ComparisonCandidate>(apiClient.get(endpoint));

            // If the specific endpoint doesn't exist, fallback to regular candidate details
            // and transform the data
            if (!response.success && response.message?.includes('404')) {
                const detailsResponse = await this.getCandidateDetails(slug);

                if (detailsResponse.success && detailsResponse.data) {
                    const candidate = detailsResponse.data;

                    // Transform the detailed candidate data to match ComparisonCandidate format
                    const comparisonCandidate: ComparisonCandidate = {
                        id: candidate.id,
                        slug: candidate.slug,
                        name: candidate.name,
                        position: candidate.position,
                        party: candidate.party,
                        image: candidate.image,
                        tagline: candidate.tagline || '',
                        bio: candidate.bio || '',
                        county: candidate.county?.name || candidate.county,
                        party_code: candidate.party?.code || ''
                    };

                    return {
                        success: true,
                        data: comparisonCandidate
                    };
                }
            }

            return response;
        } catch (error) {
            console.error('Error fetching candidate for comparison:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch candidate for comparison'
            };
        }
    }

    /**
     * Compare two candidates with enhanced scoring data
     */
    async compareCandidates(params: ComparisonParams): Promise<any> {
        try {
            return apiMethods.post<ComparisonResponse>('/candidates/compare', params);
        } catch (error) {
            console.error('Error comparing candidates:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to compare candidates'
            };
        }
    }

    /**
     * Get candidate scoring data (integrates with scoring API)
     */
    async getCandidateScores(candidateId: string): Promise<ApiResponse<{ candidate: ComparisonCandidate; scoring: CandidateScoring }>> {
        try {
            const endpoint = `/scoring/candidates/${candidateId}`;
            return apiMethods.get<{ candidate: ComparisonCandidate; scoring: CandidateScoring }>(endpoint);
        } catch (error) {
            console.error('Error fetching candidate scores:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch candidate scores'
            };
        }
    }

    /**
     * Get presidential candidates
     */
    async getPresidentialCandidates(params: Record<string, unknown> = {}): Promise<ApiResponse<BaseCandidate[]>> {
        return this.getCandidatesByCategory('presidential', params);
    }

    /**
     * Get gubernatorial candidates
     */
    async getGubernatorialCandidates(params: Record<string, unknown> = {}): Promise<ApiResponse<BaseCandidate[]>> {
        return this.getCandidatesByCategory('governors', params);
    }

    /**
     * Get senatorial candidates
     */
    async getSenatoralCandidates(params: Record<string, unknown> = {}): Promise<ApiResponse<BaseCandidate[]>> {
        return this.getCandidatesByCategory('senators', params);
    }

    /**
     * Get MP candidates
     */
    async getMPCandidates(params: Record<string, unknown> = {}): Promise<ApiResponse<BaseCandidate[]>> {
        return this.getCandidatesByCategory('mps', params);
    }

    /**
     * Get MCA candidates
     */
    async getMCACandidates(params: Record<string, unknown> = {}): Promise<ApiResponse<BaseCandidate[]>> {
        return this.getCandidatesByCategory('mcas', params);
    }

    /**
     * Get Women Representative candidates
     */
    async getWomenRepCandidates(params: Record<string, unknown> = {}): Promise<ApiResponse<BaseCandidate[]>> {
        return this.getCandidatesByCategory('women_reps', params);
    }

    /**
     * Get candidates by county
     */
    async getCandidatesByCounty(countyId: number, params: Record<string, unknown> = {}): Promise<ApiResponse<PaginatedResponse<BaseCandidate>>> {
        const searchParams: SearchParams = { ...params, county_id: countyId };
        return this.searchCandidates(searchParams);
    }

    /**
     * Get candidates by party
     */
    async getCandidatesByParty(partyId: number, params: Record<string, unknown> = {}): Promise<ApiResponse<PaginatedResponse<BaseCandidate>>> {
        const searchParams: SearchParams = { ...params, party_id: partyId };
        return this.searchCandidates(searchParams);
    }

    /**
     * Get candidates by gender
     */
    async getCandidatesByGender(gender: 'male' | 'female', params: Record<string, unknown> = {}): Promise<ApiResponse<PaginatedResponse<BaseCandidate>>> {
        const searchParams: SearchParams = { ...params, gender };
        return this.searchCandidates(searchParams);
    }

    /**
     * Get paginated candidates
     */
    async getPaginatedCandidates(page: number = 1, perPage: number = 12, filters: Record<string, unknown> = {}): Promise<ApiResponse<PaginatedResponse<BaseCandidate>>> {
        const params: SearchParams = { ...filters, page, per_page: perPage };
        return this.searchCandidates(params);
    }

    /**
     * Get counties for filters
     */
    async getCounties(search: string = ''): Promise<any> {
        try {
            const params = search ? { search } : {};
            return apiMethods.get<FilterOption[]>('/counties', params);
        } catch (error) {
            console.error('Error fetching counties:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch counties'
            };
        }
    }

    /**
     * Get parties for filters
     */
    async getParties(search: string = ''): Promise<any> {
        try {
            const params = search ? { search } : {};
            return apiMethods.get<FilterOption[]>('/parties', params);
        } catch (error) {
            console.error('Error fetching parties:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch parties'
            };
        }
    }

    /**
     * Get scoring structure for reference
     */
    async getScoringStructure(): Promise<ApiResponse<any>> {
        try {
            return apiMethods.get('/scoring/structure');
        } catch (error) {
            console.error('Error fetching scoring structure:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch scoring structure'
            };
        }
    }

    /**
     * Get scoring reference data
     */
    async getScoringReference(): Promise<ApiResponse<{
        positions: Array<{ value: string; label: string }>;
        counties: FilterOption[];
        parties: FilterOption[];
    }>> {
        try {
            return apiMethods.get('/scoring/reference');
        } catch (error) {
            console.error('Error fetching scoring reference:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch scoring reference'
            };
        }
    }

    /**
     * Get scoring statistics
     */
    async getScoringStatistics(): Promise<ApiResponse<{
        overall: {
            total_candidates: number;
            average_score: number;
            highest_score: number;
            lowest_score: number;
            median_score: number;
            score_distribution: Record<string, number>;
        };
        by_position: Record<string, {
            count: number;
            average_score: number;
            highest_score: number;
            lowest_score: number;
        }>;
        by_county: Record<string, {
            count: number;
            average_score: number;
            highest_score: number;
            lowest_score: number;
        }>;
        by_party: Record<string, {
            count: number;
            average_score: number;
            highest_score: number;
            lowest_score: number;
        }>;
        metadata: {
            generated_at: string;
            total_categories: number;
            total_indicators: number;
        };
    }>> {
        try {
            return apiMethods.get('/scoring/statistics');
        } catch (error) {
            console.error('Error fetching scoring statistics:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch scoring statistics'
            };
        }
    }

    /**
     * Get candidates leaderboard with scoring
     */
    async getCandidatesLeaderboard(params: {
        position?: string;
        county_id?: string;
        party_id?: string;
        min_score?: number;
        limit?: number;
        include_unscored?: boolean;
    } = {}): Promise<ApiResponse<LeaderboardResponse>> {
        try {
            return apiMethods.get<LeaderboardResponse>('/scoring/leaderboard', params);
        } catch (error) {
            console.error('Error fetching candidates leaderboard:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch candidates leaderboard'
            };
        }
    }

    /**
     * Compare multiple candidates (up to 5)
     */
    async compareMultipleCandidates(candidateIds: string[]): Promise<ApiResponse<MultiCandidateComparisonResponse>> {
        try {
            if (candidateIds.length < 2 || candidateIds.length > 5) {
                return {
                    success: false,
                    message: 'Must compare between 2 and 5 candidates'
                };
            }

            return apiMethods.post<MultiCandidateComparisonResponse>('/scoring/candidates/compare', {
                candidate_ids: candidateIds
            });
        } catch (error) {
            console.error('Error comparing multiple candidates:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to compare multiple candidates'
            };
        }
    }
}

// Export types for use in components
export type {
    BaseCandidate,
    ComparisonCandidate,
    CandidateDetails,
    CandidateScoring,
    LeaderboardCandidate,
    LeaderboardResponse,
    ComparisonResponse,
    MultiCandidateComparisonResponse,
    CandidateStatistics,
    SearchParams,
    ComparisonParams,
    CandidateCategory
};

// Export a singleton instance
const candidatesService = new CandidatesService();
export default candidatesService;

// Named exports for individual methods if needed
export { CandidatesService };