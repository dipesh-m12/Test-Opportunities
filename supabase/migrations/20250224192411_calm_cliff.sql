/*
  # Add job assignments table and update jobs table

  1. New Tables
    - `job_assignments`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `description` (text)
      - `deadline` (timestamptz)
      - `created_at` (timestamptz)

  2. Changes
    - Add `city` column to jobs table for on-site/hybrid positions
    - Add `assignment_required` boolean to jobs table

  3. Security
    - Enable RLS on job_assignments table
    - Add policies for authenticated recruiters
*/

-- Add city column to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'city'
  ) THEN
    ALTER TABLE jobs ADD COLUMN city text;
  END IF;
END $$;

-- Add assignment_required column to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'assignment_required'
  ) THEN
    ALTER TABLE jobs ADD COLUMN assignment_required boolean DEFAULT true;
  END IF;
END $$;

-- Create job_assignments table
CREATE TABLE IF NOT EXISTS job_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  description text NOT NULL,
  deadline timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for job_assignments
CREATE POLICY "Recruiters can read own job assignments"
  ON job_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_assignments.job_id
      AND jobs.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can insert own job assignments"
  ON job_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_assignments.job_id
      AND jobs.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update own job assignments"
  ON job_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_assignments.job_id
      AND jobs.recruiter_id = auth.uid()
    )
  );