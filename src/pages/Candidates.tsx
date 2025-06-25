/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import avatar from "../assets/default_avatar.png";
import {
  Github,
  Video,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Files,
  ExternalLink,
  Info,
  IndianRupee,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import Spinner from "@/components/Spinner";
import toast from "react-hot-toast";
import { token } from "@/utils";
import { host } from "@/utils/routes";
import axios from "axios";

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

interface CandidateStatus {
  value: string;
  label: string;
  disabled?: boolean;
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

interface User {
  email: string;
  name: string;
}

const calculateSkillMatch = (skills: Skill[], jobSkills: string[]) => {
  const matchedSkills = skills.filter((s) => s.matched).map((s) => s.skill);
  const percentage =
    jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 0;
  return { matched: matchedSkills, percentage };
};

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

const getTopSkills = (skills: SkillSet) => {
  const allSkills = [
    ...skills.languages,
    ...skills.frameworks,
    ...skills.databases,
    ...skills.tools,
  ];
  return allSkills.slice(0, 5);
};

export const Candidates = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  // Added state for sort order
  const [sortOrder, setSortOrder] = useState<"high-to-low" | "low-to-high">(
    "high-to-low"
  );

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const scrollToCandidate = searchParams.get("candidate");

  const fetchUser = async () => {
    const idToken = await localStorage.getItem(token);
    if (!idToken) {
      toast.error("No session found. Please sign in.");
      navigate("/sign-in");
      return;
    }

    try {
      const res = await axios.get(`${host}/company`, {
        headers: { Authorization: idToken },
      });
      const api2 = await axios.get(`${host}/users`, {
        headers: {
          Authorization: idToken,
        },
      });
      // console.log(res.data);
      // console.log({ email: api2.data.email, name: res.data.name || "" });
      setUser({ email: api2.data.email, name: res.data.name || "" });
    } catch (error: any) {
      console.error("Error fetching user:", error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            toast.error("Session expired. Please sign in again.");
            localStorage.removeItem(token); // Clear invalid token
            navigate("/sign-in");
            break;
          case 400:
            toast.error("Invalid request. Please try again.");
            break;
          case 403:
            toast.error("Access denied. Insufficient permissions.");
            break;
          case 404:
            toast.error("Company data not found.");
            navigate("/settings");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error("Failed to fetch user data.");
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    }
  };

  const fetchCandidates = async (): Promise<Candidate[]> => {
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
        { headers: { Authorization: idToken } }
      );
      console.log(response.data);
      const jobData = response.data[0]?.application.job;
      if (jobData) {
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
          const skillsRes = await axios.get(
            `${host}/company/${companyRes.data.id}/job/${jobId}/application/${e.application.id}`,
            { headers: { Authorization: idToken } }
          );
          console.log(skillsRes.data);
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
              console.log("File", docFile);
            } catch (fileError) {
              console.error(
                "Error fetching file for application",
                e.application.id,
                fileError
              );
              docFile = ""; // Fallback to empty string if file fetch fails
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
              s.type === "required" && (s.is_matched || s.github_project_skill)
          ).length;

          const matchedPreferred = (
            skillsRes.data.application.enhanced_skills || []
          ).filter(
            (s: any) =>
              s.type === "preferred" && (s.is_matched || s.github_project_skill)
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
            status: e.application.status.toLowerCase() as CandidateStatusValue,
            graduation_year: e.user.graduation_year,
            degree: e.user.degree,
            assignmentStatus: {
              submitted:
                !!e.application.assignment_file?.github_repo_url ||
                !!e.application.assignment_file?.live_link_url ||
                !!docFile,
              submittedAt:
                e.application.assignment_file?.created_at ||
                new Date().toISOString(),
              deadline:
                jobData.assignments[0]?.deadline || "2025-05-27T18:29:59",
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
              // e.application.applicant.projects?.length > 0
              //   ? (e.application.applicant.projects || []).reduce(
              //       (sum: number, project: any) =>
              //         sum +
              //         (project && typeof project === "object"
              //           ? project.score || 0
              //           : 0),
              //       0
              //     ) /
              //     (e.application.applicant.projects.length == 0
              //       ? 1
              //       : e.application.applicant.projects.length)
              //   : 0,
              overall_score: overallGithubScore,
            },
            projects: (
              (skillsRes.data.application.applicant.projects as Project[]) || []
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
      // toast.error("Something went wrong...");
      return [];
    }
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

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (location.state) setStatusFilter(location.state);
  }, [location.state]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let candidateData = await fetchCandidates();
        // console.log("Here", candidateData);
        if (scrollToCandidate) {
          candidateData = candidateData.filter(
            (e) => e.id == scrollToCandidate
          );
        }
        setCandidates(candidateData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [jobId]);

  const candidatesForJob = useMemo(
    () =>
      candidates.filter((candidate) => candidate.applyingFor === job?.title),
    [candidates, job]
  );

  const statusOptions: CandidateStatus[] = [
    { value: "assign_status", label: "Assign status", disabled: true },
    { value: "new", label: "New" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offered", label: "Offered" },
    { value: "rejected", label: "Rejected" },
  ];

  const skillFilters = [
    { value: "great", label: "Great Fit" },
    { value: "good", label: "Good Fit" },
    { value: "average", label: "Average Fit" },
  ];

  const statusFilters = statusOptions
    .filter((e) => e.value != "assign_status")
    .map((opt) => ({
      value: opt.value,
      label: opt.label,
    }));

  // Added sort options for the dropdown
  const sortOptions = [
    { value: "high-to-low", label: "Fit: High to Low" },
    { value: "low-to-high", label: "Fit: Low to High" },
  ];

  const filteredCandidates = useMemo(
    () =>
      candidatesForJob
        .filter((candidate) => {
          if (!job) return false;
          const scoreBasedFit = getScoreBasedFit(
            candidate.githubStats.overall_score
          );

          const skillMatchPass =
            !skillFilter || scoreBasedFit.type === skillFilter;
          const statusPass = !statusFilter || candidate.status === statusFilter;

          return skillMatchPass && statusPass;
        })
        // Added sorting logic based on sortOrder
        .sort((a, b) => {
          const scoreA = a.githubStats.overall_score;
          const scoreB = b.githubStats.overall_score;
          return sortOrder === "high-to-low"
            ? scoreB - scoreA
            : scoreA - scoreB;
        }),
    [candidatesForJob, skillFilter, statusFilter, job, sortOrder]
  );

  const scheduleInterview = (candidateId: string) => {
    if (!user?.email) {
      toast.error("We can't find your email");
      return;
    }

    const candidate = candidatesForJob.find((c) => c.id === candidateId);
    if (!candidate) {
      toast.error("Candidate not found");
      return;
    }

    // Set date for the meeting (tomorrow at 10:00 AM)
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(10, 0, 0, 0);

    const meetingTitle = `${user.name} <> ${candidate.name}`;
    const meetingDuration = 60; // in minutes
    const endDate = new Date(date.getTime() + meetingDuration * 60000);

    // Format start and end times in Google Calendar's expected format
    const start = date.toISOString().replace(/[-:]/g, "").split(".")[0];
    const end = endDate.toISOString().replace(/[-:]/g, "").split(".")[0];

    const attendees = [candidate.email, user.email].filter(Boolean);
    const location = "Virtual (Google Meet)";
    // const additionalNotes = `Preparation: Review candidate's GitHub profile at https://github.com/${candidate.githubUsername}\nAgenda: Technical assessment, behavioral questions`;
    const reminders = "15";

    const params = new URLSearchParams({
      text: meetingTitle,
      dates: `${start}/${end}`,
      // details: `Interview for ${job?.title}\nCandidate: ${candidate.name}\n${additionalNotes}`,
      location: location,
      recur: "RRULE:FREQ=DAILY;COUNT=1",
      sf: "true",
      output: "xml",
      trp: reminders,
    });

    // Add guests
    attendees.forEach((email) => params.append("add", email as string));

    // Final URL
    const googleMeetUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?${params.toString()}`;

    window.open(googleMeetUrl, "_blank");
  };

  const updateCandidateStatus = async (
    candidateId: string,
    newStatus: CandidateStatusValue
  ) => {
    try {
      const idToken = localStorage.getItem(token);
      if (!idToken) {
        toast.error("Seems like you are not logged in");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
        return;
      }
      setStatusLoading((prev) => [...prev, candidateId]);
      const companyRes = await axios.get(`${host}/company`, {
        headers: { Authorization: idToken },
      });
      await axios.put(
        `${host}/company/${companyRes.data.id}/job/${jobId}/application/${candidateId}`,
        {
          status: newStatus === "new" ? "new" : newStatus,
        },
        { headers: { Authorization: idToken } }
      );
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, status: newStatus }
            : candidate
        )
      );
      toast.success("Status updated successfully");
    } catch (e: any) {
      console.error("Error updating status", e.message);
      toast.error("Application status was not updated!");
    } finally {
      setStatusLoading((prev) => prev.filter((ele) => ele !== candidateId));
    }
  };

  const toggleFilter = (type: "skill" | "status", value: string | null) => {
    if (type === "skill") {
      setSkillFilter(skillFilter === value ? null : value);
    } else {
      setStatusFilter(statusFilter === value ? null : value);
    }
  };

  if (!jobId || !job) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">No Candidates found for the job</p>
      </div>
    );
  }

  // Function to get color classes based on plagiarism score
  const getPlagiarismColor = (score: number) => {
    if (score <= 20) return "bg-green-100 text-green-700";
    if (score <= 50) return "bg-blue-100 text-blue-700";
    if (score <= 80) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  // Function to get icon color based on plagiarism score
  const getPlagiarismIconColor = (score: number) => {
    if (score <= 20) return "text-green-700";
    if (score <= 50) return "text-blue-700";
    if (score <= 80) return "text-yellow-700";
    return "text-red-700";
  };

  // Function to get plagiarism description for tooltip
  const getPlagiarismDescription = (score: number) => {
    if (score <= 20) {
      return {
        title: "Low Plagiarism (0-20)",
        points: [
          "Strong originality",
          "Unique problem-solving approach",
          "Clear signs of human iteration",
          "Evidence of thought process",
        ],
      };
    }
    if (score <= 50) {
      return {
        title: "Moderate Plagiarism/AI Assistance (21-50)",
        points: [
          "Some sections resemble generic solutions",
          "Signs of minor AI assistance (boilerplate generation)",
          "Core logic is clearly human-driven",
          "Unique aspects are preserved",
        ],
      };
    }
    if (score <= 80) {
      return {
        title: "High Plagiarism/Heavy AI Reliance (51-80)",
        points: [
          "Strong AI-generated characteristics",
          "Predictable patterns and generic naming",
          "Lack of unique approaches",
          "Minimal customization or understanding",
        ],
      };
    }
    return {
      title: "Very High Plagiarism/Blind AI Usage (81-100)",
      points: [
        "Vast majority appears AI-generated",
        "Direct copying without modification",
        "No discernible human intervention",
        "Lack of understanding evident",
      ],
    };
  };

  return (
    <>
      <Button
        size="sm"
        className="bg-blue-600 px-2 justify-start hover:bg-blue-800 text-white w-24"
        onClick={() => navigate("/manage-jobs")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <div className="space-y-4 mt-4 px-2 sm:px-4 lg:px-6 max-w-full overflow-x-auto">
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
            {/* Added sort by dropdown */}
            <div className="flex justify-start">
              <Select
                options={sortOptions}
                value={sortOrder}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSortOrder(e.target.value as "high-to-low" | "low-to-high")
                }
                placeholder="Sort by"
                className="w-48"
              />
            </div>
          </div>
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
                aria-label={`Filter by ${filter.label}`}
              >
                {filter.label}
              </Button>
            ))}
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "primary" : "outline"}
                size="sm"
                onClick={() => toggleFilter("status", filter.value)}
                className={`rounded-full hover:text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-all ${
                  statusFilter === filter.value
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                }`}
                aria-label={`Filter by ${filter.label} status`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
        {loading ? (
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
                    className={`w-full max-w-full mx-auto sm:mx-0
             px-4 sm:px-6
                `}
                    //    ${
                    //   candidate.id === scrollToCandidate &&
                    //   "shadow-blue-700 shadow-2xl border-blue-200 border-solid border-2"
                    // }`
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
                                  aria-label={`View ${candidate.name}'s GitHub profile`}
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
                                    aria-label={`View ${candidate.name}'s portfolio`}
                                  >
                                    <Files className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>Portfolio</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                            <div className="w-full sm:w-32">
                              <span className="text-center hidden sm:block text-xs text-gray-700 mb-1 font-bold">
                                Assign Status
                              </span>
                              <Select
                                options={statusOptions}
                                disabled={statusLoading.includes(candidate.id)}
                                defaultValue={candidate.status}
                                onChange={(
                                  e: React.ChangeEvent<HTMLSelectElement>
                                ) => {
                                  updateCandidateStatus(
                                    candidate.id,
                                    e.target.value as CandidateStatusValue
                                  );
                                }}
                                aria-label={`Change status for ${candidate.name}`}
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-20  sm:mt-5 text-xs sm:text-sm "
                              onClick={() =>
                                setSelectedCandidate(
                                  selectedCandidate === candidate.id
                                    ? null
                                    : candidate.id
                                )
                              }
                              aria-label={
                                selectedCandidate === candidate.id
                                  ? `Hide details for ${candidate.name}`
                                  : `View details for ${candidate.name}`
                              }
                            >
                              {selectedCandidate === candidate.id
                                ? "Hide"
                                : "View"}
                            </Button>
                            <Button
                              size="sm"
                              className="w-full sm:w-28 sm:mt-5 text-xs sm:text-sm"
                              onClick={() => scheduleInterview(candidate.id)}
                              aria-label={`Schedule interview with ${candidate.name}`}
                            >
                              <Video className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                              Schedule
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
                                  <span className="hidden sm:flex"></span>
                                </div>
                                <div className=" my-3 flex flex-wrap gap-1 sm:gap-2">
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
                                    {Number.isFinite(preferredMatch.percentage)
                                      ? Math.round(preferredMatch.percentage)
                                      : 0}
                                    % skill match
                                  </span>
                                  <span className="hidden sm:flex"></span>
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
                                        ...new Set(candidate.skills.languages),
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
                                        ...new Set(candidate.skills.frameworks),
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
                                        ...new Set(candidate.skills.databases),
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
                                      {[...new Set(candidate.skills.tools)].map(
                                        (tool) => (
                                          <Badge
                                            key={tool}
                                            variant="default"
                                            className="text-xs sm:text-sm"
                                          >
                                            {tool}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>

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
                                          candidate.assignmentStatus.submitted
                                            ? "success"
                                            : "warning"
                                        }
                                        className="text-xs"
                                      >
                                        {candidate.assignmentStatus.submitted
                                          ? "Submitted"
                                          : "Pending"}
                                      </Badge>
                                    </div>
                                    {candidate.assignmentStatus.submitted && (
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
                                              href={
                                                candidate.assignmentStatus
                                                  .githubRepo as string
                                              }
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 hover:underline"
                                              aria-label="View assignment GitHub repository"
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
                                              href={
                                                candidate.assignmentStatus
                                                  .liveLink
                                              }
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 hover:underline"
                                              aria-label="View assignment live demo"
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
                                              href={
                                                candidate.assignmentStatus
                                                  .documentation
                                              }
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 hover:underline"
                                              aria-label="View assignment documentation"
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
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-base sm:text-lg font-medium text-gray-900">
                                Projects
                              </h4>
                              <div className="grid gap-3">
                                {candidate.projects.length > 0 ? (
                                  candidate.projects.map((project, index) => {
                                    const plagiarismInfo =
                                      getPlagiarismDescription(
                                        project.ai_plagiarism_score || 0
                                      );

                                    return (
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
                                                  aria-label={`View ${project.name} GitHub repository`}
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
                                                  aria-label={`View ${project.name} live demo`}
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
                                            {/* AI Plagiarism Score - Left button */}
                                            {/* <div
                                              className={`text-xs w-fit font-semibold p-2 rounded-lg flex items-center gap-1 ${getPlagiarismColor(
                                                project.ai_plagiarism_score
                                              )}`}
                                            >
                                              <span className="group relative">
                                                <Info
                                                  className={`h-4 w-4 cursor-help ${getPlagiarismIconColor(
                                                    project.ai_plagiarism_score
                                                  )}`}
                                                  aria-label="AI Plagiarism score details"
                                                />
                                                <div className="absolute hidden group-hover:block bg-blue-100 text-gray-900 text-xs rounded-lg p-3 w-80 -top-20 right-0 z-10 text-left shadow-lg border border-blue-500">
                                                  <p className="font-semibold mb-2 text-gray-800">
                                                    {plagiarismInfo.title}
                                                  </p>
                                                  <ul className="list-disc list-inside space-y-1">
                                                    {project.ai_desc.map(
                                                      (point, i) => (
                                                        <li
                                                          key={i}
                                                          className="leading-relaxed"
                                                        >
                                                          {point}
                                                        </li>
                                                      )
                                                    )}
                                                  </ul>
                                                </div>
                                              </span>
                                              AI Plagiarism:{" "}
                                              {project.ai_plagiarism_score}%
                                            </div> */}

                                            {/* Code Quality Score - Right button (original) */}
                                            <div className="text-xs bg-blue-300/40 text-blue-700 w-fit font-semibold p-2 rounded-lg flex items-center gap-1">
                                              <span className="group relative">
                                                <Info
                                                  className="h-4 w-4 text-blue-700 cursor-help"
                                                  aria-label="Code Quality score details"
                                                />
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
                                    );
                                  })
                                ) : (
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    No projects listed
                                  </p>
                                )}
                              </div>
                            </div>
                            {/* // */}
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
                                      <Info
                                        className="h-4 w-4 text-blue-600 cursor-help mr-1"
                                        aria-label="Overall Score details"
                                      />
                                      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg p-2 w-72 -top-20 right-0 z-10 text-left">
                                        <p className="font-semibold">
                                          Overall Score
                                        </p>
                                        <ul className="list-disc list-inside mt-1">
                                          <li>Code Quality: 60%</li>
                                          <li>Skills matching to job: 40%</li>
                                          {/* <li>Indentation and Formattin: 15%</li>
                                        <li>Code Smells: 20%</li>
                                        <li>
                                          Naming and Declaration Practices: 10%
                                        </li>
                                        <li>Use of Language Features: 5%</li> */}
                                        </ul>
                                      </div>
                                    </span>{" "}
                                    Overall Score
                                  </div>
                                  <div className="mt-1 text-sm font-semibold text-gray-900">
                                    {Number.isFinite(candidate.overall_score)
                                      ? // ? Math.round(
                                        //     candidate.githubStats.overall_score
                                        //   )
                                        Number(
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
                                className="w-full sm:w-36 text-xs sm:text-sm"
                                onClick={() => setSelectedCandidate(null)}
                                aria-label={`Close details for ${candidate.name}`}
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
    </>
  );
};
