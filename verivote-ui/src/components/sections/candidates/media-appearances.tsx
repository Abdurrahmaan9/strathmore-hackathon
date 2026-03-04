"use client";
import React from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface MediaAppearance {
    id: string;
    title: string;
    type: 'interview' | 'speech' | 'debate';
    url: string;
    date: string;
}

interface MediaAppearancesProps {
    appearances: MediaAppearance[];
}

export const MediaAppearances: React.FC<MediaAppearancesProps> = ({ appearances }) => (
    <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Media Appearances</h3>
        <p className="text-gray-600 mb-4">
            Catch up on speeches, interviews, and campaign videos shared by the candidate
        </p>
        <div className="space-y-2">
            {appearances.map((media) => (
                <a
                    key={media.id}
                    href={media.url}
                    className="block text-red-600 hover:text-red-800 hover:underline flex items-center group"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    {media.title}
                    <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                </a>
            ))}
        </div>
    </div>
);