import React from 'react';
import Link from 'next/link';
import { Shield, Scale, Unlock, ChevronRight } from 'lucide-react';

const GetElectionReady: React.FC = () => {
    const electionResources = [
        {
            title: "The Voting Process",
            href: "/voting-process"
        },
        {
            title: "Polling Locations",
            href: "/polling-locations"
        },
        {
            title: "Key Election Issues",
            href: "/election-issues"
        }
    ];

    const commitmentFeatures = [
        {
            icon: <Shield className="w-12 h-12 md:w-16 md:h-16 text-black" />,
            title: "Data Verified",
            description: "We go through a comprehensive verification process to ensure the accuracy of the information you see.",
            bgColor: "bg-blue-600"
        },
        {
            icon: <Scale className="w-12 h-12 md:w-16 md:h-16 text-black" />,
            title: "Non-Partisan",
            description: "We are committed to neutrality. Our platform provides information without political bias.",
            bgColor: "bg-blue-600"
        },
        {
            icon: <Unlock className="w-12 h-12 md:w-16 md:h-16 text-black" />,
            title: "Open Access",
            description: "All information on our platform is freely available to everyone, promoting transparency in the electoral process.",
            bgColor: "bg-blue-600"
        }
    ];

    return (
        <section className="bg-gray-50 py-12 md:py-16 lg:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Get Election Ready Section */}
                <div className="text-center mb-12 md:mb-20">
                    <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
                        Get Election Ready
                    </h2>
                    <p className="text-base md:text-xl lg:text-2xl text-gray-700 mb-8 md:mb-12 max-w-3xl mx-auto">
                        Everything You Need to Know to Vote
                    </p>

                    {/* Resource Buttons - Mobile: Stack, Desktop: Grid */}
                    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-6 lg:gap-8 mb-6 md:mb-10">
                        {electionResources.map((resource, index) => (
                            <Link
                                key={index}
                                href={resource.href}
                                className="block w-full max-w-md mx-auto md:max-w-none bg-blue-800 hover:bg-blue-900 text-black font-semibold py-4 md:py-6 px-6 md:px-8 rounded-lg md:rounded-xl transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <span className="text-base md:text-lg">{resource.title}</span>
                            </Link>
                        ))}
                    </div>

                    {/* View More Resources Link */}
                    <Link
                        href="/resources"
                        className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm md:text-lg transition-colors duration-200"
                    >
                        View more resources
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1" />
                    </Link>
                </div>

                {/* Our Commitment Section */}
                <div className="text-center mb-12 md:mb-20">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-8">
                        Our Commitment to You
                    </h2>
                    <p className="text-sm md:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto mb-8 md:mb-16">
                        {`Your trust is important to us. Here's how we ensure the integrity of our platform`}
                    </p>

                    {/* Commitment Features - Mobile: Stack, Desktop: Grid */}
                    <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8 lg:gap-12">
                        {commitmentFeatures.map((feature, index) => (
                            <div key={index} className="text-center group">
                                {/* Icon */}
                                <div className="flex justify-center mb-4 md:mb-8">
                                    <div className={`w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 ${feature.bgColor} rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105`}>
                                        {React.cloneElement(feature.icon, {
                                            className: "w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-black"
                                        })}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-6">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonial */}
                <div className="mb-8 md:mb-16">
                    <div className="bg-yellow-100 rounded-lg md:rounded-2xl p-6 md:p-10 lg:p-12 shadow-sm hover:shadow-md transition-shadow duration-300 max-w-2xl mx-auto">
                        <div className="flex items-start space-x-4 md:space-x-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 md:w-16 md:h-16 lg:w-18 lg:h-18 bg-gray-400 rounded-full flex items-center justify-center shadow-md">
                                    <span className="text-black font-bold text-sm md:text-lg">AU</span>
                                </div>
                            </div>

                            {/* Testimonial Content */}
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-sm md:text-lg lg:text-xl mb-2 md:mb-4">
                                    Anonymous User
                                </h4>
                                <p className="text-sm md:text-lg lg:text-xl text-gray-700 leading-relaxed mb-2 md:mb-4 italic">
                                    {`"VOTE-TRACE KENYA has become my go-to source for reliable candidate information. I trust the data, and it has made me a more informed voter."`}
                                </p>
                                <p className="text-xs md:text-sm lg:text-base text-gray-500 italic">
                                    3rd April, 2025
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center">
                    <Link
                        href="/candidates"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-black font-semibold py-4 px-8 md:py-6 md:px-16 lg:py-8 lg:px-20 rounded-full text-base md:text-xl lg:text-2xl transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                    >
                        Explore Candidates Now
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default GetElectionReady;