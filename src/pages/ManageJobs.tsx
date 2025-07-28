/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Eye,
  Edit,
  Trash2,
  Clock,
  PlusCircle,
  IndianRupee,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { token } from "@/utils";
import { host } from "@/utils/routes";
import axios from "axios";
import moment from "moment";

const ManageJobs = ({ isPostJobEnabled, isPhoneNumber }: any) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // const [isPostJobEnabled, setIsPostJobEnabled] = React.useState(false);
  const [companyId, setcompanyId] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (location.state == "shortlisted")
      toast.success("Select a job to view application");
  }, []);

  React.useEffect(() => {
    const checkCompanyAccess = async () => {
      const idToken = localStorage.getItem(token);
      if (!idToken) {
        toast.error("Seems like you are not logged in");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
        return;
      }

      try {
        const response = await axios.get(`${host}/company`, {
          headers: {
            Authorization: idToken,
          },
        });
        if (response.status === 200) {
          // setIsPostJobEnabled(true);
          // console.log(response.data.id);
          setcompanyId(response.data.id);
        }
      } catch (error) {
        console.log(error);
        // setIsPostJobEnabled(false);
      }
    };

    checkCompanyAccess();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const idToken = localStorage.getItem(token);
      if (!idToken) {
        toast.error("Seems like you are not logged in");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);

        return;
      }
      let response = await axios.get(`${host}/company/${companyId}/job`, {
        headers: {
          Authorization: idToken,
        },
      });
      // console.log(response.data);
      let data: any[] = [];
      if (response.data.length !== 0) {
        data = response.data
          .map((e: any) => ({
            id: e.id,
            title: e.title,
            type: e.type == "full-time" ? "Full-time" : "Internship",
            location: e.work_mode,
            salary: {
              min: e.min_salary,
              max: e.max_salary,
              currency: "INR",
            },
            created_at: e.created_at, // Approximate ISO timestamp
            status: e.status.charAt(0).toUpperCase() + e.status.slice(1),
            currency: "INR",
            salary_min: e.min_salary,
            salary_max: e.max_salary,
            deadline: e.deadline,
            city: e.city,
          }))
          .sort((a: any, b: any) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA; // Newest first
          });
        // data = [];
      }
      setJobs(data);
      console.log("API Response:", response.data);
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("somwthing went wrong...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) loadJobs();
  }, [companyId]);

  const deleteJob = async (jobId: string) => {
    try {
      const idToken = localStorage.getItem(token);

      if (!idToken) {
        toast.error("Seems like you are not logged in");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
        return;
      }
      setDeleteLoading(true);
      //api call
      const response = await axios.delete(
        `${host}/company/${companyId}/job/${jobId}`,
        {
          headers: {
            Authorization: idToken,
          },
        }
      );
      // console.log("delete job", response.data);
      setJobs(jobs.filter((job) => job.id !== jobId));
      toast.success("The job was removed successfully");
      setIsModalOpen(false);
      setJobToDelete(null);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Issue deleting your job");
    } finally {
      setDeleteLoading(false);
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
    } else {
      console.log("Wrong elsed code...");
    }
  };

  const editJob = (jobId: string) => {
    navigate(`/post-job?edit=${jobId}`, { state: { isEditing: true } });
  };

  const viewApplicants = (jobId: string) => {
    location.state === "shortlisted"
      ? navigate(`/candidates/${jobId}`, { state: location.state })
      : navigate(`/candidates/${jobId}`);
  };

  useEffect(() => {
    console.log(loading);
  }, [loading]);

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
          onClick={() => {
            if (!isPostJobEnabled || !isPhoneNumber) {
              toast.error(
                "Fill in Company details in the Settings page to post a job"
              );
            } else {
              navigate("/post-job");
            }
          }}
          className={`${
            !isPostJobEnabled || !isPhoneNumber
              ? "cursor-not-allowed opacity-50 bg-gray-300 "
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {" "}
          <PlusCircle className="mr-2 h-4 w-4" />
          Post a Job
        </Button>
      </div>
      <Card className="px-4 sm:px-6">
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
                <Button
                  disabled={!isPostJobEnabled || !isPhoneNumber}
                  className="mt-4"
                  onClick={() => navigate("/post-job")}
                >
                  Create Your First Job Listing
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`rounded-lg border bg-white p-6 shadow-sm   `}
                >
                  {/* ${ border-solid border-l-4
                    job.status == "Active"
                      ? "border-green-600"
                      : job.status == "Draft"
                      ? "border-blue-700"
                      : "border-red-600"
                  } */}
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
                        {/* <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>View Applicants</span>
                        </div> */}
                        <div className="flex items-center space-x-1">
                          <span>
                            {job.type == "Internship" ? (
                              <span className="font-medium">
                                <IndianRupee className="inline size-3" />{" "}
                                {job.salary_min.toLocaleString("en-IN")} -{" "}
                                {job.salary_max.toLocaleString("en-IN")}
                              </span>
                            ) : (
                              <span className="font-medium">
                                <IndianRupee className="inline size-3" />{" "}
                                {job.salary_min.toLocaleString("en-IN")} -{" "}
                                {job.salary_max.toLocaleString("en-IN")}
                              </span>
                            )}
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
                    <Badge
                      variant={
                        job.status == "Active"
                          ? "success"
                          : job.status == "Draft"
                          ? "default"
                          : "danger"
                      }
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      {/* {job.status} */}
                    </Badge>
                    <Badge variant="secondary">
                      Application Deadline{" "}
                      {moment(job.deadline).format("Do MMM")}
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
                disabled={deleteLoading}
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
