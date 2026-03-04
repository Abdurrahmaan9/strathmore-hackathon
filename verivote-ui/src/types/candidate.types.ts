// types/candidate.types.ts
// TypeScript types for candidate-related data

export interface Candidate {
    id: string;
    name: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    party: string;
    partyAbbreviation: string;
    image: string;
    position: string;
    location?: string;
    slug: string;
    tagline?: string;
    gender?: 'male' | 'female';
    date_of_birth?: string;
    email?: string;
    phone_number?: string;
    bio?: string;
    manifesto?: string;
    manifesto_file?: string;
    social_links?: Record<string, string>;
    languages?: string[];
    hobbies?: string[];
    website?: string;
    address?: string;
}

export interface CandidateDetails extends Candidate {
    party_details: {
        name: string;
        code: string;
        logo?: string;
        colors?: string;
        website?: string;
    };
    county_details: {
        name?: string;
        code?: string;
        constituency?: string;
        ward?: string;
    };
    education: CandidateEducation[];
    experience: CandidateExperience[];
    public_experience: CandidatePublicExperience[];
    political_experience: CandidatePoliticalExperience[];
    policies: CandidatePolicy[];
    endorsements: CandidateEndorsement[];
    campaign_media: CandidateCampaignMedia[];
    finance: CandidateFinance[];
}

export interface CandidateEducation {
    institution: string;
    qualification: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
    education_level: string;
}

export interface CandidateExperience {
    company_name: string;
    job_title: string;
    location?: string;
    employment_type?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
}

export interface CandidatePublicExperience {
    organization_name: string;
    position: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
}

export interface CandidatePoliticalExperience {
    party_name?: string;
    position: string;
    description?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    election_year?: string;
    election_results?: string;
    achievements?: string;
    shortcomings?: string;
}

export interface CandidatePolicy {
    policy_name: string;
    policy_description?: string;
    key_points?: string[];
    vision_statement?: string;
    mission_statement?: string;
    strategies?: string[];
    position_papers?: string[];
    policy_summary?: string;
    policy_document_url?: string;
}

export interface CandidateEndorsement {
    endorsement_name: string;
    endorsement_statement?: string;
    endorsement_type?: string;
}

export interface CandidateCampaignMedia {
    event_title: string;
    event_date: string;
    location?: string;
    media_links?: Record<string, string>;
}

export interface CandidateFinance {
    financial_information_url?: string;
    assets_declared_url?: string;
    sources_of_funds?: string;
    funds_raised?: number;
}

export interface CategoryConfig {
    id: string;
    title: string;
    key: string;
    color: string;
    filterType: any;
    filterLabel: string;
}

export interface FilterOptions {
    counties: County[];
    constituencies: Constituency[];
    parties: Party[];
}

export interface County {
    county: string;
    county_code: string;
    constituency?: string;
    constituency_code?: string;
    ward?: string;
    ward_code?: string;
}

export interface Constituency {
    constituency: string;
    constituency_code: string;
    county?: string;
    county_code?: string;
}

export interface Party {
    id: number;
    party_name: string;
    party_code: string;
    party_logo?: string;
    party_colors?: string;
    party_website?: string;
    party_description?: string;
}

export interface SearchParams {
    query?: string;
    position?: string;
    county_id?: number;
    party_id?: number;
    gender?: 'male' | 'female';
    per_page?: number;
    page?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

export interface CandidatesData {
    presidential: Candidate[];
    governors: Candidate[];
    senators: Candidate[];
    mps: Candidate[];
    mcas: Candidate[];
    women_reps: Candidate[];
    candidates: Record<string, Candidate[]>;
    filters: FilterOptions;
}

export interface CandidateStatistics {
    total_candidates: number;
    by_position: {
        presidential: number;
        governors: number;
        senators: number;
        mps: number;
        mcas: number;
        women_reps: number;
    };
    by_gender: {
        male: number;
        female: number;
    };
    by_county: Array<{
        county_id: number;
        candidate_count: number;
        county: {
            id: number;
            county: string;
        };
    }>;
}

export type ActiveCategory = 'presidential' | 'governors' | 'senators' | 'mps' | 'mcas' | 'women_reps';

export type CandidatePosition = 'president' | 'governor' | 'senator' | 'mp' | 'mca' | 'women_rep';

// Utility types
export type CandidateListItem = Pick<Candidate, 'id' | 'name' | 'party' | 'partyAbbreviation' | 'image' | 'position' | 'location' | 'slug' | 'tagline'>;

export type CandidateSearchResult = CandidateListItem & {
    relevance_score?: number;
    match_type?: 'name' | 'party' | 'position' | 'location';
};