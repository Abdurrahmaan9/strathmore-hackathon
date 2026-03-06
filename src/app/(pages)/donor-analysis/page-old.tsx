// 'use client';

// import React, { useState, useEffect } from 'react';
// import donorService from '../../../services/donor.service';
// import { DonorRiskAnalysis, DonorStatistics, RiskLevel, DonorType } from '../../../types/api';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Progress } from '@/components/ui/progress';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { 
//     BarChart, 
//     Bar, 
//     XAxis, 
//     YAxis, 
//     CartesianGrid, 
//     Tooltip, 
//     ResponsiveContainer,
//     PieChart,
//     Pie,
//     Cell,
//     LineChart,
//     Line,
//     Legend
// } from 'recharts';

// const RISK_LEVEL_COLORS = {
//     GREEN: '#10B981',
//     AMBER: '#F59E0B',
//     RED: '#EF4444',
// };

// const RISK_LEVEL_BADGE_COLORS = {
//     GREEN: 'bg-green-100 text-green-800',
//     AMBER: 'bg-yellow-100 text-yellow-800',
//     RED: 'bg-red-100 text-red-800',
// };

// export default function DonorAnalysisPage() {
//     const [statistics, setStatistics] = useState<DonorStatistics | null>(null);
//     const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
//     const [candidateAnalysis, setCandidateAnalysis] = useState<DonorRiskAnalysis | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [uploadFile, setUploadFile] = useState<File | null>(null);
//     const [uploading, setUploading] = useState(false);

//     useEffect(() => {
//         fetchDonorStatistics();
//     }, []);

//     useEffect(() => {
//         if (selectedCandidate) {
//             fetchCandidateAnalysis(selectedCandidate);
//         }
//     }, [selectedCandidate]);

//     const fetchDonorStatistics = async () => {
//         try {
//             setLoading(true);
//             const response = await donorService.getDonorStatistics();
//             if (response.success && response.data) {
//                 setStatistics(response.data);
//             } else {
//                 setError(response.message || 'Failed to fetch donor statistics');
//             }
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'An error occurred');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchCandidateAnalysis = async (candidateId: number) => {
//         try {
//             const response = await donorService.getCandidateDonors(candidateId);
//             if (response.success && response.data) {
//                 setCandidateAnalysis(response.data);
//             } else {
//                 setError(response.message || 'Failed to fetch candidate analysis');
//             }
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'An error occurred');
//         }
//     };

//     const handleFileUpload = async () => {
//         if (!uploadFile) return;

//         try {
//             setUploading(true);
//             const response = await donorService.importDonorData(uploadFile);
//             if (response.success) {
//                 alert('Donor data imported successfully!');
//                 setUploadFile(null);
//                 fetchDonorStatistics();
//                 if (selectedCandidate) {
//                     fetchCandidateAnalysis(selectedCandidate);
//                 }
//             } else {
//                 setError(response.message || 'Failed to import donor data');
//             }
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'An error occurred');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const formatCurrency = (amount: number) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//         }).format(amount);
//     };

//     const getRiskLevelBadge = (level: RiskLevel) => {
//         return (
//             <Badge className={RISK_LEVEL_BADGE_COLORS[level]}>
//                 {level}
//             </Badge>
//         );
//     };

//     if (loading) {
//         return (
//             <div className="container mx-auto px-4 py-8">
//                 <div className="animate-pulse">
//                     <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                         {[...Array(4)].map((_, i) => (
//                             <div key={i} className="h-32 bg-gray-200 rounded"></div>
//                         ))}
//                     </div>
//                     <div className="h-96 bg-gray-200 rounded"></div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <div className="flex justify-between items-center mb-8">
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-900">Donor Risk Analysis</h1>
//                     <p className="text-black mt-2">Monitor donor contributions and identify potential risks</p>
//                 </div>
//                 <div className="flex gap-4">
//                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
//                         <Input
//                             type="file"
//                             accept=".csv"
//                             onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
//                             className="mb-2"
//                         />
//                         <Button
//                             onClick={handleFileUpload}
//                             disabled={!uploadFile || uploading}
//                             className="w-full"
//                         >
//                             {uploading ? 'Uploading...' : 'Import CSV'}
//                         </Button>
//                     </div>
//                 </div>
//             </div>

//             {error && (
//                 <Alert className="mb-6 border-red-200 bg-red-50">
//                     <AlertTitle className="text-red-800">Error</AlertTitle>
//                     <AlertDescription className="text-red-700">{error}</AlertDescription>
//                 </Alert>
//             )}

