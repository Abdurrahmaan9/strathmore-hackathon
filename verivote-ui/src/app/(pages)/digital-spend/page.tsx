'use client';

import React, { useState, useEffect } from 'react';
import digitalService from '@/services/digital.service';
import { DigitalSpendBreakdown, DigitalStatistics, DigitalPlatform } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';

const DIGITAL_PLATFORM_COLORS = {
    meta: '#1877F2',
    google: '#4285F4',
    x_twitter: '#000000',
};

export default function DigitalSpendPage() {
    const [statistics, setStatistics] = useState<DigitalStatistics | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
    const [candidateBreakdown, setCandidateBreakdown] = useState<DigitalSpendBreakdown | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchDigitalStatistics();
    }, []);

    useEffect(() => {
        if (selectedCandidate) {
            fetchCandidateBreakdown(selectedCandidate);
        }
    }, [selectedCandidate]);

    const fetchDigitalStatistics = async () => {
        try {
            setLoading(true);
            const response = await digitalService.getDigitalStatistics();
            if (response.success && response.data) {
                setStatistics(response.data);
            } else {
                setError(response.message || 'Failed to fetch digital statistics');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidateBreakdown = async (candidateId: number) => {
        try {
            const response = await digitalService.getCandidateDigitalBreakdown(candidateId);
            if (response.success && response.data) {
                setCandidateBreakdown(response.data);
            } else {
                setError(response.message || 'Failed to fetch candidate breakdown');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleFileUpload = async () => {
        if (!uploadFile) return;

        try {
            setUploading(true);
            const response = await digitalService.importDigitalData(uploadFile);
            if (response.success) {
                alert('Digital data imported successfully!');
                setUploadFile(null);
                fetchDigitalStatistics();
                if (selectedCandidate) {
                    fetchCandidateBreakdown(selectedCandidate);
                }
            } else {
                setError(response.message || 'Failed to import digital data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setUploading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatPlatformName = (platform: string) => {
        return platform.charAt(0).toUpperCase() + platform.slice(1).replace('_', ' ');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Digital Spend Analysis</h1>
                    <p className="text-black mt-2">Monitor and analyze digital advertising spend across platforms</p>
                </div>
                <div className="flex gap-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <Input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="mb-2"
                        />
                        <Button
                            onClick={handleFileUpload}
                            disabled={!uploadFile || uploading}
                            className="w-full"
                        >
                            {uploading ? 'Uploading...' : 'Import CSV'}
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertTitle className="text-red-800">Error</AlertTitle>
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
            )}

            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-black">Total Digital Spend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(statistics.total_spend)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-black">Meta Spend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(statistics.by_platform.meta)}
                            </div>
                            <div className="text-sm text-gray-500">
                                {((statistics.by_platform.meta / statistics.total_spend) * 100).toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-black">Google Spend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(statistics.by_platform.google)}
                            </div>
                            <div className="text-sm text-gray-500">
                                {((statistics.by_platform.google / statistics.total_spend) * 100).toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-black">X/Twitter Spend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-800">
                                {formatCurrency(statistics.by_platform.x_twitter)}
                            </div>
                            <div className="text-sm text-gray-500">
                                {((statistics.by_platform.x_twitter / statistics.total_spend) * 100).toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="candidates">Candidates</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="comparison">Comparison</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Spend by Platform</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Meta', value: statistics?.by_platform.meta || 0 },
                                                { name: 'Google', value: statistics?.by_platform.google || 0 },
                                                { name: 'X/Twitter', value: statistics?.by_platform.x_twitter || 0 },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            <Cell fill={DIGITAL_PLATFORM_COLORS.meta} />
                                            <Cell fill={DIGITAL_PLATFORM_COLORS.google} />
                                            <Cell fill={DIGITAL_PLATFORM_COLORS.x_twitter} />
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Candidates by Digital Spend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={statistics?.by_candidate.slice(0, 5)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="candidate_name" />
                                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                        <Bar dataKey="total_spend" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="candidates" className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Label htmlFor="candidate-select">Select Candidate:</Label>
                        <Select
                            value={selectedCandidate?.toString() || ''}
                            onValueChange={(value) => setSelectedCandidate(value ? parseInt(value) : null)}
                        >
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Choose a candidate" />
                            </SelectTrigger>
                            <SelectContent>
                                {statistics?.by_candidate.map((candidate) => (
                                    <SelectItem key={candidate.candidate_id} value={candidate.candidate_id.toString()}>
                                        {candidate.candidate_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {candidateBreakdown && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Candidate Digital Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span>Meta</span>
                                                <span className="font-semibold">{formatCurrency(candidateBreakdown.meta_spend)}</span>
                                            </div>
                                            <Progress 
                                                value={(candidateBreakdown.meta_spend / candidateBreakdown.total_digital_spend) * 100} 
                                                className="h-2"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span>Google</span>
                                                <span className="font-semibold">{formatCurrency(candidateBreakdown.google_spend)}</span>
                                            </div>
                                            <Progress 
                                                value={(candidateBreakdown.google_spend / candidateBreakdown.total_digital_spend) * 100} 
                                                className="h-2"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span>X/Twitter</span>
                                                <span className="font-semibold">{formatCurrency(candidateBreakdown.x_twitter_spend)}</span>
                                            </div>
                                            <Progress 
                                                value={(candidateBreakdown.x_twitter_spend / candidateBreakdown.total_digital_spend) * 100} 
                                                className="h-2"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Platform Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={[
                                            { platform: 'Meta', spend: candidateBreakdown.meta_spend },
                                            { platform: 'Google', spend: candidateBreakdown.google_spend },
                                            { platform: 'X/Twitter', spend: candidateBreakdown.x_twitter_spend },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="platform" />
                                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                            <Bar dataKey="spend" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Digital Spend Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={statistics?.trend_data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="platform_breakdown.meta" 
                                        stroke={DIGITAL_PLATFORM_COLORS.meta}
                                        name="Meta"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="platform_breakdown.google" 
                                        stroke={DIGITAL_PLATFORM_COLORS.google}
                                        name="Google"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="platform_breakdown.x_twitter" 
                                        stroke={DIGITAL_PLATFORM_COLORS.x_twitter}
                                        name="X/Twitter"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Candidate Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={statistics?.by_candidate}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="candidate_name" />
                                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Legend />
                                    <Bar dataKey="platform_breakdown.meta" stackId="a" fill={DIGITAL_PLATFORM_COLORS.meta} name="Meta" />
                                    <Bar dataKey="platform_breakdown.google" stackId="a" fill={DIGITAL_PLATFORM_COLORS.google} name="Google" />
                                    <Bar dataKey="platform_breakdown.x_twitter" stackId="a" fill={DIGITAL_PLATFORM_COLORS.x_twitter} name="X/Twitter" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
