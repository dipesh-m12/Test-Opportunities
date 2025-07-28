"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { token } from "@/utils";
import { host } from "@/utils/routes";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import Spinner from "@/components/Spinner";
import avatar from "../assets/default_avatar.png";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import {
  Github,
  CheckCircle2,
  XCircle,
  Files,
  ExternalLink,
  Info,
  IndianRupee,
  X,
} from "lucide-react";

interface Skill {
  skill: string;
  matched: boolean;
}

interface SkillSet {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  preferred: Skill[];
  required: Skill[];
}

interface Project {
  name: string;
  description: string;
  repoUrl: string;
  liveUrl: string;
  technologies: string[];
  highlights: string[];
  score: number;
  tags: string[];
  ai_plagiarism_score: number;
  ai_desc: string[];
}

interface AssignmentStatus {
  submitted: boolean;
  submittedAt: string;
  deadline: string;
  score: number;
  liveLink?: string;
  documentation?: string;
  githubRepo?: string;
}

interface GithubStats {
  commits: number;
  contributions: number;
  codeQuality: number;
  overall_score: number;
}

type CandidateStatusValue =
  | "assign_status"
  | "new"
  | "shortlisted"
  | "interviewing"
  | "offered"
  | "rejected";

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  overall_score: number;
  email?: string;
  phoneNumber?: string;
  githubUsername: string;
  portfolioUrl: string;
  applyingFor: string;
  status: CandidateStatusValue;
  assignmentStatus: AssignmentStatus;
  skills: SkillSet;
  githubStats: GithubStats;
  projects: Project[];
  graduation_year: string | number;
  degree: string;
  createdAt: string;
}

interface Salary {
  min: number;
  max: number;
  currency: string;
}

interface Job {
  id: string;
  title: string;
  type: string;
  location: string;
  salary: Salary;
  requiredSkills: string[];
  preferredSkills: string[];
}

const calculateSkillMatch = (skills: Skill[], jobSkills: string[]) => {
  const matchedSkills = skills.filter((s) => s.matched).map((s) => s.skill);
  const percentage =
    jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 0;
  return { matched: matchedSkills, percentage };
};

const getTopSkills = (skills: SkillSet) => {
  const allSkills = [
    ...skills.languages,
    ...skills.frameworks,
    ...skills.databases,
    ...skills.tools,
  ];
  return allSkills.slice(0, 5);
};

const getScoreBasedFit = (overallScore: number) => {
  if (overallScore >= 8) {
    return {
      type: "great",
      label: "Great Fit",
      color: "bg-green-100 text-green-800",
      description: `Candidate has got an overall score of ${Number(
        overallScore
      ).toFixed(1)}`,
    };
  } else if (overallScore >= 6.5) {
    return {
      type: "good",
      label: "Good Fit",
      color: "bg-blue-100 text-blue-800",
      description: `Candidate has got an overall score of ${Number(
        overallScore
      ).toFixed(1)}`,
    };
  } else {
    return {
      type: "average",
      label: "Average Fit",
      color: "bg-red-100 text-red-800",
      description: `Candidate has got an overall score of ${Number(
        overallScore
      ).toFixed(1)}`,
    };
  }
};

// Helper function to ensure URLs have proper protocol
const ensureHttpProtocol = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

