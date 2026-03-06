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

// Define candidate data interfaces based on actual Vote Trace Kenya API responses
interface BaseCandidate {
    id: number;
    name: string;
    party: string;
    position: string;
    constituency: string;
    financial_summary: {
        total_physical_spend: number;
        total_digital_spend: number;
        total_estimated_spend: number;
        total_reported_income: number;
        spending_gap: number;
        spending_gap_ratio: number;
    };
    integrity: {
        score: number;
        risk_level: 'GREEN' | 'AMBER' | 'RED';
        risk_label: string;
    };
    donor_count?: number;
    high_risk_donors?: number;
}

interface Donor {
    id: number;
    created_at: string;
    candidate_id: number;
    donor_name: string;
    donation_amount: number;
    registration_date: string | null;
    company_age_days: number | null;
    risk_score: 'LOW' | 'MEDIUM' | 'HIGH';
    donation_percentage: number;
    risk_factors: string[];
}

interface CandidateSummary {
    candidate: {
        id: number;
        name: string;
        party: string;
        position: string;
        constituency: string;
    };
    integrity: {
        score: number;
        risk_level: 'GREEN' | 'AMBER' | 'RED';
        classification: string;
    };
    financial_summary: {
        total_physical_spend: number;
        total_digital_spend: number;
        total_estimated_spend: number;
        total_reported_income: number;
        spending_gap: number;
        spending_gap_ratio: number;
        unreported_percentage?: number;
    };
    donor_risk?: {
        avg_donor_risk: number;
    };
    // Donor data structure
    candidate_id: number;
    total_reported_income: number;
    donor_count: number;
    risk_summary: {
        high: number;
        medium: number;
        low: number;
        high_risk_percentage: number;
    };
    red_flags: {
        briefcase_companies: number;
        unverifiable_entities: number;
        concentration_risk: {
            top_donor_percentage: number;
            top_3_donors_percentage: number;
        };
    };
    donors: Donor[];
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