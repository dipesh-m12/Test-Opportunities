/*
  # Seed jobs and applications data

  1. Data Added
    - 3 jobs with different requirements
    - 9 candidates (3 per job)
    - Assignment details for each job
    - Application details with GitHub stats

  2. Structure
    - Jobs: Full Stack, Backend, and DevOps positions
    - Candidates: Matched to relevant positions
    - Skills and requirements aligned with job types
*/

-- Create temporary function to store job IDs
CREATE OR REPLACE FUNCTION create_jobs()
RETURNS TABLE (
  full_stack_id uuid,
  backend_id uuid,
  devops_id uuid
) LANGUAGE plpgsql AS $$
DECLARE
  v_full_stack_id uuid;
  v_backend_id uuid;
  v_devops_id uuid;
BEGIN
  -- Insert Full Stack Developer position
  INSERT INTO jobs (
    recruiter_id,
    title,
    type,
    location,
    city,
    salary_min,
    salary_max,
    currency,
    description,
    requirements,
    deadline,
    status,
    assignment_required
  ) VALUES (
    auth.uid(),
    'Senior Full Stack Developer',
    'Full-time',
    'Remote',
    NULL,
    500000,
    800000,
    'INR',
    'We are looking for a Senior Full Stack Developer to join our team. You will be responsible for developing and maintaining web applications using React and Node.js.',
    'Strong experience with React, Node.js, and TypeScript. Familiarity with cloud services and DevOps practices.',
    (CURRENT_DATE + INTERVAL '30 days')::timestamptz,
    'active',
    true
  ) RETURNING id INTO v_full_stack_id;

  -- Insert Backend Engineer position
  INSERT INTO jobs (
    recruiter_id,
    title,
    type,
    location,
    city,
    salary_min,
    salary_max,
    currency,
    description,
    requirements,
    deadline,
    status,
    assignment_required
  ) VALUES (
    auth.uid(),
    'Backend Engineer',
    'Full-time',
    'On-site',
    'Bangalore',
    600000,
    900000,
    'INR',
    'Looking for an experienced Backend Engineer to build scalable services and APIs.',
    'Expertise in Go, Python, and distributed systems. Strong knowledge of database design and optimization.',
    (CURRENT_DATE + INTERVAL '30 days')::timestamptz,
    'active',
    true
  ) RETURNING id INTO v_backend_id;

  -- Insert DevOps Engineer position
  INSERT INTO jobs (
    recruiter_id,
    title,
    type,
    location,
    city,
    salary_min,
    salary_max,
    currency,
    description,
    requirements,
    deadline,
    status,
    assignment_required
  ) VALUES (
    auth.uid(),
    'DevOps Engineer',
    'Full-time',
    'Hybrid',
    'Mumbai',
    700000,
    1000000,
    'INR',
    'Seeking a DevOps Engineer to improve our infrastructure and deployment processes.',
    'Experience with Kubernetes, AWS, and infrastructure as code. Strong scripting skills required.',
    (CURRENT_DATE + INTERVAL '30 days')::timestamptz,
    'active',
    true
  ) RETURNING id INTO v_devops_id;

  RETURN QUERY SELECT v_full_stack_id, v_backend_id, v_devops_id;
END;
$$;

-- Create job assignments using the job IDs
DO $$
DECLARE
  v_jobs record;
