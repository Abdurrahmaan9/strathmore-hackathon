"use client";
import React from 'react';
import { ChevronDown, ChevronUp, Play } from 'lucide-react';

interface IssuePosition {
    id: string;
    issue: string;
    stance: string;
    quote?: string;
    source?: string;
    date?: string;
}

interface IssueCardProps {
    position: IssuePosition;
    candidateName: string;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
    position,
    candidateName,
    isExpanded,
    onToggle
}) => (
    <div className={`border rounded-lg transition-all duration-300 ${isExpanded ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
        <button
            onClick={() => onToggle(position.id)}
            className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 rounded-t-lg"
        >
            <span className="font-semibold text-gray-800">{position.issue}</span>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {isExpanded && (
            <div className="px-4 pb-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="mb-3">
                        <span className="text-sm font-medium text-gray-600">{`Candidate's Stance:`}</span>
                        <p className="text-gray-800 mt-1">{position.stance}</p>
                    </div>
                    {position.quote && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <div className="text-sm font-medium text-yellow-800 mb-1">{candidateName}</div>
                            <blockquote className="text-gray-700 italic">&quot;{position.quote}&quot;</blockquote>
                            {position.source && position.date && (
                                <div className="text-xs text-gray-500 mt-2">
                                    {position.source} - {position.date}
                                </div>
                            )}
                        </div>
                    )}
                    {position.id === 'youth-1' && (
                        <div className="mt-3">
                            <a href="#" className="text-red-600 text-sm hover:underline flex items-center">
                                <Play className="w-4 h-4 mr-1" />
                                TV Interview: Jane Mwangi on youth empowerment
                            </a>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
);