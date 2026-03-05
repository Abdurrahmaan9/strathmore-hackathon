// Loading for individual candidate profile
export default function CandidateProfileLoading() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header Skeleton */}
                <div className="relative h-64 bg-gray-200 animate-pulse">
                    <div className="absolute bottom-6 left-6">
                        <div className="w-24 h-24 bg-gray-300 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="p-6">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>

                    {/* Bio Skeleton */}
                    <div className="space-y-3 mb-8">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                    </div>

                    {/* Policy Positions Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4">
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}