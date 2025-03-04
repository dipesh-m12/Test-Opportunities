// Mock API functions using static data
import { jobData, candidatesData } from './data';

export const api = {
  jobs: {
    getAll: async () => {
      return Object.entries(jobData).map(([id, job]) => ({
        id,
        ...job,
        created_at: new Date().toISOString(),
        recruiter_id: '1',
        status: 'active',
        currency: 'INR',
        salary_min: job.salary.min,
        salary_max: job.salary.max,
        description: 'Sample job description',
        requirements: 'Sample requirements',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }));
    },

    delete: async (id: string) => {
      // Mock delete operation
      console.log('Deleting job:', id);
    },
  },
};