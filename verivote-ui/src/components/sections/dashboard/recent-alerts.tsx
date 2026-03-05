"use client";
import React from 'react';
import { AlertTriangle, User, DollarSign, Shield } from 'lucide-react';
import { BaseCandidate } from '@/types/api';

interface RecentAlertsProps {
    candidates: BaseCandidate[];
}

interface AlertItem {
    id: string;
    type: 'candidate' | 'donor' | 'spending' | 'compliance';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    time: string;
    entity: string;
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({ candidates }) => {
    // Generate alerts based on real candidate data
    const alerts: AlertItem[] = [];
    
    // Add alerts for high-risk candidates
    const highRiskCandidates = candidates.filter(c => c.risk_level === 'RED').slice(0, 2);
    highRiskCandidates.forEach((candidate, index) => {
        alerts.push({
            id: `high-risk-${index}`,
            type: 'candidate',
            severity: 'high',
            title: 'High Risk Candidate Detected',
            description: 'Candidate flagged for integrity concerns',
            time: '2 hours ago',
            entity: candidate.name
        });
    });
    
    // Add alerts for high spending
    const highSpendingCandidates = candidates
        .filter(c => (c.total_spend || 0) > 100000)
        .slice(0, 2);
    highSpendingCandidates.forEach((candidate, index) => {
        alerts.push({
            id: `high-spending-${index}`,
            type: 'spending',
            severity: 'medium',
            title: 'High Spending Activity',
            description: 'Unusually high campaign spending detected',
            time: '4 hours ago',
            entity: candidate.name
        });
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'candidate': return <User className="w-4 h-4" />;
            case 'donor': return <DollarSign className="w-4 h-4" />;
            case 'spending': return <DollarSign className="w-4 h-4" />;
            case 'compliance': return <Shield className="w-4 h-4" />;
            default: return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-600 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-600 border-blue-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Recent Alerts</h3>
                <div className="flex items-center text-sm text-gray-500">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    System Monitoring
                </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
                {alerts.length > 0 ? (
                    alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                                {getIcon(alert.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-black text-sm">{alert.title}</h4>
                                    <span className="text-xs text-gray-500">{alert.time}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{alert.description}</p>
                                <p className="text-xs text-gray-500 font-medium">{alert.entity}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">No alerts at this time</p>
                    </div>
                )}
            </div>

            {/* View All Link */}
            {alerts.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View All Alerts →
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecentAlerts;
