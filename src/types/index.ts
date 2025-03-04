export interface Recruiter {
  id: string;
  companyName: string;
  website: string;
  linkedIn: string;
  contactName: string;
  email: string;
  logoUrl: string;
}

export interface JobPosting {
  id: string;
  recruiterId: string;
  title: string;
  companyName: string;
  type: 'Full-time' | 'Part-time' | 'Internship';
  location: 'Remote' | 'On-site' | 'Hybrid';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  description: string;
  deadline: string;
  questions: {
    id: string;
    type: 'short_answer' | 'multiple_choice' | 'file_upload';
    question: string;
    options?: string[];
  }[];
  assignment?: {
    description: string;
    deadline: string;
  };
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  githubUsername: string;
  projects: {
    name: string;
    description: string;
    repoUrl: string;
    liveUrl?: string;
    technologies: string[];
  }[];
  applicationStatus: 'new' | 'shortlisted' | 'rejected';
  githubStats: {
    totalCommits: number;
    contributions: number;
    languages: { name: string; percentage: number }[];
    codeQualityScore: number;
  };
}