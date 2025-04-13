/*
  # Initial Schema Setup for ReliefConnect

  1. New Tables
    - incidents: Tracks emergency situations
    - resources: Manages available supplies and their locations
    - volunteers: Stores volunteer information and assignments
    - skills: Manages skill categories and specific skills
    - teams: Manages volunteer teams
    - tasks: Manages tasks and assignments
    - shifts: Manages volunteer shift schedules
    - training: Stores training materials
    - certifications: Tracks volunteer certifications
    - recognition: Tracks volunteer contributions and awards

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  location JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  severity TEXT NOT NULL,
  type TEXT NOT NULL
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  location JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'available'
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  description TEXT,
  valid_years INTEGER DEFAULT 1
);

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  contact_info JSONB NOT NULL DEFAULT '{"email": "", "phone": "", "address": ""}',
  skills TEXT[] DEFAULT '{}',
  skill_details JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  location JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_task TEXT,
  availability JSONB DEFAULT '{"weekdays": [], "hours": {"start": "09:00", "end": "17:00"}, "notes": ""}',
  emergency_contact JSONB DEFAULT '{"name": "", "relationship": "", "phone": ""}',
  experience_level TEXT DEFAULT 'beginner',
  joined_date TIMESTAMPTZ DEFAULT NOW(),
  profile_photo TEXT,
  contribution_points INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}'
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES volunteers(id),
  members UUID[] DEFAULT '{}',
  skills_required TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  incident_id UUID REFERENCES incidents(id),
  location JSONB
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  skills_required TEXT[] DEFAULT '{}',
  assigned_volunteers UUID[] DEFAULT '{}',
  assigned_team UUID REFERENCES teams(id),
  location JSONB,
  estimated_duration INTEGER, -- in minutes
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  incident_id UUID REFERENCES incidents(id)
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  volunteer_id UUID REFERENCES volunteers(id),
  task_id UUID REFERENCES tasks(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT
);

-- Training materials table
CREATE TABLE IF NOT EXISTS training_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,
  content_url TEXT NOT NULL,
  skills_related TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'beginner',
  estimated_duration INTEGER -- in minutes
);

-- Volunteer contributions and recognition
CREATE TABLE IF NOT EXISTS volunteer_recognition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  volunteer_id UUID REFERENCES volunteers(id),
  type TEXT NOT NULL, -- 'badge', 'award', 'certificate', etc.
  title TEXT NOT NULL,
  description TEXT,
  issued_by UUID REFERENCES auth.users(id),
  issued_date TIMESTAMPTZ DEFAULT NOW(),
  points INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_recognition ENABLE ROW LEVEL SECURITY;

-- Incidents Policies
CREATE POLICY "Incidents are viewable by everyone"
  ON incidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Incidents are insertable by authenticated users"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Resources Policies
CREATE POLICY "Resources are viewable by everyone"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Resources are insertable by authenticated users"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Volunteers Policies
CREATE POLICY "Volunteers can view all volunteer profiles"
  ON volunteers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Volunteers can update their own profile"
  ON volunteers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Volunteers can insert their own profile"
  ON volunteers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Skills Policies
CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

-- Certifications Policies
CREATE POLICY "Certifications are viewable by everyone"
  ON certifications FOR SELECT
  TO authenticated
  USING (true);

-- Teams Policies
CREATE POLICY "Teams are viewable by everyone"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

-- Tasks Policies
CREATE POLICY "Tasks are viewable by everyone"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- Shifts Policies
CREATE POLICY "Shifts are viewable by everyone"
  ON shifts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Volunteers can update their own shifts"
  ON shifts FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM volunteers WHERE id = shifts.volunteer_id AND user_id = auth.uid()));

-- Training Materials Policies
CREATE POLICY "Training materials are viewable by everyone"
  ON training_materials FOR SELECT
  TO authenticated
  USING (true);

-- Recognition Policies
CREATE POLICY "Recognition is viewable by everyone"
  ON volunteer_recognition FOR SELECT
  TO authenticated
  USING (true);

-- Insert some default skills
INSERT INTO skills (name, category, description, icon) VALUES
('First Aid', 'Medical', 'Basic first aid knowledge and skills', 'heart'),
('CPR', 'Medical', 'Cardiopulmonary resuscitation certification', 'activity'),
('Search and Rescue', 'Emergency', 'Training in search and rescue operations', 'search'),
('Disaster Assessment', 'Emergency', 'Ability to assess disaster impact and needs', 'clipboard'),
('Food Preparation', 'Logistics', 'Experience in mass food preparation', 'chef-hat'),
('Shelter Management', 'Logistics', 'Experience managing emergency shelters', 'home'),
('Translation', 'Communication', 'Ability to translate between languages', 'message-square'),
('Counseling', 'Support', 'Crisis counseling and emotional support', 'life-buoy'),
('Childcare', 'Support', 'Experience in childcare services', 'users'),
('Driving', 'Logistics', 'Licensed to drive various vehicles', 'truck'),
('Ham Radio Operation', 'Communication', 'Licensed ham radio operator', 'radio'),
('Drone Operation', 'Technology', 'Licensed drone operator for surveys', 'send'),
('Data Entry', 'Administration', 'Quick and accurate data entry skills', 'database'),
('Team Leadership', 'Management', 'Experience leading teams in crisis', 'users'),
('Animal Care', 'Support', 'Experience in animal rescue and care', 'github');

-- Insert some default training materials
INSERT INTO training_materials (title, description, content_type, content_url, skills_related, difficulty_level, estimated_duration) VALUES
('Basic First Aid', 'Learn the basics of first aid for emergency situations', 'video', 'https://example.com/first-aid-video', ARRAY['First Aid'], 'beginner', 60),
('CPR Certification Course', 'Comprehensive CPR training for certification', 'course', 'https://example.com/cpr-course', ARRAY['CPR'], 'intermediate', 180),
('Disaster Response Protocols', 'Standard protocols for various disaster scenarios', 'document', 'https://example.com/protocols.pdf', ARRAY['Disaster Assessment', 'Search and Rescue'], 'intermediate', 90),
('Crisis Counseling Techniques', 'Effective techniques for providing emotional support', 'video', 'https://example.com/counseling-video', ARRAY['Counseling'], 'advanced', 120),
('Shelter Setup Guide', 'Step-by-step guide for setting up emergency shelters', 'document', 'https://example.com/shelter-guide.pdf', ARRAY['Shelter Management'], 'beginner', 45);