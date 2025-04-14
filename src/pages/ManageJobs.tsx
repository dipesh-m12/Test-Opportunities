/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Eye, Edit, Trash2, Clock, Users, PlusCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // const jobs = await api.jobs.getAll();
      const jobs = [
        {
          id: "1",
          title: "Senior Full Stack Developer",
          type: "Full-time",
          location: "Remote",
          salary: {
            min: 500000,
            max: 800000,
            currency: "INR",
          },
          requiredSkills: [
            "React",
            "TypeScript",
            "Node.js",
            "MongoDB",
            "AWS",
            "Docker",
            "Git",
          ],
          preferredSkills: ["Next.js", "Redis", "Jest", "GraphQL"],
          created_at: "2025-04-13T00:00:00.000Z", // Approximate ISO timestamp
          recruiter_id: "1",
          status: "active",
          currency: "INR",
          salary_min: 500000,
          salary_max: 800000,
          description: "Sample job description",
          requirements: "Sample requirements",
          deadline: "2025-05-13T00:00:00.000Z", // 30 days from April 13, 2025
        },
        {
          id: "2",
          title: "Backend Engineer",
          type: "Full-time",
          location: "On-site",
          salary: {
            min: 600000,
            max: 900000,
            currency: "INR",
          },
          requiredSkills: [
            "Go",
            "Python",
            "PostgreSQL",
            "Redis",
            "Docker",
            "Kubernetes",
          ],
          preferredSkills: ["Rust", "gRPC", "Kafka", "Terraform"],
          created_at: "2025-04-13T00:00:00.000Z",
          recruiter_id: "1",
          status: "active",
          currency: "INR",
          salary_min: 600000,
          salary_max: 900000,
          description: "Sample job description",
          requirements: "Sample requirements",
          deadline: "2025-05-13T00:00:00.000Z",
        },
        {
          id: "3",
          title: "DevOps Engineer",
          type: "Full-time",
          location: "Hybrid",
          salary: {
            min: 700000,
            max: 1000000,
            currency: "INR",
          },
          requiredSkills: [
            "Kubernetes",
            "Docker",
            "AWS",
            "Terraform",
            "CI/CD",
            "Python",
          ],
          preferredSkills: ["Go", "Prometheus", "ELK Stack", "Ansible"],
          created_at: "2025-04-13T00:00:00.000Z",
          recruiter_id: "1",
          status: "active",
          currency: "INR",
          salary_min: 700000,
          salary_max: 1000000,
          description: "Sample job description",
          requirements: "Sample requirements",
          deadline: "2025-05-13T00:00:00.000Z",
        },
      ];
      setJobs(jobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Error fetching jobs...");
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
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-500 text-sm">Loading jobs...</span>
              </div>
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
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-gray-800 bg-red-100 border border-red-800 rounded-md hover:bg-red-200 hover:border-red-900 transition-colors"
                onClick={confirmDelete}
              >
                {deleteLoading ? (
                  <div className="w-4 h-4 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ManageJobs };

// export const jobData = {
//   '1': {
//     title: 'Senior Full Stack Developer',
//     type: 'Full-time',
//     location: 'Remote',
//     salary: {
//       min: 500000,
//       max: 800000,
//       currency: 'INR'
//     },
//     requiredSkills: [
//       'React',
//       'TypeScript',
//       'Node.js',
//       'MongoDB',
//       'AWS',
//       'Docker',
//       'Git',
//     ],
//     preferredSkills: [
//       'Next.js',
//       'Redis',
//       'Jest',
//       'GraphQL',
//     ],
//   },
//   '2': {
//     title: 'Backend Engineer',
//     type: 'Full-time',
//     location: 'On-site',
//     salary: {
//       min: 600000,
//       max: 900000,
//       currency: 'INR'
//     },
//     requiredSkills: [
//       'Go',
//       'Python',
//       'PostgreSQL',
//       'Redis',
//       'Docker',
//       'Kubernetes',
//     ],
//     preferredSkills: [
//       'Rust',
//       'gRPC',
//       'Kafka',
//       'Terraform',
//     ],
//   },
//   '3': {
//     title: 'DevOps Engineer',
//     type: 'Full-time',
//     location: 'Hybrid',
//     salary: {
//       min: 700000,
//       max: 1000000,
//       currency: 'INR'
//     },
//     requiredSkills: [
//       'Kubernetes',
//       'Docker',
//       'AWS',
//       'Terraform',
//       'CI/CD',
//       'Python',
//     ],
//     preferredSkills: [
//       'Go',
//       'Prometheus',
//       'ELK Stack',
//       'Ansible',
//     ],
//   },
// };
