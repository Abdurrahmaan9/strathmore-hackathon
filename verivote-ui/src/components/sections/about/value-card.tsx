interface ValueCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export const ValueCard = ({ icon, title, description }: ValueCardProps) => (
    <div className="text-center mb-12">
        <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
        <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-6 rounded-full">
                {icon}
            </div>
        </div>
        <p className="text-gray-600 max-w-xs mx-auto leading-relaxed">{description}</p>
    </div>
);