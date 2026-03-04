"use client";
import React from 'react';
import { DollarSign, Award, Scale } from 'lucide-react';

interface TransparencyData {
    assetDeclaration: string;
    candidateManifesto: string;
    legalEthicalHistory: string;
}

interface TransparencySectionProps {
    data: TransparencyData;
}

const TransparencyIcon: React.FC<{ type: 'asset' | 'manifesto' | 'legal' }> = ({ type }) => {
    const iconMap = {
        asset: <DollarSign className="w-8 h-8 text-green-600" />,
        manifesto: <Award className="w-8 h-8 text-green-600" />,
        legal: <Scale className="w-8 h-8 text-green-600" />
    };
    return iconMap[type];
};

export const TransparencySection: React.FC<TransparencySectionProps> = ({ data }) => (
    <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Transparency & Declarations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
                <TransparencyIcon type="asset" />
                <h3 className="font-semibold text-gray-800 mt-2 mb-1">Asset Declaration</h3>
                <p className="text-sm text-gray-600">{data.assetDeclaration}</p>
            </div>
            <div className="text-center">
                <TransparencyIcon type="manifesto" />
                <h3 className="font-semibold text-gray-800 mt-2 mb-1">Candidate Manifesto</h3>
                <p className="text-sm text-gray-600">{data.candidateManifesto}</p>
            </div>
            <div className="text-center">
                <TransparencyIcon type="legal" />
                <h3 className="font-semibold text-gray-800 mt-2 mb-1">Legal & Ethical History</h3>
                <p className="text-sm text-gray-600">{data.legalEthicalHistory}</p>
            </div>
        </div>
    </section>
);