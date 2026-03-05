// services/donor.service.ts
// Service for handling donor and risk analysis API calls

import { apiClient, handleApiResponse, API_ENDPOINTS, apiMethods, type ApiResponse } from '@/lib/api';

// Define interfaces for donor and risk data
export interface Donor {
    id?: number;
    candidate_id: number;
    donor_name: string;
    donor_type: 'individual' | 'company' | 'organization' | 'government' | 'other';
    amount: number;
    currency: string;
    donation_date: string;
    risk_level: 'GREEN' | 'AMBER' | 'RED';
    risk_factors: string[];
    briefcase_company?: boolean;
    political_connections?: string[];
    source_of_funds?: string;
    location?: string;
    description?: string;
}

export interface DonorRiskAnalysis {
    candidate_id: number;
    total_donors: number;
    total_amount: number;
    risk_breakdown: {
        green: {
            count: number;
            amount: number;
            percentage: number;
        };
        amber: {
            count: number;
            amount: number;
            percentage: number;
        };
        red: {
            count: number;
            amount: number;
            percentage: number;
        };
    };
    high_risk_donors: Donor[];
    briefcase_companies: Donor[];
    risk_summary: {
        overall_risk_level: 'GREEN' | 'AMBER' | 'RED';
        red_flags: string[];
        compliance_score: number;
        recommendations: string[];
    };
    donor_categories: {
        individuals: { count: number; amount: number };
        companies: { count: number; amount: number };
        organizations: { count: number; amount: number };
        government: { count: number; amount: number };
        other: { count: number; amount: number };
    };
    geographical_breakdown: Array<{
        location: string;
        donor_count: number;
        total_amount: number;
        risk_level: 'GREEN' | 'AMBER' | 'RED';
    }>;
}

export interface DonorImportResponse {
    success: boolean;
    message: string;
    imported_count?: number;
    failed_count?: number;
    errors?: string[];
    records?: Donor[];
}

export interface DonorStatistics {
    total_donors: number;
    total_amount: number;
    average_donation: number;
    risk_distribution: {
        green: { count: number; amount: number; percentage: number };
        amber: { count: number; amount: number; percentage: number };
        red: { count: number; amount: number; percentage: number };
    };
    donor_types: {
        individual: { count: number; amount: number };
        company: { count: number; amount: number };
        organization: { count: number; amount: number };
        government: { count: number; amount: number };
        other: { count: number; amount: number };
    };
    top_donors: Array<{
        donor_name: string;
        amount: number;
        risk_level: 'GREEN' | 'AMBER' | 'RED';
        candidate_id: number;
    }>;
    briefcase_companies: Array<{
        company_name: string;
        amount: number;
        risk_factors: string[];
        candidate_id: number;
    }>;
}

class DonorService {
    /**
     * Get donor risk analysis for a specific candidate
     */
    async getCandidateDonors(candidateId: number): Promise<ApiResponse<DonorRiskAnalysis>> {
        const endpoint = API_ENDPOINTS.donors.getCandidateDonors(candidateId);
        return apiMethods.get<DonorRiskAnalysis>(endpoint);
    }

