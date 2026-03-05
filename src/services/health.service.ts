// services/health.service.ts
// Service for monitoring backend service health

import { apiClient, handleApiResponse, API_ENDPOINTS, apiMethods, type ApiResponse } from '@/lib/api';

// Define interfaces for health check data
export interface ServiceHealth {
    service: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
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
    status: 'healthy' | 'unhealthy' | 'degraded';
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

class HealthService {
    /**
     * Check reconciliation engine health
     */
    async checkReconciliationHealth(): Promise<ApiResponse<ServiceHealth>> {
        try {
            const response = await apiClient.get(API_ENDPOINTS.health.reconciliation);
            const startTime = Date.now();
            
            return {
                success: true,
                data: {
                    service: 'reconciliation',
                    status: response.data?.status || 'healthy',
                    timestamp: new Date().toISOString(),
                    response_time: Date.now() - startTime,
                    details: response.data?.details || {},
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Reconciliation service health check failed',
            } as ApiResponse<ServiceHealth>;
        }
    }

    /**
     * Check digital spend service health
     */
    async checkDigitalHealth(): Promise<ApiResponse<ServiceHealth>> {
        try {
            const response = await apiClient.get(API_ENDPOINTS.health.digital);
            const startTime = Date.now();
            
            return {
                success: true,
                data: {
                    service: 'digital',
                    status: response.data?.status || 'healthy',
                    timestamp: new Date().toISOString(),
                    response_time: Date.now() - startTime,
                    details: response.data?.details || {},
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Digital service health check failed',
            } as ApiResponse<ServiceHealth>;
        }
    }

    /**
     * Check donor service health
     */
    async checkDonorHealth(): Promise<ApiResponse<ServiceHealth>> {
        try {
            const response = await apiClient.get(API_ENDPOINTS.health.donors);
            const startTime = Date.now();
            
            return {
                success: true,
                data: {
                    service: 'donors',
                    status: response.data?.status || 'healthy',
                    timestamp: new Date().toISOString(),
                    response_time: Date.now() - startTime,
                    details: response.data?.details || {},
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Donor service health check failed',
            } as ApiResponse<ServiceHealth>;
        }
    }

    /**
     * Get overall system health status
     */
    async getOverallHealth(): Promise<ApiResponse<OverallHealthStatus>> {
        try {
            const [reconciliation, digital, donors] = await Promise.all([
                this.checkReconciliationHealth(),
                this.checkDigitalHealth(),
                this.checkDonorHealth(),
            ]);

            const services = {
                reconciliation: reconciliation.success ? reconciliation.data! : {
                    service: 'reconciliation',
                    status: 'unhealthy' as const,
                    timestamp: new Date().toISOString(),
                    response_time: 0,
                    error: reconciliation.message,
                },
                digital: digital.success ? digital.data! : {
                    service: 'digital',
                    status: 'unhealthy' as const,
                    timestamp: new Date().toISOString(),
                    response_time: 0,
                    error: digital.message,
                },
                donors: donors.success ? donors.data! : {
                    service: 'donors',
                    status: 'unhealthy' as const,
                    timestamp: new Date().toISOString(),
                    response_time: 0,
                    error: donors.message,
                },
            };

            const healthyServices = Object.values(services).filter(s => s.status === 'healthy').length;
            const unhealthyServices = Object.values(services).filter(s => s.status === 'unhealthy').length;
            const degradedServices = Object.values(services).filter(s => s.status === 'degraded').length;

            let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
            if (unhealthyServices > 0) {
                overallStatus = 'unhealthy';
            } else if (degradedServices > 0) {
                overallStatus = 'degraded';
            }

            return {
                success: true,
                data: {
                    status: overallStatus,
                    timestamp: new Date().toISOString(),
                    services,
                    summary: {
                        total_services: 3,
                        healthy_services: healthyServices,
                        unhealthy_services: unhealthyServices,
                        degraded_services: degradedServices,
                    },
                    uptime: {
                        reconciliation: 0, // Would be calculated from actual uptime data
                        digital: 0,
                        donors: 0,
                    },
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get overall health status',
            };
        }
    }

    /**
     * Test API connectivity
     */
    async testConnectivity(): Promise<ApiResponse<{
        api_base_url: string;
        connected: boolean;
        response_time: number;
        timestamp: string;
    }>> {
        try {
            const startTime = Date.now();
            await apiClient.get('/health/ping');
            const responseTime = Date.now() - startTime;

            return {
                success: true,
                data: {
                    api_base_url: apiClient.defaults.baseURL || 'Unknown',
                    connected: true,
                    response_time: responseTime,
                    timestamp: new Date().toISOString(),
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'API connectivity test failed',
            } as ApiResponse<{
                api_base_url: string;
                connected: boolean;
                response_time: number;
                timestamp: string;
            }>;
        }
    }

    /**
     * Get service metrics and performance data
     */
    async getServiceMetrics(): Promise<ApiResponse<{
        services: {
            [key: string]: {
                request_count: number;
                average_response_time: number;
                error_rate: number;
                last_updated: string;
            };
        };
        system: {
            total_requests: number;
            total_errors: number;
            average_response_time: number;
            uptime_percentage: number;
        };
    }>> {
        try {
            return apiMethods.get('/health/metrics');
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch service metrics',
            };
        }
    }

    /**
     * Get recent system events and alerts
     */
    async getSystemAlerts(): Promise<ApiResponse<{
        alerts: Array<{
            id: string;
            service: string;
            severity: 'info' | 'warning' | 'error' | 'critical';
            message: string;
            timestamp: string;
            resolved?: boolean;
            resolved_at?: string;
        }>;
        total_alerts: number;
        unresolved_alerts: number;
    }>> {
        try {
            return apiMethods.get('/health/alerts');
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch system alerts',
            };
        }
    }
}

// Export a singleton instance
const healthService = new HealthService();
export default healthService;

// Named exports for individual methods if needed
export { HealthService };