BEGIN
  SELECT * INTO v_jobs FROM create_jobs();

  -- Insert job assignments
  INSERT INTO job_assignments (
    job_id,
    description,
    deadline
  ) VALUES
  (
    v_jobs.full_stack_id,
    'Build a full-stack application using React and Node.js with real-time features and authentication.',
    (CURRENT_DATE + INTERVAL '7 days')::timestamptz
  ),
  (
    v_jobs.backend_id,
    'Design and implement a scalable API service with proper documentation and testing.',
    (CURRENT_DATE + INTERVAL '7 days')::timestamptz
  ),
  (
    v_jobs.devops_id,
    'Set up a complete CI/CD pipeline with monitoring and auto-scaling capabilities.',
    (CURRENT_DATE + INTERVAL '7 days')::timestamptz
  );

  -- Insert applications for Full Stack position
  INSERT INTO applications (
    job_id,
    candidate_id,
    status,
    github_username,
    project_name,
    project_description,
    project_url,
    technologies,
    github_stats
  ) VALUES
  (
    v_jobs.full_stack_id,
    gen_random_uuid(),
    'new',
    'johndoe',
    'E-commerce Platform',
    'Full-stack e-commerce platform with React, Node.js, and MongoDB',
    'https://github.com/johndoe/ecommerce',
    ARRAY['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
    '{"commits": 234, "contributions": 456, "code_quality": 85}'::jsonb
  ),
  (
    v_jobs.full_stack_id,
    gen_random_uuid(),
    'new',
    'sarahsmith',
    'Social Media Dashboard',
    'Real-time social media analytics dashboard',
    'https://github.com/sarahsmith/social-dashboard',
    ARRAY['React', 'Node.js', 'Socket.io', 'Redis', 'PostgreSQL'],
    '{"commits": 345, "contributions": 567, "code_quality": 90}'::jsonb
  ),
  (
    v_jobs.full_stack_id,
    gen_random_uuid(),
    'new',
    'mikebrown',
    'Project Management Tool',
    'Collaborative project management application',
    'https://github.com/mikebrown/project-manager',
    ARRAY['React', 'Express', 'MongoDB', 'WebSocket', 'Docker'],
    '{"commits": 456, "contributions": 678, "code_quality": 88}'::jsonb
  );

  -- Insert applications for Backend position
  INSERT INTO applications (
    job_id,
    candidate_id,
    status,
    github_username,
    project_name,
    project_description,
    project_url,
    technologies,
    github_stats
  ) VALUES
  (
    v_jobs.backend_id,
    gen_random_uuid(),
    'new',
    'janesmith',
    'Distributed Cache',
    'High-performance distributed caching system',
    'https://github.com/janesmith/dcache',
    ARRAY['Go', 'Redis', 'gRPC', 'Prometheus'],
    '{"commits": 567, "contributions": 789, "code_quality": 92}'::jsonb
  ),
  (
    v_jobs.backend_id,
    gen_random_uuid(),
    'new',
    'robertlee',
    'Event Processing Pipeline',
    'Scalable event processing system with Kafka',
    'https://github.com/robertlee/event-pipeline',
    ARRAY['Python', 'Kafka', 'PostgreSQL', 'Docker'],
    '{"commits": 678, "contributions": 890, "code_quality": 87}'::jsonb
  ),
  (
    v_jobs.backend_id,
    gen_random_uuid(),
    'new',
    'emmawang',
    'API Gateway',
    'Cloud-native API Gateway with advanced features',
    'https://github.com/emmawang/api-gateway',
    ARRAY['Go', 'Kubernetes', 'Redis', 'Prometheus'],
    '{"commits": 789, "contributions": 901, "code_quality": 91}'::jsonb
  );

  -- Insert applications for DevOps position
  INSERT INTO applications (
    job_id,
    candidate_id,
    status,
    github_username,
    project_name,
    project_description,
    project_url,
    technologies,
    github_stats
  ) VALUES
  (
    v_jobs.devops_id,
    gen_random_uuid(),
    'new',
    'alexchen',
    'Infrastructure as Code',
    'Multi-cloud infrastructure automation framework',
    'https://github.com/alexchen/iac',
    ARRAY['Terraform', 'AWS', 'Python', 'Ansible'],
    '{"commits": 789, "contributions": 567, "code_quality": 88}'::jsonb
  ),
  (
    v_jobs.devops_id,
    gen_random_uuid(),
    'new',
    'davidkim',
    'Monitoring Stack',
    'Complete monitoring solution with alerts',
    'https://github.com/davidkim/monitoring',
    ARRAY['Prometheus', 'Grafana', 'Kubernetes', 'Go'],
    '{"commits": 890, "contributions": 678, "code_quality": 93}'::jsonb
  ),
  (
    v_jobs.devops_id,
    gen_random_uuid(),
    'new',
    'lisazhang',
    'GitOps Platform',
    'Automated deployment platform using GitOps',
    'https://github.com/lisazhang/gitops',
    ARRAY['ArgoCD', 'Kubernetes', 'Terraform', 'Python'],
    '{"commits": 901, "contributions": 789, "code_quality": 90}'::jsonb
  );
END $$;

-- Clean up the temporary function
DROP FUNCTION create_jobs();