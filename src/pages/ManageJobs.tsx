/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Eye,
  Edit,
  Trash2,
  Clock,
  Users,
  IndianRupee,
  PlusCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      const jobs = await api.jobs.getAll();
      setJobs(jobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const deleteJob = async (jobId: string) => {
    try {
      await api.jobs.delete(jobId);
      setJobs(jobs.filter((job) => job.id !== jobId));
      setIsModalOpen(false);
      setJobToDelete(null);
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const openDeleteModal = (jobId: string) => {
    setJobToDelete(jobId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setJobToDelete(null);
  };

  const confirmDelete = () => {
    if (jobToDelete) {
      deleteJob(jobToDelete);
    }
  };

  const editJob = (jobId: string) => {
    navigate(`/post-job?edit=${jobId}`, { state: { isEditing: true } });
  };

  const viewApplicants = (jobId: string) => {
    navigate(`/candidates/${jobId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your active job listings
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => navigate("/post-job")}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {loading
              ? "Loading jobs..."
              : jobs.length === 0
              ? "No active job listings"
              : `Active Job Listings (${jobs.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-gray-500">Loading jobs...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500">No job listings found</p>
                <Button className="mt-4" onClick={() => navigate("/post-job")}>
                  Create Your First Job Listing
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-4 sm:space-y-0">
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 break-words">
                        {job.title}
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Posted {formatDate(job.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>View Applicants</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {/* <IndianRupee className="h-4 w-4" /> */}
                          <span>
                            <span className="font-medium">
                              INR {job.salary_min.toLocaleString()} -{" "}
                              {job.salary_max.toLocaleString()}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        className="flex items-center justify-center px-4 py-2 text-sm rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
                        onClick={() => viewApplicants(job.id)}
                      >
                        <Eye className="mr-2 h-4 w-4 text-blue-600" />
                        View Applicants
                      </button>
                      <button
                        className="flex items-center justify-center px-4 py-2 text-sm rounded-md bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100 transition-colors"
                        onClick={() => editJob(job.id)}
                      >
                        <Edit className="mr-2 h-4 w-4 text-gray-800" />
                        Edit
                      </button>
                      <button
                        className="flex items-center justify-center px-4 py-2 text-sm rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                        onClick={() => openDeleteModal(job.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <Badge variant="secondary">{job.type}</Badge>
                    <Badge variant="secondary">{job.location}</Badge>
                    {job.city && <Badge variant="secondary">{job.city}</Badge>}
                    <Badge variant="success">
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fixed Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 transform transition-all duration-300 scale-100">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold ">Delete Job</h2>
              <p className="text-sm text-gray-700">
                Are you sure you want to delete this job?{" "}
                <span className="font-semibold text-red-600">
                  All applications associated with this job will be permanently
                  deleted.
                </span>
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-800 bg-red-100 border border-red-800 rounded-md hover:bg-red-200 hover:border-red-900 transition-colors"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ManageJobs };

// const candidates = [
//   {
//     id: "1",
//     name: "John Doe",
//     avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
//     githubUsername: "johndoe",
//     linkedinUrl: "https://linkedin.com/in/johndoe",
//     applyingFor: "Senior Full Stack Developer",
//     status: "new",
//     assignmentStatus: {
//       submitted: true,
//       submittedAt: "2024-03-15T10:30:00Z",
//       deadline: "2024-03-20T23:59:59Z",
//       score: null,
//     },
//     skills: {
//       languages: ["JavaScript", "TypeScript", "Python"],
//       frameworks: ["React", "Node.js", "Express", "Next.js"],
//       databases: ["MongoDB", "PostgreSQL", "Redis"],
//       tools: ["Docker", "AWS", "Git", "Jest"],
//     },
//     githubStats: {
//       commits: 234,
//       contributions: 456,
//       codeQuality: 85,
//     },
//     inovactScore: {
//       technical: 89,
//       collaboration: 92,
//       communication: 85,
//       overall: 88,
//     },
//     projects: [
//       {
//         name: "E-commerce Platform",
//         description:
//           "Full-stack e-commerce platform with React, Node.js, and MongoDB",
//         repoUrl: "https://github.com/johndoe/ecommerce",
//         liveUrl: "https://ecommerce-demo.com",
//         technologies: ["React", "Node.js", "MongoDB", "Redis", "AWS"],
//         highlights: [
//           "Implemented real-time inventory management using WebSocket",
//           "Integrated Stripe payment gateway with custom checkout flow",
//           "Built responsive admin dashboard with real-time analytics",
//         ],
//       },
//       {
//         name: "Task Manager",
//         description:
//           "Real-time collaborative task management app with Vue.js and Firebase",
//         repoUrl: "https://github.com/johndoe/task-manager",
//         liveUrl: "https://task-manager-demo.com",
//         technologies: ["Vue.js", "Firebase", "WebSocket", "Node.js"],
//         highlights: [
//           "Built real-time collaboration features using Firebase",
//           "Implemented drag-and-drop task organization",
//           "Added file attachment support with cloud storage",
//         ],
//       },
//       {
//         name: "Weather App",
//         description:
//           "Progressive web app for weather forecasts using React and TypeScript",
//         repoUrl: "https://github.com/johndoe/weather-app",
//         liveUrl: "https://weather-app-demo.com",
//         technologies: ["React", "TypeScript", "PWA", "Service Workers"],
//         highlights: [
//           "Implemented offline support using Service Workers",
//           "Added location-based weather recommendations",
//           "Built responsive UI with dark mode support",
//         ],
//       },
//     ],
//   },
//   {
//     id: "2",
//     name: "Jane Smith",
//     avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
//     githubUsername: "janesmith",
//     linkedinUrl: "https://linkedin.com/in/janesmith",
//     applyingFor: "Backend Engineer",
//     status: "new",
//     assignmentStatus: {
//       submitted: true,
//       submittedAt: "2024-03-14T15:45:00Z",
//       deadline: "2024-03-19T23:59:59Z",
//       score: 92,
//     },
//     skills: {
//       languages: ["Go", "Python", "Rust"],
//       frameworks: ["Gin", "FastAPI", "gRPC"],
//       databases: ["PostgreSQL", "Redis", "Cassandra"],
//       tools: ["Docker", "Kubernetes", "Terraform"],
//     },
//     githubStats: {
//       commits: 567,
//       contributions: 789,
//       codeQuality: 92,
//     },
//     inovactScore: {
//       technical: 94,
//       collaboration: 88,
//       communication: 90,
//       overall: 91,
//     },
//     projects: [
//       {
//         name: "Distributed Cache",
//         description: "High-performance distributed caching system in Go",
//         repoUrl: "https://github.com/janesmith/dcache",
//         liveUrl: "https://dcache-demo.com",
//         technologies: ["Go", "Redis", "gRPC", "Prometheus"],
//         highlights: [
//           "Implemented consistent hashing for data distribution",
//           "Built monitoring system with Prometheus and Grafana",
//           "Achieved 99.99% uptime in production",
//         ],
//       },
//     ],
//   },
//   {
//     id: "3",
//     name: "Alex Chen",
//     avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
//     githubUsername: "alexchen",
//     linkedinUrl: "https://linkedin.com/in/alexchen",
//     applyingFor: "DevOps Engineer",
//     status: "new",
//     assignmentStatus: {
//       submitted: true,
//       submittedAt: "2024-03-13T09:15:00Z",
//       deadline: "2024-03-18T23:59:59Z",
//       score: 88,
//     },
//     skills: {
//       languages: ["Python", "Go", "Shell"],
//       frameworks: ["Terraform", "Ansible", "Helm"],
//       databases: ["PostgreSQL", "MongoDB", "Elasticsearch"],
//       tools: ["Kubernetes", "AWS", "GitLab CI", "Prometheus"],
//     },
//     githubStats: {
//       commits: 789,
//       contributions: 567,
//       codeQuality: 88,
//     },
//     inovactScore: {
//       technical: 91,
//       collaboration: 87,
//       communication: 89,
//       overall: 89,
//     },
//     projects: [
//       {
//         name: "Infrastructure as Code",
//         description: "Multi-cloud infrastructure automation framework",
//         repoUrl: "https://github.com/alexchen/iac",
//         liveUrl: "https://iac-demo.com",
//         technologies: ["Terraform", "AWS", "GCP", "Azure"],
//         highlights: [
//           "Built modular infrastructure components",
//           "Implemented multi-environment deployment pipeline",
//           "Added automated compliance checks",
//         ],
//       },
//     ],
//   },
// ];

// const jobData = {
//   "1": {
//     title: "Senior Full Stack Developer",
//     type: "Full-time",
//     location: "Remote",
//     salary: {
//       min: 500000,
//       max: 800000,
//       currency: "INR",
//     },
//     requiredSkills: [
//       "React",
//       "TypeScript",
//       "Node.js",
//       "MongoDB",
//       "AWS",
//       "Docker",
//       "Git",
//     ],
//     preferredSkills: ["Next.js", "Redis", "Jest", "GraphQL"],
//   },
//   "2": {
//     title: "Backend Engineer",
//     type: "Full-time",
//     location: "On-site",
//     salary: {
//       min: 600000,
//       max: 900000,
//       currency: "INR",
//     },
//     requiredSkills: [
//       "Go",
//       "Python",
//       "PostgreSQL",
//       "Redis",
//       "Docker",
//       "Kubernetes",
//     ],
//     preferredSkills: ["Rust", "gRPC", "Kafka", "Terraform"],
//   },
//   "3": {
//     title: "DevOps Engineer",
//     type: "Full-time",
//     location: "Hybrid",
//     salary: {
//       min: 700000,
//       max: 1000000,
//       currency: "INR",
//     },
//     requiredSkills: [
//       "Kubernetes",
//       "Docker",
//       "AWS",
//       "Terraform",
//       "CI/CD",
//       "Python",
//     ],
//     preferredSkills: ["Go", "Prometheus", "ELK Stack", "Ansible"],
//   },
// };

// const candidatesData = {
//   "1": [candidates[0]], // Frontend/Full Stack candidates
//   "2": [candidates[1]], // Backend candidates
//   "3": [candidates[2]], // DevOps candidates
// };

// const calculateSkillMatch = (
//   candidateSkills: string[],
//   requiredSkills: string[],
//   preferredSkills: string[]
// ) => {
//   const requiredMatches = requiredSkills.filter((skill) =>
//     candidateSkills.some(
//       (candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase()
//     )
//   );

//   const preferredMatches = preferredSkills.filter((skill) =>
//     candidateSkills.some(
//       (candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase()
//     )
//   );

//   const requiredMatchPercentage =
//     (requiredMatches.length / requiredSkills.length) * 100;
//   const preferredMatchPercentage =
//     (preferredMatches.length / preferredSkills.length) * 100;

//   return {
//     required: {
//       matched: requiredMatches,
//       percentage: requiredMatchPercentage,
//     },
//     preferred: {
//       matched: preferredMatches,
//       percentage: preferredMatchPercentage,
//     },
//     recommendation: getRecommendation(
//       requiredMatchPercentage,
//       preferredMatchPercentage
//     ),
//   };
// };

// const getRecommendation = (requiredMatch: number, preferredMatch: number) => {
//   if (requiredMatch >= 85 && preferredMatch >= 50) {
//     return {
//       type: "great",
//       label: "Great Fit",
//       color: "bg-green-100 text-green-800",
//       description: "Candidate matches most required and preferred skills",
//     };
//   } else if (requiredMatch >= 70) {
//     return {
//       type: "good",
//       label: "Good Fit",
//       color: "bg-blue-100 text-blue-800",
//       description: "Candidate matches essential required skills",
//     };
//   } else {
//     return {
//       type: "not",
//       label: "Not a Fit",
//       color: "bg-red-100 text-red-800",
//       description: "Candidate lacks several required skills",
//     };
//   }
// };

// const getTopSkills = (skills: any) => {
//   const allSkills = [
//     ...skills.languages,
//     ...skills.frameworks,
//     ...skills.databases,
//     ...skills.tools,
//   ];
//   return allSkills.slice(0, 5);
// };
