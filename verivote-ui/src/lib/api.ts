// api.ts
// Base API configuration and utilities

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API Configuration
interface ApiConfig {
    baseURL: string;
    timeout: number;
    headers: {
        'Content-Type': string;
        Accept: string;
    };
}

const API_CONFIG: ApiConfig = {
    baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api`,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor
apiClient.interceptors.request.use(
    (config: AxiosRequestConfig): any => {
        // Add auth token if available
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token for Laravel
        const csrfToken =
            typeof window !== 'undefined'
                ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? null
                : null;
        if (csrfToken && config.headers) {
            config.headers['X-CSRF-TOKEN'] = csrfToken;
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 API Request: ${config.method?.toUpperCase() ?? 'UNKNOWN'} ${config.url ?? ''}`, {
                params: config.params,
                data: config.data,
            });
        }

        return config;
    },
    (error: AxiosError): Promise<never> => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            console.log(
                `✅ API Response: ${(response.config.method?.toUpperCase() ?? 'UNKNOWN')} ${response.config.url ?? ''}`,
                response.data
            );
        }
        return response;
    },
    (error: any): Promise<never> => {
        // Handle common error scenarios
        if (error.response) {
            const { status, data } = error.response;

            // Handle authentication errors
            if (status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth_token');
                    // You might want to redirect to login page here
                    // window.location.href = '/login';
                }
            }

            // Handle validation errors
            if (status === 422) {
                console.error('Validation Error:', data.errors ?? data.message ?? 'Validation failed');
            }

            // Handle server errors
            if (status >= 500) {
                console.error('Server Error:', data.message ?? 'Internal server error');
            }

            // Log error in development
            if (process.env.NODE_ENV === 'development') {
                console.error(
                    `❌ API Error: ${(error.config?.method?.toUpperCase() ?? 'UNKNOWN')} ${error.config?.url ?? ''}`,
                    {
                        status,
                        data,
                        message: error.message,
                    }
                );
            }
        } else if (error.request) {
            // Network error
            console.error('Network Error:', error.message);
        } else {
            // Other error
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

// API response types
interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
    meta?: unknown;
    links?: unknown;
}

interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: unknown;
    status?: number;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// API response wrapper
const handleApiResponse = async <T>(apiCall: Promise<any>): Promise<any> => {
    try {
        const response = await apiCall;
        return {
            success: true,
            data: (response.data as any).data ?? response.data,
            message: (response.data as any).message,
            meta: (response.data as any).meta,
            links: (response.data as any).links,
        };
    } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string; errors?: unknown }>;
        const errorMessage =
            axiosError.response?.data?.message ?? axiosError.message ?? 'An error occurred';
        const errorData = axiosError.response?.data?.errors ?? null;

        return {
            success: false,
            message: errorMessage,
            errors: errorData,
            status: axiosError.response?.status,
        };
    }
};

// API endpoints structure - CORRECTED
interface ApiEndpoints {
    candidates: {
        getAll: string;
        search: string;
        getByCategory: (category: string) => string;
        getBySlug: (slug: string) => string;
        statistics: string;
        forComparison: string;
        compare: string;
    };
    counties: {
        getAll: string;
        getById: (id: string | number) => string;
        getConstituencies: (countyId: string | number) => string;
        getWards: (constituencyId: string | number) => string;
    };
    parties: {
        getAll: string;
        search: string;
        featured: string;
        statistics: string;
        compare: string;
        getById: (id: string | number) => string;
        getBySlug: (slug: string) => string;
        getCandidates: (slug: string) => string;
        getPolicyPositions: (slug: string) => string;
        getMediaContent: (slug: string) => string;
        getCampaignEvents: (slug: string) => string;
        getActive: string;
    };
    auth: {
        login: string;
        logout: string;
        register: string;
        profile: string;
        refresh: string;
    };
}

const API_ENDPOINTS: ApiEndpoints = {
    candidates: {
        getAll: '/candidates',
        search: '/candidates/search',
        getByCategory: (category: string) => `/candidates/category/${category}`,
        getBySlug: (slug: string) => `/candidates/${slug}`,
        statistics: '/candidates/statistics',
        forComparison: '/candidates/for-comparison',
        compare: '/candidates/compare',
    },
    counties: {
        getAll: '/counties',
        getById: (id: string | number) => `/counties/${id}`,
        getConstituencies: (countyId: string | number) => `/counties/${countyId}/constituencies`,
        getWards: (constituencyId: string | number) => `/constituencies/${constituencyId}/wards`,
    },
    parties: {
        getAll: '/parties',
        search: '/parties/search',
        featured: '/parties/featured',
        statistics: '/parties/statistics',
        compare: '/parties/compare',
        getById: (id: string | number) => `/parties/${id}`,
        getBySlug: (slug: string) => `/parties/${slug}`,
        getCandidates: (slug: string) => `/parties/${slug}/candidates`,
        getPolicyPositions: (slug: string) => `/parties/${slug}/policies`,
        getMediaContent: (slug: string) => `/parties/${slug}/media`,
        getCampaignEvents: (slug: string) => `/parties/${slug}/events`,
        getActive: '/parties?status=active',
    },
    auth: {
        login: '/auth/login',
        logout: '/auth/logout',
        register: '/auth/register',
        profile: '/auth/profile',
        refresh: '/auth/refresh',
    },
};

