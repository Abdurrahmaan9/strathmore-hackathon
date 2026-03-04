interface TeamMemberProps {
    name: string;
    role?: string;
    image?: string;
}

export const TeamMember = ({ name, role, image }: TeamMemberProps) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
        <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
            {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-24 h-24 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{name?.charAt(0)}</span>
                </div>
            )}
        </div>
        {name && (
            <div className="p-4">
                <h4 className="font-semibold text-gray-800">{name}</h4>
                {role && <p className="text-sm text-gray-600">{role}</p>}
            </div>
        )}
    </div>
);