"use client";
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import MainLayout from "../components/layouts/main-layout";
import { Breadcrumb } from '@/components/common/breadcrumb';
import OverviewStats from '../components/sections/dashboard/overview-stats';
import CandidateIntegrityChart from '../components/sections/dashboard/candidate-integrity-chart';
import SpendingTrends from '../components/sections/dashboard/spending-trends';
import RecentAlerts from '../components/sections/dashboard/recent-alerts';
import TopCandidates from '../components/sections/dashboard/top-candidates';
import useCandidates from '@/hooks/use-candidates';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  // Custom hooks for candidates data and search (updated for Vote Trace Kenya API)
  const {
    candidates,
    loading,
    error,
    fetchCandidates,
    clearError,
  } = useCandidates();

  // Set client-side flag and load initial data
  useEffect(() => {
    setIsClient(true);
    fetchCandidates();
  }, [fetchCandidates]);

  // Handle try again for errors
  const handleTryAgain = () => {
    if (!isClient) return;
    clearError();
    fetchCandidates();
  };

  // Don't render interactive elements during SSR
  if (!isClient) {
    return (
      <MainLayout className="bg-white text-black">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <span className="ml-3 text-gray-400">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error component
  if (error) {
    return (
      <MainLayout className="bg-gray-900 text-black">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={handleTryAgain}
              className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700"
              type="button"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout className="bg-white text-black">
      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <span className="ml-3 text-gray-400">Loading...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <OverviewStats candidates={candidates} />
            
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <CandidateIntegrityChart candidates={candidates} />
                <SpendingTrends candidates={candidates} />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <RecentAlerts candidates={candidates} />
                <TopCandidates candidates={candidates} />
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}