// services/parties.service.ts
// Service for handling political parties API calls

import { apiClient, handleApiResponse, API_ENDPOINTS, buildUrl } from '@/lib/api';

// Define interfaces for party data
export interface PoliticalParty {
    id: string;
    slug: string;
    name: string;
    abbreviation: string;
    logo: string;
    slogan: string;
    leader: string;
    founded_year: number;
    headquarters: string;
    description: string;
    website?: string;
    email?: string;
    phone?: string;
    colors?: string;
    status: string;
    type?: string;
    candidate_count: number;
    is_active: boolean;
    ideologies?: string[];
    governance_performance?: Array<{
        position: string;
        period: string;
        achievements: string;
        challenges: string;
    }>;
    candidate_statistics?: {
        total: number;
        by_position: Record<string, number>;
    };
    created_at: string;
    updated_at: string;
}

export interface FeaturedContent {
    id: string;
    title: string;
    description: string;
    party_id: string;
    party_name: string;
    type: 'interview' | 'speech' | 'rally' | 'policy';
    video_url?: string;
    article_url?: string;
    thumbnail?: string;
    published_date: string;
}

export interface PartySearchFilters {
    search?: string;
    query?: string;
    status?: 'active' | 'inactive' | 'all';
    type?: string;
    year_from?: number;
    year_to?: number;
    has_candidates?: boolean;
    sort_by?: 'name' | 'founded' | 'candidates';
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
}

export interface PartyStatistics {
    total_parties: number;
    active_parties: number;
    parties_with_candidates: number;
    by_type: Record<string, number>;
    founding_decades: Record<string, number>;
    parties_by_candidates: Array<{
        id: string;
        party_name: string;
        party_code: string;
        candidate_count: number;
    }>;
}

export interface PartyComparison {
    parties: PoliticalParty[];
    comparison_metrics: {
        founding_years: Record<string, number>;
        candidate_counts: Record<string, number>;
        has_website: Record<string, boolean>;
        leadership: Record<string, string>;
        status: Record<string, string>;
    };
}

class PartiesService {
    /**
     * Get all political parties with optional filters
     */
    async getAllParties(filters: any = {}): Promise<any> {
        const url = buildUrl(API_ENDPOINTS.parties.getAll, filters);
        return handleApiResponse<{ data: PoliticalParty[] }>(apiClient.get(url));
    }

    /**
     * Search parties with advanced filters
     */
    async searchParties(filters: any = {}): Promise<any> {
        const url = buildUrl(API_ENDPOINTS.parties.search, filters);
        return handleApiResponse<{ data: PoliticalParty[] }>(apiClient.get(url));
    }

    /**
     * Get featured parties and content
     */
    async getFeaturedParties(): Promise<any> {
        return handleApiResponse<{
            parties: PoliticalParty[];
            content: FeaturedContent[];
        }>(apiClient.get(API_ENDPOINTS.parties.featured));
    }

    /**
     * Get single party details
     */
    async getPartyDetails(slug: string): Promise<any> {
        const endpoint = API_ENDPOINTS.parties.getBySlug(slug);
        return handleApiResponse<PoliticalParty>(apiClient.get(endpoint));
    }

    /**
     * Get party statistics
     */
    async getPartiesStatistics(): Promise<any> {
        return handleApiResponse<PartyStatistics>(apiClient.get(API_ENDPOINTS.parties.statistics));
    }

    /**
     * Get party candidates
     */
    async getPartyCandidates(partySlug: string, filters: {
        position?: string;
        county_id?: string;
        per_page?: number;
        page?: number;
    } = {}): Promise<any> {
        const endpoint = API_ENDPOINTS.parties.getCandidates(partySlug);
        const url = buildUrl(endpoint, filters);
        return handleApiResponse(apiClient.get(url));
    }

    /**
     * Get party policy positions
     */
    async getPartyPolicyPositions(partySlug: string): Promise<any> {
        const endpoint = API_ENDPOINTS.parties.getPolicyPositions(partySlug);
        return handleApiResponse(apiClient.get(endpoint));
    }

    /**
     * Get party media content
     */
    async getPartyMediaContent(partySlug: string): Promise<any> {
        const endpoint = API_ENDPOINTS.parties.getMediaContent(partySlug);
        return handleApiResponse(apiClient.get(endpoint));
    }

    /**
     * Get party campaign events
     */
    async getPartyCampaignEvents(partySlug: string): Promise<any> {
        const endpoint = API_ENDPOINTS.parties.getCampaignEvents(partySlug);
        return handleApiResponse(apiClient.get(endpoint));
    }

    /**
     * Compare multiple parties
     */
    async compareParties(partySlugs: string[]): Promise<any> {
        return handleApiResponse<PartyComparison>(
            apiClient.post(API_ENDPOINTS.parties.compare, { party_slugs: partySlugs })
        );
    }

    /**
     * Get active parties only
     */
    async getActiveParties(filters: Omit<PartySearchFilters, 'status'> = {}): Promise<any> {
        return this.getAllParties({ ...filters, status: 'active' });
    }

    /**
     * Get parties by type
     */
    async getPartiesByType(type: string, filters: Omit<PartySearchFilters, 'type'> = {}): Promise<any> {
        return this.getAllParties({ ...filters, type });
    }

    /**
     * Get parties founded in a specific period
     */
    async getPartiesByPeriod(yearFrom: number, yearTo: number, filters: Omit<PartySearchFilters, 'year_from' | 'year_to'> = {}): Promise<any> {
        return this.getAllParties({ ...filters, year_from: yearFrom, year_to: yearTo });
    }

    /**
     * Get parties with candidates
     */
    async getPartiesWithCandidates(filters: Omit<PartySearchFilters, 'has_candidates'> = {}): Promise<any> {
        return this.getAllParties({ ...filters, has_candidates: true });
    }

    /**
     * Get paginated parties
     */
    async getPaginatedParties(page: number = 1, perPage: number = 12, filters: any = {}): Promise<any> {
        return this.getAllParties({ ...filters, page, per_page: perPage });
    }

    /**
     * Search parties by name or code
     */
    async searchPartiesByName(query: string, filters: Omit<any, 'query'> = {}): Promise<any> {
        return this.searchParties({ ...filters, query });
    }
}

// Export a singleton instance
const partiesService = new PartiesService();
export default partiesService;

// Named exports for individual methods if needed
export { PartiesService };