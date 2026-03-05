// types/api.ts
// Type definitions for VoteTrace360 API responses

// Base API response types
export interface BaseApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
    status?: number;
}

export interface PaginatedApiResponse<T> extends BaseApiResponse<T[]> {
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

// Risk level types
export type RiskLevel = 'GREEN' | 'AMBER' | 'RED';

// Platform types for digital spend
export type DigitalPlatform = 'meta' | 'google' | 'x_twitter';

// Donor types
export type DonorType = 'individual' | 'company' | 'organization' | 'government' | 'other';

// Service health types
export type ServiceStatus = 'healthy' | 'unhealthy' | 'degraded';

// Alert severity types
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

// Candidate types - Updated to match actual backend structure
export interface BaseCandidate {
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

export interface CandidateSummary {
    id: number;
    name: string;
    integrity_score: number;
    risk_level: RiskLevel;
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

// Digital spend types
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
    platform: DigitalPlatform;
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

// Donor types
export interface Donor {
    id?: number;
    candidate_id: number;
    donor_name: string;
    donor_type: DonorType;
    amount: number;
    currency: string;
    donation_date: string;
    risk_level: RiskLevel;
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
        overall_risk_level: RiskLevel;
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
        risk_level: RiskLevel;
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
        risk_level: RiskLevel;
        candidate_id: number;
    }>;
    briefcase_companies: Array<{
        company_name: string;
        amount: number;
        risk_factors: string[];
        candidate_id: number;
    }>;
}

// Health check types
export interface ServiceHealth {
    service: string;
    status: ServiceStatus;
    timestamp: string;
    response_time: number;
    details?: {
        database_connection?: boolean;
        memory_usage?: number;
        cpu_usage?: number;
        last_sync?: string;
        error_count?: number;
        [key: string]: any;
    };
    error?: string;
}

export interface OverallHealthStatus {
    status: ServiceStatus;
    timestamp: string;
    services: {
        reconciliation: ServiceHealth;
        digital: ServiceHealth;
        donors: ServiceHealth;
    };
    summary: {
        total_services: number;
        healthy_services: number;
        unhealthy_services: number;
        degraded_services: number;
    };
    uptime: {
        reconciliation: number;
        digital: number;
        donors: number;
    };
}

// UI component props types
export interface RiskLevelColors {
    GREEN: string;
    AMBER: string;
    RED: string;
}

export const RISK_LEVEL_COLORS: RiskLevelColors = {
    GREEN: '#10B981',
    AMBER: '#F59E0B',
    RED: '#EF4444',
};

// Common filter types
export interface DateRangeFilter {
    start_date?: string;
    end_date?: string;
}

export interface PaginationFilter {
    page?: number;
    per_page?: number;
}

export interface SearchFilter {
    search?: string;
    query?: string;
}

// Combined filter types
export interface CandidateFilters extends SearchFilter, PaginationFilter {
    risk_level?: RiskLevel;
    min_integrity_score?: number;
    max_integrity_score?: number;
    min_total_spend?: number;
    max_total_spend?: number;
}

export interface DigitalSpendFilters extends SearchFilter, DateRangeFilter, PaginationFilter {
    platform?: DigitalPlatform;
    candidate_id?: number;
    min_amount?: number;
    max_amount?: number;
}

export interface DonorFilters extends SearchFilter, DateRangeFilter, PaginationFilter {
    candidate_id?: number;
    risk_level?: RiskLevel;
    donor_type?: DonorType;
    min_amount?: number;
    max_amount?: number;
    briefcase_company?: boolean;
}

// Chart data types
export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

export interface TimeSeriesDataPoint {
    date: string;
    value: number;
    category?: string;
}

export interface ComparisonData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string[];
    }>;
}

// Form types
export interface DigitalSpendForm {
    candidate_id: number;
    platform: DigitalPlatform;
    amount: number;
    currency: string;
    date: string;
    campaign_type?: string;
    ad_count?: number;
    impressions?: number;
    clicks?: number;
}

export interface DonorForm {
    candidate_id: number;
    donor_name: string;
    donor_type: DonorType;
    amount: number;
    currency: string;
    donation_date: string;
    source_of_funds?: string;
    location?: string;
    description?: string;
}