//             {statistics && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                     <Card>
//                         <CardHeader className="pb-2">
//                             <CardTitle className="text-sm font-medium text-black">Total Donors</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{statistics.total_donors.toLocaleString()}</div>
//                         </CardContent>
//                     </Card>
//                     <Card>
//                         <CardHeader className="pb-2">
//                             <CardTitle className="text-sm font-medium text-black">Total Amount</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{formatCurrency(statistics.total_amount)}</div>
//                         </CardContent>
//                     </Card>
//                     <Card>
//                         <CardHeader className="pb-2">
//                             <CardTitle className="text-sm font-medium text-black">Average Donation</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{formatCurrency(statistics.average_donation)}</div>
//                         </CardContent>
//                     </Card>
//                     <Card>
//                         <CardHeader className="pb-2">
//                             <CardTitle className="text-sm font-medium text-black">High Risk Donors</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold text-red-600">
//                                 {statistics.risk_distribution.red.count}
//                             </div>
//                             <div className="text-sm text-gray-500">
//                                 {statistics.risk_distribution.red.percentage.toFixed(1)}%
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>
//             )}

//             <Tabs defaultValue="overview" className="space-y-6">
//                 <TabsList>
//                     <TabsTrigger value="overview">Overview</TabsTrigger>
//                     <TabsTrigger value="candidates">Candidates</TabsTrigger>
//                     <TabsTrigger value="high-risk">High Risk</TabsTrigger>
//                     <TabsTrigger value="briefcase">Briefcase Companies</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="overview" className="space-y-6">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                         <Card>
//                             <CardHeader>
//                                 <CardTitle>Risk Distribution</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <ResponsiveContainer width="100%" height={300}>
//                                     <PieChart>
//                                         <Pie
//                                             data={[
//                                                 { name: 'Green', value: statistics?.risk_distribution.green.count || 0 },
//                                                 { name: 'Amber', value: statistics?.risk_distribution.amber.count || 0 },
//                                                 { name: 'Red', value: statistics?.risk_distribution.red.count || 0 },
//                                             ]}
//                                             cx="50%"
//                                             cy="50%"
//                                             labelLine={false}
//                                             label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                                             outerRadius={80}
//                                             fill="#8884d8"
//                                             dataKey="value"
//                                         >
//                                             <Cell fill={RISK_LEVEL_COLORS.GREEN} />
//                                             <Cell fill={RISK_LEVEL_COLORS.AMBER} />
//                                             <Cell fill={RISK_LEVEL_COLORS.RED} />
//                                         </Pie>
//                                         <Tooltip />
//                                     </PieChart>
//                                 </ResponsiveContainer>
//                             </CardContent>
//                         </Card>

//                         <Card>
//                             <CardHeader>
//                                 <CardTitle>Donor Types</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <ResponsiveContainer width="100%" height={300}>
//                                     <BarChart data={[
//                                         { type: 'Individual', count: statistics?.donor_types.individual.count || 0 },
//                                         { type: 'Company', count: statistics?.donor_types.company.count || 0 },
//                                         { type: 'Organization', count: statistics?.donor_types.organization.count || 0 },
//                                         { type: 'Government', count: statistics?.donor_types.government.count || 0 },
//                                         { type: 'Other', count: statistics?.donor_types.other.count || 0 },
//                                     ]}>
//                                         <CartesianGrid strokeDasharray="3 3" />
//                                         <XAxis dataKey="type" />
//                                         <YAxis />
//                                         <Tooltip />
//                                         <Bar dataKey="count" fill="#8884d8" />
//                                     </BarChart>
//                                 </ResponsiveContainer>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </TabsContent>

//                 <TabsContent value="candidates" className="space-y-6">
//                     <div className="flex items-center gap-4 mb-6">
//                         <Label htmlFor="candidate-select">Select Candidate:</Label>
//                         <Select
//                             value={selectedCandidate?.toString() || ''}
//                             onValueChange={(value) => setSelectedCandidate(value ? parseInt(value) : null)}
//                         >
//                             <SelectTrigger className="w-64">
//                                 <SelectValue placeholder="Choose a candidate" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {statistics?.top_donors.map((donor) => (
//                                     <SelectItem key={donor.candidate_id} value={donor.candidate_id.toString()}>
//                                         Candidate {donor.candidate_id}
//                                     </SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>

//                     {candidateAnalysis && (
//                         <div className="space-y-6">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="text-lg">Risk Summary</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="space-y-4">
//                                             <div className="flex justify-between items-center">
//                                                 <span>Overall Risk Level</span>
//                                                 {getRiskLevelBadge(candidateAnalysis.risk_summary.overall_risk_level)}
//                                             </div>
//                                             <div>
//                                                 <div className="flex justify-between mb-2">
//                                                     <span>Compliance Score</span>
//                                                     <span className="font-semibold">{candidateAnalysis.risk_summary.compliance_score}%</span>
//                                                 </div>
//                                                 <Progress value={candidateAnalysis.risk_summary.compliance_score} className="h-2" />
//                                             </div>
//                                             <div>
//                                                 <span className="text-sm text-black">Red Flags: {candidateAnalysis.risk_summary.red_flags.length}</span>
//                                             </div>
//                                         </div>
//                                     </CardContent>
//                                 </Card>

