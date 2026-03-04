-- VeriVote Database Schema
-- PostgreSQL schema for candidates, parties, and counties

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Counties table
CREATE TABLE IF NOT EXISTS counties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constituencies table (sub-divisions of counties)
CREATE TABLE IF NOT EXISTS constituencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    county_id INTEGER REFERENCES counties(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(county_id, code)
);

-- Wards table (sub-divisions of constituencies)
CREATE TABLE IF NOT EXISTS wards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    constituency_id INTEGER REFERENCES constituencies(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(constituency_id, code)
);

-- Political parties table
CREATE TABLE IF NOT EXISTS parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    logo_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    founded_date DATE,
    headquarters VARCHAR(255),
    website VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions table (e.g., President, Governor, Senator, etc.)
CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    level VARCHAR(50) NOT NULL CHECK (level IN ('national', 'county', 'constituency', 'ward')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    profile_image_url VARCHAR(500),
    biography TEXT,
    education_background TEXT,
    work_experience TEXT,
    criminal_record TEXT,
    assets_declaration TEXT,
    social_media_links JSONB, -- Store social media URLs as JSON
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'disqualified')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidate positions (linking candidates to specific positions they're contesting)
CREATE TABLE IF NOT EXISTS candidate_positions (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    position_id INTEGER REFERENCES positions(id) ON DELETE CASCADE,
    party_id INTEGER REFERENCES parties(id) ON DELETE CASCADE,
    county_id INTEGER REFERENCES counties(id) ON DELETE SET NULL,
    constituency_id INTEGER REFERENCES constituencies(id) ON DELETE SET NULL,
    ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
    election_year INTEGER NOT NULL CHECK (election_year >= 2000),
    status VARCHAR(20) DEFAULT 'declared' CHECK (status IN ('declared', 'nominated', 'withdrawn', 'elected', 'defeated')),
    manifesto TEXT,
    campaign_slogan VARCHAR(500),
    campaign_website VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, position_id, county_id, constituency_id, ward_id, election_year)
);

-- Policy positions table (for candidates' stances on various issues)
CREATE TABLE IF NOT EXISTS policy_positions (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    issue_category VARCHAR(100) NOT NULL, -- e.g., "Economy", "Healthcare", "Education"
    stance TEXT NOT NULL,
    details TEXT,
    source_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign events table
CREATE TABLE IF NOT EXISTS campaign_events (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    event_type VARCHAR(50) CHECK (event_type IN ('rally', 'debate', 'interview', 'meeting', 'other')),
    attendance_estimate INTEGER,
    media_coverage_urls JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media content table (videos, articles, interviews)
CREATE TABLE IF NOT EXISTS media_content (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(20) CHECK (content_type IN ('video', 'article', 'interview', 'podcast', 'image')),
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    description TEXT,
    publication_date TIMESTAMP,
    source VARCHAR(255), -- Media outlet name
    tags JSONB, -- Array of tags for categorization
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_candidate_positions_candidate ON candidate_positions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_positions_position ON candidate_positions(position_id);
CREATE INDEX IF NOT EXISTS idx_candidate_positions_party ON candidate_positions(party_id);
CREATE INDEX IF NOT EXISTS idx_candidate_positions_county ON candidate_positions(county_id);
CREATE INDEX IF NOT EXISTS idx_parties_status ON parties(status);
CREATE INDEX IF NOT EXISTS idx_counties_name ON counties(name);
CREATE INDEX IF NOT EXISTS idx_policy_positions_candidate ON policy_positions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_media_content_candidate ON media_content(candidate_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_candidate ON campaign_events(candidate_id);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_counties_updated_at BEFORE UPDATE ON counties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_constituencies_updated_at BEFORE UPDATE ON constituencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wards_updated_at BEFORE UPDATE ON wards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON parties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidate_positions_updated_at BEFORE UPDATE ON candidate_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_positions_updated_at BEFORE UPDATE ON policy_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_events_updated_at BEFORE UPDATE ON campaign_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_content_updated_at BEFORE UPDATE ON media_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial data
INSERT INTO counties (name, code) VALUES 
('Nairobi', 'NBI'),
('Mombasa', 'MSA'),
('Kisumu', 'KSM'),
('Nakuru', 'NKU'),
('Kiambu', 'KMB'),
('Turkana', 'TKN'),
('Mandera', 'MDR'),
('Marsabit', 'MSB'),
('Wajir', 'WJR'),
('Garissa', 'GRS')
ON CONFLICT (code) DO NOTHING;

INSERT INTO positions (title, description, level) VALUES 
('President', 'Head of State and Government', 'national'),
('Governor', 'County Executive Head', 'county'),
('Senator', 'County Representative in Parliament', 'county'),
('Member of Parliament', 'Constituency Representative in Parliament', 'constituency'),
('Member of County Assembly', 'Ward Representative in County Assembly', 'ward')
ON CONFLICT (title) DO NOTHING;

INSERT INTO parties (name, code, description, status) VALUES 
('Jubilee Party', 'JP', 'Ruling party focused on development and unity', 'active'),
('Orange Democratic Movement', 'ODM', 'Opposition party focused on reform', 'active'),
('United Democratic Alliance', 'UDA', 'Party focused on economic empowerment', 'active'),
('Wiper Democratic Movement', 'WDM', 'Party focused on youth empowerment', 'active'),
('Independent', 'IND', 'Independent candidates', 'active')
ON CONFLICT (code) DO NOTHING;
