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

// Define search parameters interface - kept for compatibility
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

// Define candidate data interfaces based on VoteTrace360 API responses
interface BaseCandidate {
    id: number;
    name: string;
    integrity_score: number;
    risk_level: 'GREEN' | 'AMBER' | 'RED';
    total_spend: number;
    digital_spend: number;
    physical_spend: number;
    donor_count: number;
    high_risk_donors: number;
}

interface CandidateSummary {
    id: number;
    name: string;
    integrity_score: number;
    risk_level: 'GREEN' | 'AMBER' | 'RED';
    total_spend: number;
    digital_spend: {
        meta: number;
        google: number;
        x_twitter: number;
        total: number;
    };
    physical_spend: number;
    spend_breakdown: {
        advertising: number;
        events: number;
        operations: number;
        other: number;
    };
    donors: {
        total_count: number;
        high_risk_count: number;
        total_amount: number;
        risk_breakdown: {
            green: { count: number; amount: number };
            amber: { count: number; amount: number };
            red: { count: number; amount: number };
        };
    };
    red_flags: string[];
    compliance_score: number;
    last_updated: string;
}

class CandidatesService {
    /**
     * Get all candidates sorted by integrity score
     */
    async getAllCandidates(): Promise<ApiResponse<BaseCandidate[]>> {
        return apiMethods.get<BaseCandidate[]>(API_ENDPOINTS.candidates.getAll);
    }

    /**
     * Get single candidate summary with full integrity breakdown
     */
    async getCandidateSummary(id: number): Promise<ApiResponse<CandidateSummary>> {
        const endpoint = API_ENDPOINTS.candidates.getSummary(id);
        return apiMethods.get<CandidateSummary>(endpoint);
    }


    }

// Export types for use in components
export type {
    BaseCandidate,
    CandidateSummary,
};

// Export a singleton instance
const candidatesService = new CandidatesService();
export default candidatesService;

// Named exports for individual methods if needed
export { CandidatesService };