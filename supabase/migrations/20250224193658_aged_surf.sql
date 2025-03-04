/*
  # Add public read access to jobs

  1. Changes
    - Add policy to allow public read access to jobs table
    - Add policy to allow public read access to job assignments table
    - Add policy to allow public read access to applications table

  2. Security
    - Maintains existing RLS policies
    - Adds read-only access for public users
*/

-- Add public read access to jobs
CREATE POLICY "Anyone can read jobs"
  ON jobs
  FOR SELECT
  TO public
  USING (true);

-- Add public read access to job assignments
CREATE POLICY "Anyone can read job assignments"
  ON job_assignments
  FOR SELECT
  TO public
  USING (true);

-- Add public read access to applications
CREATE POLICY "Anyone can read applications"
  ON applications
  FOR SELECT
  TO public
  USING (true);