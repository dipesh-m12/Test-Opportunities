export interface Database {
  public: {
    Tables: {
      recruiters: {
        Row: {
          id: string;
          created_at: string;
          company_name: string;
          website: string;
          linkedin: string;
          contact_name: string;
          email: string;
          logo_url: string | null;
          email_notifications: boolean;
          assignment_notifications: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          company_name: string;
          website: string;
          linkedin: string;
          contact_name: string;
          email: string;
          logo_url?: string | null;
          email_notifications?: boolean;
          assignment_notifications?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          company_name?: string;
          website?: string;
          linkedin?: string;
          contact_name?: string;
          email?: string;
          logo_url?: string | null;
          email_notifications?: boolean;
          assignment_notifications?: boolean;
        };
      };
      jobs: {
        Row: {
          id: string;
          created_at: string;
          recruiter_id: string;
          title: string;
          type: string;
          location: string;
          salary_min: number;
          salary_max: number;
          currency: string;
          description: string;
          requirements: string;
          deadline: string;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          recruiter_id: string;
          title: string;
          type: string;
          location: string;
          salary_min: number;
          salary_max: number;
          currency: string;
          description: string;
          requirements: string;
          deadline: string;
          status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          recruiter_id?: string;
          title?: string;
          type?: string;
          location?: string;
          salary_min?: number;
          salary_max?: number;
          currency?: string;
          description?: string;
          requirements?: string;
          deadline?: string;
          status?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          created_at: string;
          job_id: string;
          candidate_id: string;
          status: string;
          github_username: string;
          project_name: string;
          project_description: string;
          project_url: string;
          technologies: string[];
          github_stats: {
            commits: number;
            contributions: number;
            code_quality: number;
          };
        };
        Insert: {
          id?: string;
          created_at?: string;
          job_id: string;
          candidate_id: string;
          status?: string;
          github_username: string;
          project_name: string;
          project_description: string;
          project_url: string;
          technologies: string[];
          github_stats: {
            commits: number;
            contributions: number;
            code_quality: number;
          };
        };
        Update: {
          id?: string;
          created_at?: string;
          job_id?: string;
          candidate_id?: string;
          status?: string;
          github_username?: string;
          project_name?: string;
          project_description?: string;
          project_url?: string;
          technologies?: string[];
          github_stats?: {
            commits: number;
            contributions: number;
            code_quality: number;
          };
        };
      };
    };
  };
}