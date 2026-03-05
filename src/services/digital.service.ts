// services/digital.service.ts
// Service for handling digital spend API calls

import { apiClient, handleApiResponse, API_ENDPOINTS, apiMethods, type ApiResponse } from '@/lib/api';

// Define interfaces for digital spend data
export interface DigitalSpendBreakdown {
    candidate_id: number;
    meta_spend: number;
    google_spend: number;
    x_twitter_spend: number;
    total_digital_spend: number;
    last_updated: string;
    spend_trend?: {
        period: string;
        amount: number;
    }[];
}

export interface DigitalRecord {
    id?: number;
    candidate_id: number;
    platform: 'meta' | 'google' | 'x_twitter';
    amount: number;
    currency: string;
    date: string;
    campaign_type?: string;
    ad_count?: number;
    impressions?: number;
    clicks?: number;
    ctr?: number;
    cpc?: number;
    cpm?: number;
}

export interface DigitalImportResponse {
    success: boolean;
    message: string;
    imported_count?: number;
    failed_count?: number;
    errors?: string[];
    records?: DigitalRecord[];
}

export interface DigitalStatistics {
    total_spend: number;
    by_platform: {
        meta: number;
        google: number;
        x_twitter: number;
    };
    by_candidate: Array<{
        candidate_id: number;
        candidate_name: string;
        total_spend: number;
        platform_breakdown: {
            meta: number;
            google: number;
            x_twitter: number;
        };
    }>;
    trend_data: Array<{
        period: string;
        total_spend: number;
        platform_breakdown: {
            meta: number;
            google: number;
            x_twitter: number;
        };
    }>;
}

class DigitalService {
    /**
     * Get digital spend breakdown for a specific candidate
     */
    async getCandidateDigitalBreakdown(candidateId: number): Promise<ApiResponse<DigitalSpendBreakdown>> {
        const endpoint = API_ENDPOINTS.digital.getCandidateBreakdown(candidateId);
        return apiMethods.get<DigitalSpendBreakdown>(endpoint);
    }

    /**
     * Import digital spend data from CSV
     */
    async importDigitalData(csvFile: File): Promise<ApiResponse<DigitalImportResponse>> {
        const formData = new FormData();
        formData.append('file', csvFile);

        try {
            const response = await apiClient.post(API_ENDPOINTS.digital.import, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return handleApiResponse<DigitalImportResponse>(Promise.resolve(response));
        } catch (error) {
            console.error('Error importing digital data:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to import digital data'
            };
        }
    }

    /**
     * Add a single digital spend record
     */
    async addDigitalRecord(record: Omit<DigitalRecord, 'id'>): Promise<ApiResponse<DigitalRecord>> {
        try {
            return apiMethods.post<DigitalRecord>(API_ENDPOINTS.digital.addRecord, record);
        } catch (error) {
            console.error('Error adding digital record:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to add digital record'
            };
        }
    }

    /**
     * Get digital spend statistics for all candidates
     */
    async getDigitalStatistics(): Promise<ApiResponse<DigitalStatistics>> {
        try {
            return apiMethods.get<DigitalStatistics>('/api/v1/digital/statistics');
        } catch (error) {
            console.error('Error fetching digital statistics:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch digital statistics'
            };
        }
    }

    /**
     * Get digital spend trends for a candidate
     */
    async getCandidateDigitalTrends(candidateId: number, period: string = '30d'): Promise<ApiResponse<{
        period: string;
        data: Array<{
            date: string;
            meta_spend: number;
            google_spend: number;
            x_twitter_spend: number;
            total_spend: number;
        }>;
    }>> {
        try {
            return apiMethods.get(`/api/v1/digital/${candidateId}/trends`, { period });
        } catch (error) {
            console.error('Error fetching digital trends:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch digital trends'
            };
        }
    }

    /**
     * Compare digital spend between candidates
     */
    async compareCandidateDigitalSpend(candidateIds: number[]): Promise<ApiResponse<{
        comparison: Array<{
            candidate_id: number;
            candidate_name: string;
            total_spend: number;
            platform_breakdown: {
                meta: number;
                google: number;
                x_twitter: number;
            };
            rank: number;
        }>;
        summary: {
            total_candidates: number;
            highest_spend: number;
            lowest_spend: number;
            average_spend: number;
        };
    }>> {
        try {
            return apiMethods.post('/api/v1/digital/compare', { candidate_ids: candidateIds });
        } catch (error) {
            console.error('Error comparing digital spend:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to compare digital spend'
            };
        }
    }

    /**
     * Get platform-specific insights
     */
    async getPlatformInsights(platform: 'meta' | 'google' | 'x_twitter'): Promise<ApiResponse<{
        platform: string;
        total_spend: number;
        candidate_count: number;
        top_spenders: Array<{
            candidate_id: number;
            candidate_name: string;
            spend: number;
        }>;
        trends: Array<{
            period: string;
            spend: number;
        }>;
        insights: string[];
    }>> {
        try {
            return apiMethods.get(`/api/v1/digital/insights/${platform}`);
        } catch (error) {
            console.error('Error fetching platform insights:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch platform insights'
            };
        }
    }
}

// Export a singleton instance
const digitalService = new DigitalService();
export default digitalService;

// Named exports for individual methods if needed
export { DigitalService };