function CandidateDatabase() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    "fit-high-to-low",
  ]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobHasAssignments, setJobHasAssignments] = useState<boolean>(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state === "shortlisted") {
      toast.success("Select a job to view application");
    }
  }, [location.state]);

  // Check company access and get company ID
  useEffect(() => {
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
          setCompanyId(response.data.id);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to get company information");
      }
    };
    checkCompanyAccess();
  }, [navigate]);

  // Load jobs when company ID is available
  const loadJobs = async () => {
    if (!companyId) return;
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

      const response = await axios.get(`${host}/company/${companyId}/job`, {
        headers: {
          Authorization: idToken,
        },
      });
      let data: any[] = [];
      if (response.data.length !== 0) {
        data = response.data
          .map((job: any) => ({
            id: job.id,
            title: job.title,
            type: job.type === "full-time" ? "Full-time" : "Internship",
            location: job.work_mode,
            salary_min: job.min_salary,
            salary_max: job.max_salary,
            created_at: job.created_at,
            status: job.status.charAt(0).toUpperCase() + job.status.slice(1),
            deadline: job.deadline,
            city: job.city,
          }))
          .sort((a: any, b: any) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA; // Newest first
          });
      }
      setJobs(data);
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Something went wrong while loading jobs...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadJobs();
    }
  }, [companyId]);

  // Fetch candidates for selected job
  const fetchCandidates = async (jobId: string): Promise<Candidate[]> => {
    const idToken = localStorage.getItem(token);
    if (!idToken) {
      toast.error("Seems like you are not logged in");
      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);
      return [];
    }

    try {
      const companyRes = await axios.get(`${host}/company`, {
        headers: { Authorization: idToken },
      });
      const response = await axios.get(
        `${host}/company/${companyRes.data.id}/job/${jobId}/application`,
        {
          headers: { Authorization: idToken },
        }
      );

      const jobData = response.data[0]?.application.job;
      if (jobData) {
        // Check if job has assignments
        const hasAssignments =
          Array.isArray(jobData.assignments) && jobData.assignments.length > 0;
        setJobHasAssignments(hasAssignments);

        setJob({
          id: jobData.id,
          title: jobData.title,
          type: jobData.type === "internship" ? "Internship" : "Full-time",
          location: jobData.work_mode,
          salary: {
            min: jobData.min_salary,
            max: jobData.max_salary,
            currency: "INR",
          },
          requiredSkills: jobData.job_skills
            .filter((s: any) => s.type === "required")
            .map((s: any) => s.skill),
          preferredSkills: jobData.job_skills
            .filter((s: any) => s.type === "preferred")
            .map((s: any) => s.skill),
        });
      }

      const candidateResults = await Promise.allSettled(
        response.data.map(async (e: any) => {
          try {
            const skillsRes = await axios.get(
              `${host}/company/${companyRes.data.id}/job/${jobId}/application/${e.application.id}`,
              { headers: { Authorization: idToken } }
            );

            // Initialize docFile as empty string
            let docFile = "";
            // Only fetch file if assignment_file and its id exist
            if (e.application.assignment_file?.id) {
              try {
                const fileres = await axios.get(
                  `${host}/company/${companyRes.data.id}/job/${jobId}/application/${e.application.id}/files/${e.application.assignment_file.id}`,
                  { headers: { Authorization: idToken } }
                );
                docFile = fileres.data?.download_url || "";
              } catch (fileError) {
                console.error(
                  "Error fetching file for application",
                  e.application.id,
                  fileError
                );
                docFile = "";
              }
            }

            const projects = (
              (e.application.applicant.projects || []) as Project[]
            ).filter(
              (project: Project) =>
                (project.highlights || []).length != 0 &&
                (project.tags || []).length != 0
            );

            const codeQuality =
              projects.length > 0
                ? projects.reduce(
                    (sum: any, p: any) => sum + (p?.score || 0),
                    0
                  ) / projects.length
                : 0;

            const jobRequiredSkills = jobData.job_skills.filter(
              (s: any) => s.type === "required"
            );
            const jobPreferredSkills = jobData.job_skills.filter(
              (s: any) => s.type === "preferred"
            );

            const matchedRequired = (
              skillsRes.data.application.enhanced_skills || []
            ).filter(
              (s: any) =>
                s.type === "required" &&
                (s.is_matched || s.github_project_skill)
            ).length;

            const matchedPreferred = (
              skillsRes.data.application.enhanced_skills || []
            ).filter(
              (s: any) =>
                s.type === "preferred" &&
                (s.is_matched || s.github_project_skill)
            ).length;

            const matchedRequiredRatio = jobRequiredSkills.length
              ? matchedRequired / jobRequiredSkills.length
              : 0;
            const matchedPreferredRatio = jobPreferredSkills.length
              ? matchedPreferred / jobPreferredSkills.length
              : 0;

            const overallGithubScore =
              (0.6 * codeQuality +
                0.4 *
                  (0.7 * matchedRequiredRatio * 100 +
                    0.3 * matchedPreferredRatio * 100)) /
              10;

            return {
              id: e.application.id,
              name: `${e.user.first_name || "Unknown"} ${
                e.user.last_name || ""
              }`.trim(),
              avatar: e.user.avatar || avatar,
              email: e.application.applicant.user.email,
              phoneNumber: e.user.phone_number,
              githubUsername: e.application.applicant.github_username,
              portfolioUrl: e.user.portfolio_link,
              applyingFor: jobData.title,
              overall_score: e.application.overall_score || 0,
              status:
                e.application.status.toLowerCase() as CandidateStatusValue,
              graduation_year: e.user.graduation_year,
              degree: e.user.degree,
              createdAt: e.application.created_at || new Date().toISOString(),
              assignmentStatus: {
                submitted:
                  !!e.application.assignment_file?.github_repo_url ||
                  !!e.application.assignment_file?.live_link_url ||
                  !!docFile,
                submittedAt:
                  e.application.assignment_file?.created_at ||
                  new Date().toISOString(),
                deadline:
                  (jobData.assignments && jobData.assignments[0]?.deadline) ||
                  "2025-05-27T18:29:59",
                score: e.application.overall_score || 0,
                liveLink: e.application.assignment_file?.live_link_url,
                documentation: docFile,
                githubRepo: e.application.assignment_file?.github_repo_url,
              },
              skills: {
                preferred: (skillsRes.data.application.enhanced_skills || [])
                  .filter((e: any) => e.type === "preferred")
                  .map((e: any) => ({
                    skill: e.skill,
                    matched: e.is_matched || e.github_project_skill,
                  })),
                required: (skillsRes.data.application.enhanced_skills || [])
                  .filter((e: any) => e.type === "required")
                  .map((e: any) => ({
                    skill: e.skill,
                    matched: e.is_matched || e.github_project_skill,
                  })),
                languages: (e.application.applicant.projects || []).reduce(
                  (acc: string[], project: any) =>
                    acc.concat(
                      project && typeof project === "object"
                        ? project.Programming_languages || []
                        : []
                    ),
                  []
                ),
                frameworks: (e.application.applicant.projects || []).reduce(
                  (acc: string[], project: any) =>
                    acc.concat(
                      project && typeof project === "object"
                        ? project.framework || []
                        : []
                    ),
                  []
                ),
                databases: (e.application.applicant.projects || []).reduce(
                  (acc: string[], project: any) =>
                    acc.concat(
                      project && typeof project === "object"
                        ? project.database || []
                        : []
                    ),
                  []
                ),
                tools: (e.application.applicant.projects || []).reduce(
                  (acc: string[], project: any) =>
                    acc.concat(
                      project && typeof project === "object"
                        ? project.tools || []
                        : []
                    ),
                  []
                ),
              },
              githubStats: {
                commits: (e.application.applicant.projects || []).reduce(
                  (sum: number, project: any) =>
                    sum +
                    (project && typeof project === "object"
                      ? project.commit_count || 0
                      : 0),
                  0
                ),
                contributions: (e.application.applicant.projects || []).reduce(
                  (sum: number, project: any) =>
                    sum +
                    (project && typeof project === "object"
                      ? project.contribution_days || 0
                      : 0),
                  0
                ),
                codeQuality: codeQuality,
                overall_score: overallGithubScore,
              },
              projects: (
                (skillsRes.data.application.applicant.projects as Project[]) ||
                []
              )
                .filter(
                  (project: Project) =>
                    (project.highlights || []).length != 0 &&
                    (project.tags || []).length != 0
                )
                .map((project: any) => ({
                  name: project.title || "",
                  description: project.description || "",
                  repoUrl: project?.social_project?.github_repo_url
                    ? project.social_project.github_repo_url
                    : "",
                  liveUrl: project?.social_project?.link || "",
                  technologies: [
                    ...(project.Programming_languages || []),
                    ...(project.framework || []),
                    ...(project.database || []),
                    ...(project.tools || []),
                  ],
                  tags: project.tags || [],
                  highlights: project.highlights || [],
                  score: project.score || 0,
                  ai_plagiarism_score: project.ai_plagiarism_score || 0,
                  ai_desc: project.ai_desc || ["s", "b", "f"],
                }))
                .filter((project: any) => project.name),
            } as Candidate;
          } catch (error) {
            console.error(
              "Error processing candidate",
              e.application.id,
              error
            );
            return null;
          }
        })
      );

      // Filter only successful fetches with valid data
      const candidatesData = candidateResults
        .filter(
          (result): result is PromiseFulfilledResult<Candidate> =>
            result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value);

      return candidatesData;
    } catch (error) {
      console.error("Error fetching candidates:", error);
      return [];
    }
  };

  // Convert jobs from API to dropdown options
  const jobOptions = jobs.map((job) => ({
    value: job.id,
    label: `${job.title} - ${job.type} (${job.city})`,
    disabled: false,
  }));

  const handleJobSelect = async (jobId: string) => {
    setSelectedJobId(jobId);
    setCandidatesLoading(true);
    try {
      const candidateData = await fetchCandidates(jobId);
      setCandidates(candidateData);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setCandidatesLoading(false);
    }
  };

  const candidatesForJob = useMemo(
    () =>
      candidates.filter((candidate) => candidate.applyingFor === job?.title),
    [candidates, job]
  );

  const skillFilters = [
    { value: "great", label: "Great Fit" },
    { value: "good", label: "Good Fit" },
    { value: "average", label: "Average Fit" },
  ];

  const statusFilters = [
    { value: "new", label: "New" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offered", label: "Offered" },
    { value: "rejected", label: "Rejected" },
  ];

  const filterOptions = [
    {
      value: "fit-high-to-low",
      label: "Fit: High to Low",
      selected: false,
      disabled: false,
    },
    {
      value: "fit-low-to-high",
      label: "Fit: Low to High",
      selected: false,
      disabled: false,
    },
    {
      value: "app-newest-to-oldest",
      label: "Application: Newest to Oldest",
      selected: false,
      disabled: false,
    },
    {
      value: "app-oldest-to-newest",
      label: "Application: Oldest to Newest",
      selected: false,
      disabled: false,
    },
    {
      value: "sub-newest-to-oldest",
      label: "Assignment: Newest to Oldest",
      selected: false,
      disabled: false,
    },
    {
      value: "sub-oldest-to-newest",
      label: "Assignment: Oldest to Newest",
      selected: false,
      disabled: false,
    },
  ].map((option) => ({
    ...option,
    selected: selectedFilters.includes(option.value),
    disabled: selectedFilters.includes(option.value),
  }));

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value || selectedFilters.includes(value)) return;

    // Determine the category of the new filter
    const category = value.startsWith("fit-")
      ? "fit"
      : value.startsWith("app-")
      ? "app"
      : "sub";

    // Remove any existing filter from the same category
    const newFilters = selectedFilters.filter(
      (f) => !f.startsWith(category + "-")
    );

    // Add the new filter
    setSelectedFilters([...newFilters, value]);
  };

  const removeFilter = (filter: string) => {
    setSelectedFilters(selectedFilters.filter((f) => f !== filter));
  };

  const filteredCandidates = useMemo(() => {
    let filtered = candidatesForJob;

    // Apply dropdown sorting filters in order
    filtered = [...filtered].sort((a, b) => {
      let sortResult = 0;
      for (const filter of selectedFilters) {
        if (filter === "fit-high-to-low") {
          const scoreA = a.githubStats.overall_score;
          const scoreB = b.githubStats.overall_score;
          sortResult = scoreB - scoreA;
          if (sortResult !== 0) return sortResult;
        } else if (filter === "fit-low-to-high") {
          const scoreA = a.githubStats.overall_score;
          const scoreB = b.githubStats.overall_score;
          sortResult = scoreA - scoreB;
          if (sortResult !== 0) return sortResult;
        } else if (filter === "app-newest-to-oldest") {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          sortResult = dateB - dateA;
          if (sortResult !== 0) return sortResult;
        } else if (filter === "app-oldest-to-newest") {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          sortResult = dateA - dateB;
          if (sortResult !== 0) return sortResult;
        } else if (filter === "sub-newest-to-oldest") {
          const dateA = a.assignmentStatus.submitted
            ? new Date(a.assignmentStatus.submittedAt).getTime()
            : Number.POSITIVE_INFINITY;
          const dateB = b.assignmentStatus.submitted
            ? new Date(b.assignmentStatus.submittedAt).getTime()
            : Number.POSITIVE_INFINITY;
          sortResult = dateB - dateA;
          if (sortResult !== 0) return sortResult;
        } else if (filter === "sub-oldest-to-newest") {
          const dateA = a.assignmentStatus.submitted
            ? new Date(a.assignmentStatus.submittedAt).getTime()
            : Number.POSITIVE_INFINITY;
          const dateB = b.assignmentStatus.submitted
            ? new Date(b.assignmentStatus.submittedAt).getTime()
            : Number.POSITIVE_INFINITY;
          sortResult = dateA - dateB;
          if (sortResult !== 0) return sortResult;
        }
      }
      return sortResult;
    });

    // Apply tab-based filters (skill and status)
    if (skillFilter || statusFilter) {
      filtered = filtered.filter((candidate) => {
        if (!job) return false;
        const scoreBasedFit = getScoreBasedFit(
          candidate.githubStats.overall_score
        );
        const skillMatchPass =
          !skillFilter || scoreBasedFit.type === skillFilter;
        const statusPass = !statusFilter || candidate.status === statusFilter;
        return skillMatchPass && statusPass;
      });
    }

    return filtered;
  }, [candidatesForJob, selectedFilters, skillFilter, statusFilter, job]);

  const toggleFilter = (type: "skill" | "status", value: string | null) => {
    if (type === "skill") {
      setSkillFilter(skillFilter === value ? null : value);
    } else {
      setStatusFilter(statusFilter === value ? null : value);
    }
  };

  return (
    <>
      <div className="max-w-sm mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search {jobs.length || 0} Jobs
        </label>
        <SearchableSelect
          options={jobOptions}
          value={selectedJobId}
          onChange={handleJobSelect}
          placeholder="Search and select a job..."
          searchPlaceholder="Type to search jobs..."
          className="w-full"
          disabled={loading}
        />
        {loading && (
          <p className="text-sm text-gray-500 mt-1">Loading jobs...</p>
        )}
      </div>

      {selectedJobId && job && (
        <div className="space-y-4 px-2 sm:px-4 lg:px-6 max-w-full overflow-x-auto">
          <div className="space-y-3">
            <div className="flex flex-col gap-3">
              <div className="space-y-1 text-start sm:text-left">
                <h1 className="text-lg sm:text-xl text-start lg:text-2xl font-bold text-gray-900">
                  Candidates for {job.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {job.type} · {job.location} ·{" "}
                  <IndianRupee className="inline size-3" />{" "}
                  {job.salary.min.toLocaleString("en-IN")} -{" "}
                  <IndianRupee className="inline size-3" />{" "}
                  {job.salary.max.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  {filteredCandidates.length} candidate
                  {filteredCandidates.length !== 1 ? "s" : ""} found
                </p>
              </div>

              {/* Sort by dropdown */}
              <div className="flex flex-col gap-2">
                <Select
                  options={filterOptions}
                  value=""
                  onChange={handleFilterChange}
                  placeholder="Select filters"
                  className="w-56"
                />
                <div className="flex flex-wrap gap-2">
                  {selectedFilters.map((filter) => (
                    <Badge
                      key={filter}
                      className="flex items-center gap-1 bg-gray-100 text-gray-800"
                    >
                      {filterOptions.find((opt) => opt.value === filter)?.label}
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <button
                        onClick={() => removeFilter(filter)}
                        className="ml-1"
                      >
                        <X className="h-4 w-4 text-gray-600 hover:text-red-600" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap justify-start sm:justify-start gap-1 sm:gap-2 pb-2 border-b border-gray-200">
              {skillFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={skillFilter === filter.value ? "primary" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter("skill", filter.value)}
                  className={`rounded-full hover:text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-all ${
                    skillFilter === filter.value
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  {filter.label}
                </Button>
              ))}
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={
                    statusFilter === filter.value ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => toggleFilter("status", filter.value)}
                  className={`rounded-full hover:text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-all ${
                    statusFilter === filter.value
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {candidatesLoading ? (
            <Spinner />
          ) : (
            <div className="grid gap-4">
              {filteredCandidates
                .filter((e) => e.projects.length !== 0)
                .map((candidate) => {
                  const requiredMatch = calculateSkillMatch(
                    candidate.skills.required,
                    job.requiredSkills
                  );
                  const preferredMatch = calculateSkillMatch(
                    candidate.skills.preferred,
                    job.preferredSkills
                  );
                  const scoreBasedFit = getScoreBasedFit(
                    candidate.githubStats.overall_score
                  );
                  const topSkills = getTopSkills(candidate.skills);

                  return (
                    <Card
                      key={candidate.id}
                      id={candidate.id}
                      className="w-full max-w-full mx-auto sm:mx-0 px-4 sm:px-6"
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <div className="flex items-start space-x-3 w-full">
                              <Avatar
                                src={candidate.avatar}
                                alt={candidate.name}
                                fallback={candidate.name}
                                size="md"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                                  {candidate.name}
                                </h3>
                                {candidate.degree &&
                                  candidate.graduation_year && (
                                    <p className="my-1 text-gray-700 truncate text-xs">
                                      <i>
                                        {candidate.degree} '
                                        <span>{candidate.graduation_year}</span>
                                      </i>
                                    </p>
                                  )}
                                <p className="text-xs text-blue-500 underline hover:no-underline">
                                  {candidate.phoneNumber
                                    ? `${candidate.phoneNumber.slice(
                                        0,
                                        3
                                      )} ${candidate.phoneNumber.slice(3)}`
                                    : "N/A"}
                                </p>
                                <div className="text-xs sm:text-sm text-blue-600 font-medium truncate mb-1 my-1">
                                  Applying for: {candidate.applyingFor}
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                  <a
                                    href={`https://github.com/${candidate.githubUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                  >
                                    <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="truncate">
                                      {candidate.githubUsername}
                                    </span>
                                  </a>
                                  {candidate.portfolioUrl && (
                                    <a
                                      href={candidate.portfolioUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-1 hover:text-gray-700"
                                    >
                                      <Files className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span>Portfolio</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                              <div className="w-full sm:w-32 ">
                                <span className="text-center hidden sm:block text-xs text-gray-700 mb-1 font-bold">
                                  Status
                                </span>
                                <div className="flex justify-center">
                                  <Badge
                                    variant={
                                      candidate.status === "new"
                                        ? "default"
                                        : candidate.status === "shortlisted"
                                        ? "success"
                                        : candidate.status === "interviewing"
                                        ? "primary"
                                        : candidate.status === "offered"
                                        ? "success"
                                        : candidate.status === "rejected"
                                        ? "destructive"
                                        : "default"
                                    }
                                    className={`text-xs sm:text-sm  ${
                                      candidate.status === "new"
                                        ? "bg-gray-100 text-gray-800"
                                        : candidate.status === "shortlisted"
                                        ? "bg-green-100 text-green-800"
                                        : candidate.status === "interviewing"
                                        ? "bg-blue-100 text-blue-800"
                                        : candidate.status === "offered"
                                        ? "bg-green-100 text-green-800"
                                        : candidate.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {candidate.status === "new"
                                      ? "New"
                                      : candidate.status === "shortlisted"
                                      ? "Shortlisted"
                                      : candidate.status === "interviewing"
                                      ? "Interviewing"
                                      : candidate.status === "offered"
                                      ? "Offered"
                                      : candidate.status === "rejected"
                                      ? "Rejected"
                                      : "Unknown"}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-20 sm:mt-5 text-xs sm:text-sm bg-transparent"
                                onClick={() =>
                                  setSelectedCandidate(
                                    selectedCandidate === candidate.id
                                      ? null
                                      : candidate.id
                                  )
                                }
                              >
                                {selectedCandidate === candidate.id
                                  ? "Hide"
                                  : "View"}
                              </Button>
                            </div>
                          </div>

                          <div className="border-t pt-3 flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 space-y-3">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                Top Skills
                              </h4>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {topSkills.length > 0 ? (
                                  [...new Set(topSkills)].map((skill) => (
                                    <Badge
                                      key={skill}
                                      variant="default"
                                      className="text-xs sm:text-sm font-medium"
                                    >
                                      {skill}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    No skills listed
                                  </span>
                                )}
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                      Required Skills Match
                                    </h4>
                                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                                      {Number.isFinite(requiredMatch.percentage)
                                        ? Math.round(requiredMatch.percentage)
                                        : 0}
                                      % skill match
                                    </span>
                                  </div>
                                  <div className="my-3 flex flex-wrap gap-1 sm:gap-2">
                                    {job.requiredSkills.map((skill) => {
                                      const isMatched =
                                        requiredMatch.matched.includes(skill);
                                      return (
                                        <div
                                          key={skill}
                                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                            isMatched
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {isMatched ? (
                                            <CheckCircle2 className="h-3 w-3" />
                                          ) : (
                                            <XCircle className="h-3 w-3" />
                                          )}
                                          {skill}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                      Preferred Skills Match
                                    </h4>
                                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                                      {Number.isFinite(
                                        preferredMatch.percentage
                                      )
                                        ? Math.round(preferredMatch.percentage)
                                        : 0}
                                      % skill match
                                    </span>
                                  </div>
                                  <div className="my-3 flex flex-wrap gap-1 sm:gap-2">
                                    {job.preferredSkills.map((skill) => {
                                      const isMatched =
                                        preferredMatch.matched.includes(skill);
                                      return (
                                        <div
                                          key={skill}
                                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                            isMatched
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {isMatched ? (
                                            <CheckCircle2 className="h-3 w-3" />
                                          ) : (
                                            <XCircle className="h-3 w-3" />
                                          )}
                                          {skill}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="lg:w-60">
                              <div
                                className={`rounded-lg p-3 ${scoreBasedFit.color}`}
                              >
                                <h4 className="font-medium text-sm sm:text-base">
                                  {scoreBasedFit.label}
                                </h4>
                                <p className="mt-1 text-xs sm:text-sm">
                                  {scoreBasedFit.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {selectedCandidate === candidate.id && (
                            <div className="mt-4 space-y-4 border-t pt-4">
                              <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1 space-y-3">
                                  {candidate.skills.languages.length > 0 && (
                                    <>
                                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                        Programming Languages
                                      </h4>
                                      <div className="flex flex-wrap gap-1 sm:gap-2">
                                        {[
                                          ...new Set(
                                            candidate.skills.languages
                                          ),
                                        ].map((lang) => (
                                          <Badge
                                            key={lang}
                                            variant="default"
                                            className="text-xs sm:text-sm"
                                          >
                                            {lang}
                                          </Badge>
                                        ))}
                                      </div>
                                    </>
                                  )}

                                  {candidate.skills.frameworks.length > 0 && (
                                    <>
                                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                        Frameworks & Libraries
                                      </h4>
                                      <div className="flex flex-wrap gap-1 sm:gap-2">
                                        {[
                                          ...new Set(
                                            candidate.skills.frameworks
                                          ),
                                        ].map((framework) => (
                                          <Badge
                                            key={framework}
                                            variant="default"
                                            className="text-xs sm:text-sm"
                                          >
                                            {framework}
                                          </Badge>
                                        ))}
                                      </div>
                                    </>
                                  )}

                                  {candidate.skills.databases.length > 0 && (
                                    <>
                                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                        Databases
                                      </h4>
                                      <div className="flex flex-wrap gap-1 sm:gap-2">
                                        {[
                                          ...new Set(
                                            candidate.skills.databases
                                          ),
                                        ].map((db) => (
                                          <Badge
                                            key={db}
                                            variant="default"
                                            className="text-xs sm:text-sm"
                                          >
                                            {db}
                                          </Badge>
                                        ))}
                                      </div>
                                    </>
                                  )}

                                  {candidate.skills.tools.length > 0 && (
                                    <>
                                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                        Tools & Technologies
                                      </h4>
                                      <div className="flex flex-wrap gap-1 sm:gap-2">
                                        {[
                                          ...new Set(candidate.skills.tools),
                                        ].map((tool) => (
                                          <Badge
                                            key={tool}
                                            variant="default"
                                            className="text-xs sm:text-sm"
                                          >
                                            {tool}
                                          </Badge>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>

                                {jobHasAssignments && (
                                  <div className="lg:w-60 space-y-3">
                                    <div className="rounded-lg bg-gray-50 p-3">
                                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                        Assignment Status
                                      </h4>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs text-gray-600">
                                            Status
                                          </span>
                                          <Badge
                                            variant={
                                              candidate.assignmentStatus
                                                .submitted
                                                ? "success"
                                                : "warning"
                                            }
                                            className="text-xs"
                                          >
                                            {candidate.assignmentStatus
                                              .submitted
                                              ? "Submitted"
                                              : "Pending"}
                                          </Badge>
                                        </div>
                                        {candidate.assignmentStatus
                                          .submitted && (
                                          <>
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs text-gray-600">
                                                Submitted
                                              </span>
                                              <span className="text-xs font-medium">
                                                {new Date(
                                                  candidate.assignmentStatus.submittedAt
                                                ).toLocaleDateString()}
                                              </span>
                                            </div>
                                            {candidate.assignmentStatus
                                              .githubRepo && (
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">
                                                  GitHub
                                                </span>
                                                <a
                                                  href={ensureHttpProtocol(
                                                    candidate.assignmentStatus
                                                      .githubRepo as string
                                                  )}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs text-blue-600 hover:underline"
                                                >
                                                  View
                                                </a>
                                              </div>
                                            )}
                                            {candidate.assignmentStatus
                                              .liveLink && (
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">
                                                  Live
                                                </span>
                                                <a
                                                  href={ensureHttpProtocol(
                                                    candidate.assignmentStatus
                                                      .liveLink
                                                  )}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs text-blue-600 hover:underline"
                                                >
                                                  View
                                                </a>
                                              </div>
                                            )}
                                            {candidate.assignmentStatus
                                              .documentation && (
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">
                                                  Documentation
                                                </span>
                                                <a
                                                  href={ensureHttpProtocol(
                                                    candidate.assignmentStatus
                                                      .documentation
                                                  )}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs text-blue-600 hover:underline"
                                                >
                                                  View
                                                </a>
                                              </div>
                                            )}
                                          </>
                                        )}
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs text-gray-600">
                                            Deadline
                                          </span>
                                          <span className="text-xs font-medium">
                                            {new Date(
                                              candidate.assignmentStatus.deadline
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-base sm:text-lg font-medium text-gray-900">
                                  Projects
                                </h4>
                                <div className="grid gap-3">
                                  {candidate.projects.length > 0 ? (
                                    candidate.projects.map((project, index) => (
                                      <div
                                        key={index}
                                        className="rounded-lg border p-3"
                                      >
                                        <div className="space-y-2">
                                          <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                                            <h5 className="font-medium text-gray-900 text-sm sm:text-base">
                                              {project.name}
                                            </h5>
                                            <div className="flex space-x-2">
                                              {project.repoUrl && (
                                                <a
                                                  href={project.repoUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-gray-500 hover:text-gray-700"
                                                >
                                                  <Github className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </a>
                                              )}
                                              {project.liveUrl && (
                                                <a
                                                  href={project.liveUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-gray-500 hover:text-gray-700"
                                                >
                                                  <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </a>
                                              )}
                                            </div>
                                          </div>

                                          <div className="space-y-1">
                                            <h6 className="text-xs sm:text-sm font-medium text-gray-700">
                                              Project Summary:
                                            </h6>
                                            <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1">
                                              {project.highlights.length > 0 ? (
                                                project.highlights.map(
                                                  (highlight, i) => (
                                                    <li key={i}>{highlight}</li>
                                                  )
                                                )
                                              ) : (
                                                <li>No highlights provided</li>
                                              )}
                                            </ul>
                                          </div>

                                          <div className="flex flex-wrap gap-1 sm:gap-2">
                                            {project.technologies.length > 0 ||
                                            project.tags.length > 0 ? (
                                              [
                                                ...new Set(
                                                  [
                                                    ...project.tags,
                                                    ...project.technologies,
                                                  ].map((tech) =>
                                                    tech.toLowerCase()
                                                  )
                                                ),
                                              ].map((tech) => (
                                                <Badge
                                                  key={tech}
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {tech}
                                                </Badge>
                                              ))
                                            ) : (
                                              <span className="text-xs text-gray-500">
                                                No technologies listed
                                              </span>
                                            )}
                                          </div>

                                          <div className="relative flex items-center justify-end gap-3">
                                            <div className="text-xs bg-blue-300/40 text-blue-700 w-fit font-semibold p-2 rounded-lg flex items-center gap-1">
                                              <span className="group relative">
                                                <Info className="h-4 w-4 text-blue-700 cursor-help" />
                                                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg p-2 w-72 -top-16 right-0 z-10 text-left">
                                                  <p className="font-semibold">
                                                    Code Quality Score
                                                  </p>
                                                  <ul className="list-disc list-inside mt-1">
                                                    <li>Readability: 20%</li>
                                                    <li>Consistency: 15%</li>
                                                    <li>
                                                      Use of Comments: 15%
                                                    </li>
                                                    <li>
                                                      Indentation and
                                                      Formatting: 15%
                                                    </li>
                                                    <li>Code Smells: 20%</li>
                                                    <li>
                                                      Naming and Declaration
                                                      Practices: 10%
                                                    </li>
                                                    <li>
                                                      Use of Language Features:
                                                      5%
                                                    </li>
                                                  </ul>
                                                </div>
                                              </span>
                                              Code Quality: {project.score}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs sm:text-sm text-gray-500">
                                      No projects listed
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                <div className="rounded-lg bg-gray-50 p-1 min-h-[6rem] bg-gradient-to-t from-blue-50 to-gray-50 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-sm sm:text-base font-medium text-gray-500">
                                      Commits
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">
                                      {candidate.githubStats.commits || 0}
                                    </div>
                                  </div>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-1 min-h-[6rem] bg-gradient-to-t from-blue-50 to-gray-50 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-sm sm:text-base font-medium text-gray-500">
                                      Contributions
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">
                                      {candidate.githubStats.contributions || 0}
                                    </div>
                                  </div>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-1 min-h-[6rem] bg-gradient-to-t from-blue-50 to-gray-50 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-sm sm:text-base font-medium text-gray-500">
                                      Code Quality
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">
                                      {Number.isFinite(
                                        candidate.githubStats.codeQuality
                                      )
                                        ? Math.round(
                                            candidate.githubStats.codeQuality
                                          )
                                        : 0}
                                    </div>
                                  </div>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-1 min-h-[6rem] bg-gradient-to-t from-blue-50 to-gray-50 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-sm sm:text-base font-medium text-gray-500 flex">
                                      <span className="group relative self-center ">
                                        <Info className="h-4 w-4 text-blue-600 cursor-help mr-1" />
                                        <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg p-2 w-72 -top-20 right-0 z-10 text-left">
                                          <p className="font-semibold">
                                            Overall Score
                                          </p>
                                          <ul className="list-disc list-inside mt-1">
                                            <li>Code Quality: 60%</li>
                                            <li>Skills matching to job: 40%</li>
                                          </ul>
                                        </div>
                                      </span>{" "}
                                      Overall Score
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">
                                      {Number.isFinite(candidate.overall_score)
                                        ? Number(
                                            candidate.githubStats.overall_score
                                          ).toFixed(1)
                                        : 0}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-36 text-xs sm:text-sm bg-transparent"
                                  onClick={() => setSelectedCandidate(null)}
                                >
                                  Close View
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {selectedJobId &&
        !candidatesLoading &&
        filteredCandidates.length === 0 && (
          <div className="flex h-[50vh] items-center justify-center">
            <p className="text-gray-500">
              {" "}
              <DotLottieReact
                src={"/animations/empty.json"}
                className="h-[30vh]"
                loop
                autoplay
              />
              {/* <iframe src="https://lottie.host/embed/329b7206-8db5-4a25-8ceb-e63bd122b072/Ahrg5veNZI.lottie"></iframe> */}
            </p>
          </div>
        )}
    </>
  );
}

export default CandidateDatabase;
