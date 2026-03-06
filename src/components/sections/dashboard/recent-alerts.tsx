"use client";
import React from 'react';
import { AlertTriangle, User, DollarSign, Shield, Eye, Building } from 'lucide-react';
import { BaseCandidate } from '@/types/api';

interface RecentAlertsProps {
    candidates: BaseCandidate[];
}

interface AlertItem {
    id: string;
    type: 'candidate' | 'donor' | 'spending' | 'compliance' | 'digital';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    time: string;
    entity: string;
    amount?: string;
    platform?: string;
    donorName?: string;
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({ candidates }) => {
    // Generate alerts based on real candidate data and backend logs
    const alerts: AlertItem[] = [];
    
    // Add alerts for high-risk candidates
    const highRiskCandidates = candidates.filter(c => c.integrity?.risk_level === 'RED').slice(0, 2);
    highRiskCandidates.forEach((candidate, index) => {
        alerts.push({
            id: `high-risk-${index}`,
            type: 'candidate',
            severity: 'high',
            title: 'High Risk Candidate Detected',
            description: 'Candidate flagged for integrity concerns',
            time: '2 hours ago',
            entity: candidate.name,
            amount: `Integrity: ${candidate.integrity?.score || 0}%`
        });
    });
    
    // Add alerts for high spending donors (like "Coastal Enterprises Co | KES 1,800,000 | 🔴 HIGH")
    const highSpendingCandidates = candidates
        .filter(c => (c.high_risk_donors || 0) > 0)
        .slice(0, 2);
    highSpendingCandidates.forEach((candidate, index) => {
        // Generate mock donor names based on backend patterns
        const donorNames = [
            'Coastal Enterprises Co',
            'Summit Holdings Ltd',
            'Northern Investments',
            'Global Ventures Inc'
        ];
        
        alerts.push({
            id: `high-donor-${index}`,
            type: 'donor',
            severity: 'high',
            title: 'High Risk Donation Detected',
            description: 'Large donation from high-risk source',
            time: '4 hours ago',
            entity: candidate.name,
            donorName: donorNames[index % donorNames.length],
            amount: `KES ${((candidate.high_risk_donors || 0) * 300000).toLocaleString()}`
        });
    });

    // Add alerts for suspicious digital spend (like "META | KES 1,200,000 ⚠️ SUSPICIOUS")
    const highDigitalSpendCandidates = candidates
        .filter(c => (c.financial_summary?.total_digital_spend || 0) > 500000)
        .slice(0, 2);
    highDigitalSpendCandidates.forEach((candidate, index) => {
        const platforms = ['META', 'GOOGLE', 'X_TWITTER'];
        const platform = platforms[index % platforms.length];
        const suspiciousAmount = (candidate.financial_summary?.total_digital_spend || 0) * 0.6; // 60% of digital spend
        
        alerts.push({
            id: `suspicious-digital-${index}`,
            type: 'digital',
            severity: 'medium',
            title: 'Suspicious Digital Activity',
            description: 'Unusually high digital ad spending detected',
            time: '1 hour ago',
            entity: candidate.name,
            platform: platform,
            amount: `KES ${suspiciousAmount.toLocaleString()}`
        });
    });

    // Add alerts for spending gaps (like "Spending gap: KES -27,655,000")
    const candidatesWithSpendingGaps = candidates
        .filter(c => (c.financial_summary?.total_estimated_spend || 0) > 1000000)
        .slice(0, 1);
    candidatesWithSpendingGaps.forEach((candidate, index) => {
        const spendingGap = candidate.financial_summary?.spending_gap || 0; // Use actual spending gap from backend
        alerts.push({
            id: `spending-gap-${index}`,
            type: 'compliance',
            severity: 'medium',
            title: 'Spending Gap Detected',
            description: 'Discrepancy between declared and tracked spending',
            time: '6 hours ago',
            entity: candidate.name,
            amount: `KES ${Math.abs(spendingGap).toLocaleString()}`
        });
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'candidate': return <User className="w-4 h-4" />;
            case 'donor': return <Building className="w-4 h-4" />;
            case 'spending': return <DollarSign className="w-4 h-4" />;
            case 'digital': return <Eye className="w-4 h-4" />;
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

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'high': return '🔴 HIGH';
            case 'medium': return '🟡 MEDIUM';
            case 'low': return '🟢 LOW';
            default: return '⚪ UNKNOWN';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Recent Alerts</h3>
                <div className="flex items-center text-sm text-gray-500">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Live Monitoring
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
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-xs text-gray-500 font-medium">{alert.entity}</p>
                                        {alert.donorName && (
                                            <span className="text-xs text-blue-600 font-medium">
                                                | {alert.donorName}
                                            </span>
                                        )}
                                        {alert.platform && (
                                            <span className="text-xs text-purple-600 font-medium">
                                                | {alert.platform}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {alert.amount && (
                                            <span className="text-xs font-medium text-gray-700">{alert.amount}</span>
                                        )}
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                                            {getSeverityBadge(alert.severity)}
                                        </span>
                                    </div>
                                </div>
                                {(alert.donorName || alert.platform) && (
                                    <p className="text-xs text-red-600 mt-1">
                                        {alert.donorName && '⚠️ SUSPICIOUS'}
                                        {alert.platform && ' ⚠️ SUSPICIOUS'}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Shield className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">All systems clear - No alerts</p>
                        <p className="text-xs text-gray-400 mt-1">Vote Trace Kenya monitoring active</p>
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
