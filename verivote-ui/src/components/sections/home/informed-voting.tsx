import React from 'react';
import Link from 'next/link';
import { Search, User, MessageSquare } from 'lucide-react';

const InformedVoting: React.FC = () => {
  const features = [
    {
      icon: <Search className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />,
      title: "Search & Filter",
      description: "Quickly find candidates by name, location, or office."
    },
    {
      icon: <User className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />,
      title: "Candidate Profiles",
      description: "Get detailed information on candidates' backgrounds and platforms."
    },
    {
      icon: <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />,
      title: "Community Voice",
      description: "Establish dialogue with candidates and community members."
    }
  ];

  return (
    <section className="bg-gray-50 py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Header */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              Your Source for Informed Voting
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              VOTE-TRACE KENYA empowers you to make informed choices by providing easy access to reliable candidate information.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
              >
                {/* Icon */}
                <div className="flex justify-center mb-4 md:mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm md:text-base text-black leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mb-8 md:mb-12">
            <Link 
              href="/research"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-black font-semibold py-4 px-8 md:px-12 rounded-full text-base md:text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Start Your Research
            </Link>
          </div>

          {/* Bottom Text */}
          <div className="max-w-2xl mx-auto">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              Explore the candidates and make your voice heard in the upcoming election.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InformedVoting;