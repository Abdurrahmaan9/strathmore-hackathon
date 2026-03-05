"use client";
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableSectionProps {
    id: string;
    title: string;
    content: string | string[];
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
    id,
    title,
    content,
    isExpanded,
    onToggle
}) => (
    <div className="mb-3">
        <button
            onClick={() => onToggle(id)}
            className="w-full bg-blue-600 text-black p-4 rounded-lg flex justify-between items-center hover:bg-blue-700 transition-colors"
        >
            <span className="text-lg font-semibold uppercase tracking-wide">{title}</span>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {isExpanded && (
            <div className="bg-white border border-gray-200 rounded-b-lg p-6 mt-1">
                {Array.isArray(content) ? (
                    <ul className="space-y-3">
                        {content.map((item, index) => (
                            <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-700 leading-relaxed">{content}</p>
                )}
            </div>
        )}
    </div>
);