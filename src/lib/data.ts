export const jobData = {
  '1': {
    title: 'Senior Full Stack Developer',
    type: 'Full-time',
    location: 'Remote',
    salary: {
      min: 500000,
      max: 800000,
      currency: 'INR'
    },
    requiredSkills: [
      'React',
      'TypeScript',
      'Node.js',
      'MongoDB',
      'AWS',
      'Docker',
      'Git',
    ],
    preferredSkills: [
      'Next.js',
      'Redis',
      'Jest',
      'GraphQL',
    ],
  },
  '2': {
    title: 'Backend Engineer',
    type: 'Full-time',
    location: 'On-site',
    salary: {
      min: 600000,
      max: 900000,
      currency: 'INR'
    },
    requiredSkills: [
      'Go',
      'Python',
      'PostgreSQL',
      'Redis',
      'Docker',
      'Kubernetes',
    ],
    preferredSkills: [
      'Rust',
      'gRPC',
      'Kafka',
      'Terraform',
    ],
  },
  '3': {
    title: 'DevOps Engineer',
    type: 'Full-time',
    location: 'Hybrid',
    salary: {
      min: 700000,
      max: 1000000,
      currency: 'INR'
    },
    requiredSkills: [
      'Kubernetes',
      'Docker',
      'AWS',
      'Terraform',
      'CI/CD',
      'Python',
    ],
    preferredSkills: [
      'Go',
      'Prometheus',
      'ELK Stack',
      'Ansible',
    ],
  },
};

export const candidates = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    githubUsername: 'johndoe',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    applyingFor: 'Senior Full Stack Developer',
    status: 'new',
    assignmentStatus: {
      submitted: true,
      submittedAt: '2024-03-15T10:30:00Z',
      deadline: '2024-03-20T23:59:59Z',
      score: null,
    },
    skills: {
      languages: ['JavaScript', 'TypeScript', 'Python'],
      frameworks: ['React', 'Node.js', 'Express', 'Next.js'],
      databases: ['MongoDB', 'PostgreSQL', 'Redis'],
      tools: ['Docker', 'AWS', 'Git', 'Jest'],
    },
    githubStats: {
      commits: 234,
      contributions: 456,
      codeQuality: 85,
    },
    inovactScore: {
      technical: 89,
      collaboration: 92,
      communication: 85,
      overall: 88,
    },
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Full-stack e-commerce platform with React, Node.js, and MongoDB',
        repoUrl: 'https://github.com/johndoe/ecommerce',
        liveUrl: 'https://ecommerce-demo.com',
        technologies: ['React', 'Node.js', 'MongoDB', 'Redis', 'AWS'],
        highlights: [
          'Implemented real-time inventory management using WebSocket',
          'Integrated Stripe payment gateway with custom checkout flow',
          'Built responsive admin dashboard with real-time analytics'
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    githubUsername: 'janesmith',
    linkedinUrl: 'https://linkedin.com/in/janesmith',
    applyingFor: 'Backend Engineer',
    status: 'new',
    assignmentStatus: {
      submitted: true,
      submittedAt: '2024-03-14T15:45:00Z',
      deadline: '2024-03-19T23:59:59Z',
      score: 92,
    },
    skills: {
      languages: ['Go', 'Python', 'Rust'],
      frameworks: ['Gin', 'FastAPI', 'gRPC'],
      databases: ['PostgreSQL', 'Redis', 'Cassandra'],
      tools: ['Docker', 'Kubernetes', 'Terraform'],
    },
    githubStats: {
      commits: 567,
      contributions: 789,
      codeQuality: 92,
    },
    inovactScore: {
      technical: 94,
      collaboration: 88,
      communication: 90,
      overall: 91,
    },
    projects: [
      {
        name: 'Distributed Cache',
        description: 'High-performance distributed caching system in Go',
        repoUrl: 'https://github.com/janesmith/dcache',
        liveUrl: 'https://dcache-demo.com',
        technologies: ['Go', 'Redis', 'gRPC', 'Prometheus'],
        highlights: [
          'Implemented consistent hashing for data distribution',
          'Built monitoring system with Prometheus and Grafana',
          'Achieved 99.99% uptime in production'
        ]
      },
      {
        name: 'API Gateway',
        description: 'Cloud-native API Gateway with advanced routing and auth',
        repoUrl: 'https://github.com/janesmith/api-gateway',
        liveUrl: 'https://gateway-demo.com',
        technologies: ['Go', 'Kubernetes', 'OAuth2', 'OpenTelemetry'],
        highlights: [
          'Implemented JWT-based authentication',
          'Added rate limiting and circuit breaker patterns',
          'Integrated distributed tracing with OpenTelemetry'
        ]
      },
      {
        name: 'Message Queue',
        description: 'Scalable message queue system with multiple protocols',
        repoUrl: 'https://github.com/janesmith/msgqueue',
        liveUrl: 'https://msgqueue-demo.com',
        technologies: ['Go', 'NATS', 'Protocol Buffers', 'etcd'],
        highlights: [
          'Built support for multiple messaging protocols',
          'Implemented message persistence with etcd',
          'Added horizontal scaling capabilities'
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    githubUsername: 'alexchen',
    linkedinUrl: 'https://linkedin.com/in/alexchen',
    applyingFor: 'DevOps Engineer',
    status: 'new',
    assignmentStatus: {
      submitted: true,
      submittedAt: '2024-03-13T09:15:00Z',
      deadline: '2024-03-18T23:59:59Z',
      score: 88,
    },
    skills: {
      languages: ['Python', 'Go', 'Shell'],
      frameworks: ['Terraform', 'Ansible', 'Helm'],
      databases: ['PostgreSQL', 'MongoDB', 'Elasticsearch'],
      tools: ['Kubernetes', 'AWS', 'GitLab CI', 'Prometheus'],
    },
    githubStats: {
      commits: 789,
      contributions: 567,
      codeQuality: 88,
    },
    inovactScore: {
      technical: 91,
      collaboration: 87,
      communication: 89,
      overall: 89,
    },
    projects: [
      {
        name: 'Infrastructure as Code',
        description: 'Multi-cloud infrastructure automation framework',
        repoUrl: 'https://github.com/alexchen/iac',
        liveUrl: 'https://iac-demo.com',
        technologies: ['Terraform', 'AWS', 'GCP', 'Azure'],
        highlights: [
          'Built modular infrastructure components',
          'Implemented multi-environment deployment pipeline',
          'Added automated compliance checks'
        ]
      },
      {
        name: 'Monitoring Stack',
        description: 'Complete monitoring solution with alerts and dashboards',
        repoUrl: 'https://github.com/alexchen/monitoring',
        liveUrl: 'https://monitoring-demo.com',
        technologies: ['Prometheus', 'Grafana', 'AlertManager', 'ELK Stack'],
        highlights: [
          'Set up comprehensive monitoring system',
          'Created custom alert rules and dashboards',
          'Implemented log aggregation and analysis'
        ]
      },
      {
        name: 'GitOps Platform',
        description: 'Automated deployment platform using GitOps principles',
        repoUrl: 'https://github.com/alexchen/gitops',
        liveUrl: 'https://gitops-demo.com',
        technologies: ['ArgoCD', 'Kubernetes', 'Helm', 'GitLab'],
        highlights: [
          'Implemented GitOps workflow for deployments',
          'Added automated rollback capabilities',
          'Built custom Helm charts for applications'
        ]
      }
    ]
  }
];

export const candidatesData = {
  '1': [candidates[0]], // Frontend/Full Stack candidates
  '2': [candidates[1]], // Backend candidates
  '3': [candidates[2]], // DevOps candidates
};