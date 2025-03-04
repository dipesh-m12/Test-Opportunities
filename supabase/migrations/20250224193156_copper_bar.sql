/*
  # Add dummy data for testing

  This migration adds:
  1. Initial recruiter data
  2. Three job listings with different requirements
  3. Three candidates per job with their applications
*/

-- Create temporary function to generate test data
CREATE OR REPLACE FUNCTION create_test_data()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_recruiter_id uuid;
  v_full_stack_id uuid;
  v_backend_id uuid;
  v_devops_id uuid;
BEGIN
  -- Insert initial recruiter
  v_recruiter_id := gen_random_uuid();
  
  INSERT INTO recruiters (
    id,
    company_name,
    website,
    linkedin,
    contact_name,
    email,
    logo_url
  ) VALUES (
    v_recruiter_id,
    'Inovact Technologies',
    'https://inovact.com',
    'https://linkedin.com/company/inovact',
    'John Smith',
    'john@inovact.com',
    NULL
  );

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
    v_recruiter_id,
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
    v_recruiter_id,
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
    v_recruiter_id,
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

  -- Insert job assignments
  INSERT INTO job_assignments (
    job_id,
    description,
    deadline
  ) VALUES
  (
    v_full_stack_id,
    'Build a full-stack application using React and Node.js with real-time features and authentication.',
    (CURRENT_DATE + INTERVAL '7 days')::timestamptz
  ),
  (
    v_backend_id,
    'Design and implement a scalable API service with proper documentation and testing.',
    (CURRENT_DATE + INTERVAL '7 days')::timestamptz
  ),
  (
    v_devops_id,
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
    v_full_stack_id,
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
    v_full_stack_id,
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
    v_full_stack_id,
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
    v_backend_id,
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
    v_backend_id,
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
    v_backend_id,
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
    v_devops_id,
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
    v_devops_id,
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
    v_devops_id,
    gen_random_uuid(),
    'new',
    'lisazhang',
    'GitOps Platform',
    'Automated deployment platform using GitOps',
    'https://github.com/lisazhang/gitops',
    ARRAY['ArgoCD', 'Kubernetes', 'Terraform', 'Python'],
    '{"commits": 901, "contributions": 789, "code_quality": 90}'::jsonb
  );
END;
$$;

-- Execute the function to create test data
SELECT create_test_data();

-- Clean up
DROP FUNCTION create_test_data();