    /**
     * Import donor data from CSV
     */
    async importDonorData(csvFile: File): Promise<ApiResponse<DonorImportResponse>> {
        const formData = new FormData();
        formData.append('file', csvFile);

        try {
            const response = await apiClient.post(API_ENDPOINTS.donors.upload, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return handleApiResponse<DonorImportResponse>(Promise.resolve(response));
        } catch (error) {
            console.error('Error importing donor data:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to import donor data'
            };
        }
    }

    /**
     * Add a single donor record
     */
    async addDonorRecord(record: Omit<Donor, 'id'>): Promise<ApiResponse<Donor>> {
        try {
            return apiMethods.post<Donor>(API_ENDPOINTS.donors.addRecord, record);
        } catch (error) {
            console.error('Error adding donor record:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to add donor record'
            };
        }
    }

    /**
     * Get donor statistics for all candidates
     */
    async getDonorStatistics(): Promise<ApiResponse<DonorStatistics>> {
        try {
            return apiMethods.get<DonorStatistics>('/api/v1/donors/statistics');
        } catch (error) {
            console.error('Error fetching donor statistics:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch donor statistics'
            };
        }
    }

    /**
     * Search donors by name or filter by criteria
     */
    async searchDonors(filters: {
        search?: string;
        candidate_id?: number;
        risk_level?: 'GREEN' | 'AMBER' | 'RED';
        donor_type?: Donor['donor_type'];
        min_amount?: number;
        max_amount?: number;
        date_from?: string;
        date_to?: string;
        briefcase_company?: boolean;
        page?: number;
        per_page?: number;
    }): Promise<ApiResponse<{
        donors: Donor[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
    }>> {
        try {
            return apiMethods.get('/api/v1/donors/search', filters);
        } catch (error) {
            console.error('Error searching donors:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to search donors'
            };
        }
    }

    /**
     * Get detailed information about a specific donor
     */
    async getDonorDetails(donorId: number): Promise<ApiResponse<Donor & {
        donation_history: Array<{
            amount: number;
            date: string;
            candidate_id: number;
            candidate_name: string;
        }>;
        risk_analysis: {
            risk_factors: string[];
            risk_score: number;
            recommendations: string[];
        };
    }>> {
        try {
            return apiMethods.get(`/api/v1/donors/${donorId}`);
        } catch (error) {
            console.error('Error fetching donor details:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch donor details'
            };
        }
    }

    /**
     * Compare donor profiles between candidates
     */
    async compareCandidateDonors(candidateIds: number[]): Promise<ApiResponse<{
        comparison: Array<{
            candidate_id: number;
            candidate_name: string;
            total_donors: number;
            total_amount: number;
            risk_breakdown: {
                green: { count: number; amount: number };
                amber: { count: number; amount: number };
                red: { count: number; amount: number };
            };
            briefcase_companies: number;
            compliance_score: number;
        }>;
        insights: {
            highest_risk: string;
            most_transparent: string;
            unusual_patterns: string[];
        };
    }>> {
        try {
            return apiMethods.post('/api/v1/donors/compare', { candidate_ids: candidateIds });
        } catch (error) {
            console.error('Error comparing donor profiles:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to compare donor profiles'
            };
        }
    }

    /**
     * Get risk analysis insights and red flags
     */
    async getRiskInsights(candidateId?: number): Promise<ApiResponse<{
        overall_risk_summary: {
            total_donors: number;
            high_risk_percentage: number;
            briefcase_company_count: number;
            red_flags_count: number;
        };
        risk_trends: Array<{
            period: string;
            green_count: number;
            amber_count: number;
            red_count: number;
        }>;
        common_risk_factors: Array<{
            factor: string;
            frequency: number;
            risk_level: 'GREEN' | 'AMBER' | 'RED';
        }>;
        recommendations: string[];
        regulatory_compliance: {
            score: number;
            issues: string[];
            required_actions: string[];
        };
    }>> {
        try {
            const params = candidateId ? { candidate_id: candidateId } : {};
            return apiMethods.get('/api/v1/donors/risk-insights', params);
        } catch (error) {
            console.error('Error fetching risk insights:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch risk insights'
            };
        }
    }

    /**
     * Update donor risk assessment
     */
    async updateDonorRisk(donorId: number, riskAssessment: {
        risk_level: 'GREEN' | 'AMBER' | 'RED';
        risk_factors: string[];
        notes?: string;
    }): Promise<ApiResponse<Donor>> {
        try {
            return apiMethods.put(`/api/v1/donors/${donorId}/risk`, riskAssessment);
        } catch (error) {
            console.error('Error updating donor risk:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update donor risk'
            };
        }
    }
}

// Export a singleton instance
const donorService = new DonorService();
export default donorService;

// Named exports for individual methods if needed
export { DonorService };
