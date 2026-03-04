"use client";
import React from 'react';
import { Calendar, MapPin, User } from 'lucide-react';

interface CampaignEvent {
    id: string;
    title: string;
    date: string;
    location: string;
    image?: string;
    description?: string;
}

interface CampaignEventProps {
    event: CampaignEvent;
}

export const CampaignEventCard: React.FC<CampaignEventProps> = ({ event }) => (
    <div className="bg-red-500 rounded-lg overflow-hidden mb-6 relative">
        <div className="h-48 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center relative">
            <div className="text-white text-6xl font-bold opacity-30 absolute">Jubilee</div>
            <div className="text-white text-center relative z-10">
                <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {event.image ? (
                        <img src={event.image} alt={event.title} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <User className="w-10 h-10" />
                    )}
                </div>
            </div>
        </div>
        <div className="bg-red-500 text-white p-4">
            <div className="text-sm opacity-90 flex items-center mb-1">
                <Calendar className="w-4 h-4 mr-2" />
                Event Title: <span className="font-medium ml-1">{event.title}</span>
            </div>
            <div className="text-sm opacity-90 flex items-center mb-1">
                <Calendar className="w-4 h-4 mr-2" />
                Date: <span className="font-medium ml-1">{event.date}</span>
            </div>
            <div className="text-sm opacity-90 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Location: <span className="font-medium ml-1">{event.location}</span>
            </div>
            {event.description && (
                <p className="text-sm mt-3 opacity-90">{event.description}</p>
            )}
        </div>
    </div>
);