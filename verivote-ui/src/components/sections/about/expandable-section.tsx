import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableSectionProps {
    id: string | number;
    title: string;
    content: React.ReactNode;
    isExpanded: boolean;
    onToggle: (id: string | number) => void;
}

export const ExpandableSection = ({ id, title, content, isExpanded, onToggle }: ExpandableSectionProps) => (
    <div className="mb-4">
        <button
            onClick={() => onToggle(id)}
            className="w-full bg-blue-600 text-black p-4 rounded-lg flex justify-between items-center hover:bg-blue-700 transition-colors"
        >
            <span className="text-lg font-semibold uppercase tracking-wide">{title}</span>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {isExpanded && (
            <div className="bg-white border border-gray-200 rounded-b-lg p-6 mt-1">
                <p className="text-gray-700 leading-relaxed">{content}</p>
            </div>
        )}
    </div>
);