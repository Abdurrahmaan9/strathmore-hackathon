import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                {/* VeriVote Logo */}
                <div className="mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center mr-3">
                            <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
                                <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">VeriVote</span>
                    </div>
                </div>

                {/* Loading Spinner */}
                <div className="mb-6">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                </div>

                {/* Loading Text */}
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h2>
                <p className="text-gray-600 max-w-sm mx-auto">
                    {`We're preparing the latest candidate information for you.`}
                </p>

                {/* Progress Bar */}
                <div className="mt-8 max-w-xs mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}