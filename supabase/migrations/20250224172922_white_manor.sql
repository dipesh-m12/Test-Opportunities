/*
  # Initial Schema Setup

  1. New Tables
    - `recruiters`
      - Company and contact information
      - Notification preferences
    - `jobs`
      - Job posting details
      - Salary information
      - Application requirements
    - `applications`
      - Candidate applications
      - GitHub integration
      - Project details

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated recruiters
*/

-- Create recruiters table
CREATE TABLE IF NOT EXISTS recruiters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  company_name text NOT NULL,
  website text NOT NULL,
  linkedin text NOT NULL,
  contact_name text NOT NULL,
  email text UNIQUE NOT NULL,
  logo_url text,
  email_notifications boolean DEFAULT true,
  assignment_notifications boolean DEFAULT true
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  recruiter_id uuid REFERENCES recruiters(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  salary_min integer NOT NULL,
  salary_max integer NOT NULL,
  currency text NOT NULL,
  description text NOT NULL,
  requirements text NOT NULL,
  deadline timestamptz NOT NULL,
  status text DEFAULT 'draft'
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL,
  status text DEFAULT 'new',
  github_username text NOT NULL,
  project_name text NOT NULL,
  project_description text NOT NULL,
  project_url text NOT NULL,
  technologies text[] NOT NULL,
  github_stats jsonb NOT NULL
);

-- Enable Row Level Security
ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policies for recruiters table
CREATE POLICY "Recruiters can read own data"
  ON recruiters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Recruiters can update own data"
  ON recruiters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for jobs table
CREATE POLICY "Recruiters can read own jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can insert own jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can update own jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (recruiter_id = auth.uid());

-- Policies for applications table
CREATE POLICY "Recruiters can read applications for their jobs"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update applications for their jobs"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.recruiter_id = auth.uid()
    )
  );