// Utility functions
const buildQueryString = (params: Record<string, unknown> = {}): string => {
    const filteredParams = Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    return new URLSearchParams(filteredParams as Record<string, string>).toString();
};

const buildUrl = (endpoint: string, params: Record<string, unknown> = {}): string => {
    const queryString = buildQueryString(params);
    return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// Helper function to handle pagination metadata
const extractPaginationMeta = (response: any) => {
    if (response.data && typeof response.data === 'object') {
        // Laravel pagination structure
        if (response.data.current_page !== undefined) {
            return {
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                per_page: response.data.per_page,
                total: response.data.total,
                from: response.data.from,
                to: response.data.to,
            };
        }

        // Custom pagination structure
        if (response.data.pagination) {
            return response.data.pagination;
        }
    }

    return null;
};

// Enhanced API response wrapper with better error handling
const handleApiResponseEnhanced = async <T>(
    apiCall: Promise<AxiosResponse<T>>,
    options: {
        extractData?: boolean;
        includeMeta?: boolean;
        customErrorHandler?: (error: AxiosError) => string;
    } = {}
): Promise<ApiResponse<T>> => {
    const { extractData = true, includeMeta = false, customErrorHandler } = options;

    try {
        const response = await apiCall;
        const responseData = response.data as any;

        // Determine the actual data
        let data: T;
        if (extractData && responseData.data !== undefined) {
            data = responseData.data;
        } else {
            data = responseData;
        }

        // Build success response
        const successResponse: ApiSuccessResponse<T> = {
            success: true,
            data,
            message: responseData.message,
        };

        // Include metadata if requested
        if (includeMeta) {
            successResponse.meta = responseData.meta || extractPaginationMeta(responseData);
            successResponse.links = responseData.links;
        }

        return successResponse;
    } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string; errors?: unknown }>;

        // Use custom error handler if provided
        let errorMessage: string;
        if (customErrorHandler) {
            errorMessage = customErrorHandler(axiosError);
        } else {
            errorMessage =
                axiosError.response?.data?.message ??
                axiosError.message ??
                'An error occurred';
        }

        const errorData = axiosError.response?.data?.errors ?? null;

        return {
            success: false,
            message: errorMessage,
            errors: errorData,
            status: axiosError.response?.status,
        };
    }
};

// Specialized API methods for different types of calls
const apiMethods = {
    // GET request with query parameters
    get: <T>(endpoint: string, params: Record<string, unknown> = {}) => {
        const url = buildUrl(endpoint, params);
        return handleApiResponse<T>(apiClient.get(url));
    },

    // POST request
    post: <T>(endpoint: string, data: unknown = {}, params: Record<string, unknown> = {}) => {
        const url = buildUrl(endpoint, params);
        return handleApiResponse<T>(apiClient.post(url, data));
    },

    // PUT request
    put: <T>(endpoint: string, data: unknown = {}, params: Record<string, unknown> = {}) => {
        const url = buildUrl(endpoint, params);
        return handleApiResponse<T>(apiClient.put(url, data));
    },

    // PATCH request
    patch: <T>(endpoint: string, data: unknown = {}, params: Record<string, unknown> = {}) => {
        const url = buildUrl(endpoint, params);
        return handleApiResponse<T>(apiClient.patch(url, data));
    },

    // DELETE request
    delete: <T>(endpoint: string, params: Record<string, unknown> = {}) => {
        const url = buildUrl(endpoint, params);
        return handleApiResponse<T>(apiClient.delete(url));
    },
};

// Type definitions for common API responses
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface FilterOption {
    id: string | number;
    name?: string;
    county?: string;
    party_name?: string;
    party_code?: string;
}

export interface ComparisonFilters {
    position?: string;
    county_id?: string | number;
    party_id?: string | number;
    search?: string;
}

// Export everything
export {
    apiClient,
    handleApiResponse,
    handleApiResponseEnhanced,
    API_ENDPOINTS,
    buildQueryString,
    buildUrl,
    API_CONFIG,
    apiMethods,
    extractPaginationMeta,
};

export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse };

export default apiClient;