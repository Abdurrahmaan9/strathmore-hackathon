export default function CandidatesLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-8">
                {/* Title Skeleton */}
                <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>

            {/* Candidates Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}