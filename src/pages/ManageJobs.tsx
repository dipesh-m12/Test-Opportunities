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
  // DollarSign,
  IndianRupee,
  PlusCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Database } from "@/types/supabase";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const editJob = (jobId: string) => {
    navigate(`/post-job?edit=${jobId}`);
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
                          <IndianRupee className="h-4 w-4" />

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
                      {/* View Applicants button */}
                      <button
                        className="flex items-center justify-center px-4 py-2 text-sm rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
                        onClick={() => viewApplicants(job.id)}
                      >
                        <Eye className="mr-2 h-4 w-4 text-blue-600" />
                        View Applicants
                      </button>

                      {/* Edit button */}
                      <button
                        className="flex items-center justify-center px-4 py-2 text-sm rounded-md bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100 transition-colors"
                        onClick={() => editJob(job.id)}
                      >
                        <Edit className="mr-2 h-4 w-4 text-gray-800" />
                        Edit
                      </button>

                      {/* Delete button */}
                      <button
                        className="flex items-center justify-center px-4 py-2 text-sm rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                        onClick={() => deleteJob(job.id)}
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
    </div>
  );
};

export { ManageJobs };