//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="text-lg">Donor Breakdown</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="space-y-2">
//                                             <div className="flex justify-between">
//                                                 <span>Total Donors</span>
//                                                 <span className="font-semibold">{candidateAnalysis.total_donors}</span>
//                                             </div>
//                                             <div className="flex justify-between">
//                                                 <span>Total Amount</span>
//                                                 <span className="font-semibold">{formatCurrency(candidateAnalysis.total_amount)}</span>
//                                             </div>
//                                             <div className="flex justify-between">
//                                                 <span>High Risk Count</span>
//                                                 <span className="font-semibold text-red-600">{candidateAnalysis.risk_breakdown.red.count}</span>
//                                             </div>
//                                             <div className="flex justify-between">
//                                                 <span>Briefcase Companies</span>
//                                                 <span className="font-semibold text-orange-600">{candidateAnalysis.briefcase_companies.length}</span>
//                                             </div>
//                                         </div>
//                                     </CardContent>
//                                 </Card>

//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="text-lg">Risk Distribution</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="space-y-3">
//                                             <div>
//                                                 <div className="flex justify-between mb-1">
//                                                     <span className="text-green-600">Green</span>
//                                                     <span>{candidateAnalysis.risk_breakdown.green.percentage.toFixed(1)}%</span>
//                                                 </div>
//                                                 <Progress value={candidateAnalysis.risk_breakdown.green.percentage} className="h-2" />
//                                             </div>
//                                             <div>
//                                                 <div className="flex justify-between mb-1">
//                                                     <span className="text-yellow-600">Amber</span>
//                                                     <span>{candidateAnalysis.risk_breakdown.amber.percentage.toFixed(1)}%</span>
//                                                 </div>
//                                                 <Progress value={candidateAnalysis.risk_breakdown.amber.percentage} className="h-2" />
//                                             </div>
//                                             <div>
//                                                 <div className="flex justify-between mb-1">
//                                                     <span className="text-red-600">Red</span>
//                                                     <span>{candidateAnalysis.risk_breakdown.red.percentage.toFixed(1)}%</span>
//                                                 </div>
//                                                 <Progress value={candidateAnalysis.risk_breakdown.red.percentage} className="h-2" />
//                                             </div>
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {candidateAnalysis.risk_summary.red_flags.length > 0 && (
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="text-lg text-red-600">Red Flags</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <ul className="space-y-2">
//                                             {candidateAnalysis.risk_summary.red_flags.map((flag, index) => (
//                                                 <li key={index} className="flex items-center gap-2">
//                                                     <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//                                                     <span className="text-sm">{flag}</span>
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     </CardContent>
//                                 </Card>
//                             )}
//                         </div>
//                     )}
//                 </TabsContent>

//                 <TabsContent value="high-risk" className="space-y-6">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>High Risk Donors</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <Table>
//                                 <TableHeader>
//                                     <TableRow>
//                                         <TableHead>Donor Name</TableHead>
//                                         <TableHead>Type</TableHead>
//                                         <TableHead>Amount</TableHead>
//                                         <TableHead>Risk Level</TableHead>
//                                         <TableHead>Risk Factors</TableHead>
//                                     </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                     {statistics?.top_donors
//                                         .filter(donor => donor.risk_level === 'RED')
//                                         .slice(0, 10)
//                                         .map((donor, index) => (
//                                             <TableRow key={index}>
//                                                 <TableCell className="font-medium">{donor.donor_name}</TableCell>
//                                                 <TableCell>{donor.donor_type}</TableCell>
//                                                 <TableCell>{formatCurrency(donor.amount)}</TableCell>
//                                                 <TableCell>{getRiskLevelBadge(donor.risk_level)}</TableCell>
//                                                 <TableCell>
//                                                     <div className="flex flex-wrap gap-1">
//                                                         {/* Risk factors would come from detailed donor data */}
//                                                         <Badge variant="outline">High Amount</Badge>
//                                                     </div>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 <TabsContent value="briefcase" className="space-y-6">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Briefcase Companies</CardTitle>
//                             <p className="text-sm text-black">
//                                 Companies that may exist primarily for political financing
//                             </p>
//                         </CardHeader>
//                         <CardContent>
//                             <Table>
//                                 <TableHeader>
//                                     <TableRow>
//                                         <TableHead>Company Name</TableHead>
//                                         <TableHead>Amount</TableHead>
//                                         <TableHead>Candidate</TableHead>
//                                         <TableHead>Risk Factors</TableHead>
//                                     </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                     {statistics?.briefcase_companies.map((company, index) => (
//                                         <TableRow key={index}>
//                                             <TableCell className="font-medium">{company.company_name}</TableCell>
//                                             <TableCell>{formatCurrency(company.amount)}</TableCell>
//                                             <TableCell>Candidate {company.candidate_id}</TableCell>
//                                             <TableCell>
//                                                 <div className="flex flex-wrap gap-1">
//                                                     {company.risk_factors.map((factor, factorIndex) => (
//                                                         <Badge key={factorIndex} variant="outline" className="text-xs">
//                                                             {factor}
//                                                         </Badge>
//                                                     ))}
//                                                 </div>
//                                             </TableCell>
//                                         </TableRow>
//                                     ))}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// }
