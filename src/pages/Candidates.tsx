/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  Github,
  Linkedin,
  Video,
  Code,
  Star,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { calculateGitHubScore } from "@/lib/utils";
import { Select } from "@/components/ui/Select";

interface SkillSet {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
}

interface Project {
  name: string;
  description: string;
  repoUrl: string;
  liveUrl: string;
  technologies: string[];
  highlights: string[];
}

interface AssignmentStatus {
  submitted: boolean;
  submittedAt: string;
  deadline: string;
  score: number | null;
}

interface GithubStats {
  commits: number;
  contributions: number;
  codeQuality: number;
}

interface InovactScore {
  technical: number;
  collaboration: number;
  communication: number;
  overall: number;
}

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  githubUsername: string;
  linkedinUrl: string;
  applyingFor: string;
  status: string;
  assignmentStatus: AssignmentStatus;
  skills: SkillSet;
  githubStats: GithubStats;
  inovactScore: InovactScore;
  projects: Project[];
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

const fetchJobs = async (): Promise<Job[]> => {
  // Simulate API call with dummy data
  return [
    {
      id: "1",
      title: "Senior Full Stack Developer",
      type: "Full-time",
      location: "Remote",
      salary: { min: 500000, max: 800000, currency: "INR" },
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
    },
    {
      id: "2",
      title: "Backend Engineer",
      type: "Full-time",
      location: "On-site",
      salary: { min: 600000, max: 900000, currency: "INR" },
      requiredSkills: [
        "Go",
        "Python",
        "PostgreSQL",
        "Redis",
        "Docker",
        "Kubernetes",
      ],
      preferredSkills: ["Rust", "gRPC", "Kafka", "Terraform"],
    },
    {
      id: "3",
      title: "DevOps Engineer",
      type: "Full-time",
      location: "Hybrid",
      salary: { min: 700000, max: 1000000, currency: "INR" },
      requiredSkills: [
        "Kubernetes",
        "Docker",
        "AWS",
        "Terraform",
        "CI/CD",
        "Python",
      ],
      preferredSkills: ["Go", "Prometheus", "ELK Stack", "Ansible"],
    },
  ];
};

const fetchCandidates = async (): Promise<Candidate[]> => {
  // Simulate API call with dummy data
  return [
    {
      id: "1",
      name: "John Doe",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      githubUsername: "johndoe",
      linkedinUrl: "https://linkedin.com/in/johndoe",
      applyingFor: "Senior Full Stack Developer",
      status: "new",
      assignmentStatus: {
        submitted: true,
        submittedAt: "2024-03-15T10:30:00Z",
        deadline: "2024-03-20T23:59:59Z",
        score: null,
      },
      skills: {
        languages: ["JavaScript", "TypeScript", "Python"],
        frameworks: ["React", "Node.js", "Express", "Next.js"],
        databases: ["MongoDB", "PostgreSQL", "Redis"],
        tools: ["Docker", "AWS", "Git", "Jest"],
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
          name: "E-commerce Platform",
          description:
            "Full-stack e-commerce platform with React, Node.js, and MongoDB",
          repoUrl: "https://github.com/johndoe/ecommerce",
          liveUrl: "https://ecommerce-demo.com",
          technologies: ["React", "Node.js", "MongoDB", "Redis", "AWS"],
          highlights: [
            "Implemented real-time inventory management using WebSocket",
            "Integrated Stripe payment gateway with custom checkout flow",
            "Built responsive admin dashboard with real-time analytics",
          ],
        },
      ],
    },
    {
      id: "2",
      name: "Jane Smith",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      githubUsername: "janesmith",
      linkedinUrl: "https://linkedin.com/in/janesmith",
      applyingFor: "Backend Engineer",
      status: "new",
      assignmentStatus: {
        submitted: true,
        submittedAt: "2024-03-14T15:45:00Z",
        deadline: "2024-03-19T23:59:59Z",
        score: 92,
      },
      skills: {
        languages: ["Go", "Python", "Rust"],
        frameworks: ["Gin", "FastAPI", "gRPC"],
        databases: ["PostgreSQL", "Redis", "Cassandra"],
        tools: ["Docker", "Kubernetes", "Terraform"],
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
          name: "Distributed Cache",
          description: "High-performance distributed caching system in Go",
          repoUrl: "https://github.com/janesmith/dcache",
          liveUrl: "https://dcache-demo.com",
          technologies: ["Go", "Redis", "gRPC", "Prometheus"],
          highlights: [
            "Implemented consistent hashing for data distribution",
            "Built monitoring system with Prometheus and Grafana",
            "Achieved 99.99% uptime in production",
          ],
        },
      ],
    },
    {
      id: "3",
      name: "Alex Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      githubUsername: "alexchen",
      linkedinUrl: "https://linkedin.com/in/alexchen",
      applyingFor: "Senior Full Stack Developer",
      status: "shortlisted",
      assignmentStatus: {
        submitted: true,
        submittedAt: "2024-03-13T09:15:00Z",
        deadline: "2024-03-18T23:59:59Z",
        score: 88,
      },
      skills: {
        languages: ["JavaScript", "TypeScript"],
        frameworks: ["React", "Next.js"],
        databases: ["MongoDB"],
        tools: ["Docker", "Git"],
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
          name: "Task Manager",
          description: "Real-time collaborative task management app",
          repoUrl: "https://github.com/alexchen/task-manager",
          liveUrl: "https://task-manager-demo.com",
          technologies: ["React", "Node.js", "MongoDB"],
          highlights: [
            "Built real-time collaboration features",
            "Implemented drag-and-drop interface",
          ],
        },
      ],
    },
  ];
};

const calculateSkillMatch = (
  candidateSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[]
) => {
  const requiredMatches = requiredSkills.filter((skill) =>
    candidateSkills.some(
      (candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase()
    )
  );

  const preferredMatches = preferredSkills.filter((skill) =>
    candidateSkills.some(
      (candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase()
    )
  );

  const requiredMatchPercentage =
    (requiredMatches.length / requiredSkills.length) * 100;
  const preferredMatchPercentage =
    (preferredMatches.length / preferredSkills.length) * 100;

  return {
    required: {
      matched: requiredMatches,
      percentage: requiredMatchPercentage,
    },
    preferred: {
      matched: preferredMatches,
      percentage: preferredMatchPercentage,
    },
    recommendation: getRecommendation(
      requiredMatchPercentage,
      preferredMatchPercentage
    ),
  };
};

const getRecommendation = (requiredMatch: number, preferredMatch: number) => {
  if (requiredMatch >= 85 && preferredMatch >= 50) {
    return {
      type: "great",
      label: "Great Fit",
      color: "bg-green-100 text-green-800",
      description: "Candidate matches most required and preferred skills",
    };
  } else if (requiredMatch >= 70) {
    return {
      type: "good",
      label: "Good Fit",
      color: "bg-blue-100 text-blue-800",
      description: "Candidate matches essential required skills",
    };
  } else {
    return {
      type: "not",
      label: "Not a Fit",
      color: "bg-red-100 text-red-800",
      description: "Candidate lacks several required skills",
    };
  }
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

export const Candidates = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobData, candidateData] = await Promise.all([
          fetchJobs(),
          fetchCandidates(),
        ]);
        setJobs(jobData);
        setCandidates(candidateData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const currentJob = jobs.find((job) => job.id === jobId);
  if (!jobId || !currentJob) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Invalid job ID</p>
      </div>
    );
  }

  const candidatesForJob = candidates.filter(
    (candidate) => candidate.applyingFor === currentJob.title
  );

  const statusOptions = [
    { value: "assign_status", label: "Assign status" },
    { value: "new", label: "New" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offered", label: "Offered" },
    { value: "rejected", label: "Rejected" },
  ];

  const skillFilters = [
    { value: "great", label: "Great Fit" },
    { value: "good", label: "Good Fit" },
    { value: "not", label: "Not a Fit" },
  ];

  const statusFilters = statusOptions.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  const filteredCandidates = candidatesForJob.filter((candidate) => {
    const skillMatch = calculateSkillMatch(
      [
        ...candidate.skills.languages,
        ...candidate.skills.frameworks,
        ...candidate.skills.databases,
        ...candidate.skills.tools,
      ],
      currentJob.requiredSkills,
      currentJob.preferredSkills
    );

    const skillMatchPass =
      !skillFilter || skillMatch.recommendation.type === skillFilter;
    const statusPass = !statusFilter || candidate.status === statusFilter;

    return skillMatchPass && statusPass;
  });

  const scheduleInterview = (candidateId: string) => {
    const candidate = candidatesForJob.find((c) => c.id === candidateId);
    if (!candidate) return;

    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(10, 0, 0, 0);

    const meetingTitle = `Interview with ${candidate.name} for ${currentJob.title}`;
    const meetingDuration = 60;

    const googleMeetUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(
      meetingTitle
    )}&dates=${date.toISOString().replace(/[-:]/g, "").split(".")[0]}/${
      new Date(date.getTime() + meetingDuration * 60000)
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0]
    }&details=${encodeURIComponent(
      `Interview for ${currentJob.title}\nCandidate: ${candidate.name}\nGitHub: https://github.com/${candidate.githubUsername}`
    )}&add=${encodeURIComponent("meet.google.com")}`;

    window.open(googleMeetUrl, "_blank");
  };

  const updateCandidateStatus = (candidateId: string, newStatus: string) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, status: newStatus }
          : candidate
      )
    );
  };

  const toggleFilter = (type: "skill" | "status", value: string | null) => {
    if (type === "skill") {
      setSkillFilter(skillFilter === value ? null : value);
    } else {
      setStatusFilter(statusFilter === value ? null : value);
    }
  };

  return (
    <>
      <Button
        size="sm"
        className="bg-blue-600 px-2 sm: justify-start hover:bg-blue-800 text-white w-24 sm:w-24"
        onClick={() => navigate("/manage-jobs")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <div className="space-y-4 mt-4 px-2 sm:px-4 lg:px-6 max-w-full overflow-x-hidden">
        <div className="space-y-3">
          <div className="flex flex-col gap-3">
            <div className="space-y-1 text-center sm:text-left">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Candidates for {currentJob.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {currentJob.type} · {currentJob.location} · INR{" "}
                {currentJob.salary.min.toLocaleString()} -{" "}
                {currentJob.salary.max.toLocaleString()}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {filteredCandidates.length} candidate
                {filteredCandidates.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 pb-2 border-b border-gray-200">
            {skillFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={skillFilter === filter.value ? "primary" : "outline"}
                size="sm"
                onClick={() => toggleFilter("skill", filter.value)}
                className={`rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-all ${
                  skillFilter === filter.value
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 hover:text-white border-gray-300"
                }`}
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
                className={`rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-all ${
                  statusFilter === filter.value
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 hover:text-white border-gray-300"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredCandidates.map((candidate, index) => {
            const skillMatch = calculateSkillMatch(
              [
                ...candidate.skills.languages,
                ...candidate.skills.frameworks,
                ...candidate.skills.databases,
                ...candidate.skills.tools,
              ],
              currentJob.requiredSkills,
              currentJob.preferredSkills
            );
            const topSkills = getTopSkills(candidate.skills);

            return (
              <Card
                key={candidate.id}
                className="max-w-[21rem] mx-auto sm:mx-0 sm:max-w-full"
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
                          <p className="text-xs text-gray-500">
                            Rank #{index + 1}
                          </p>
                          <div className="text-xs sm:text-sm text-blue-600 font-medium truncate mb-1">
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
                            <a
                              href={candidate.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 hover:text-gray-700"
                            >
                              <Linkedin className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>LinkedIn</span>
                            </a>
                            <a
                              href={candidate.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 hover:text-gray-700"
                            >
                              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Inovact</span>
                            </a>
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
                            defaultValue={candidate.status}
                            onValueChange={(value) =>
                              updateCandidateStatus(candidate.id, value)
                            }
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-20 sm:mt-5 text-xs sm:text-sm hover:text-white"
                          onClick={() =>
                            setSelectedCandidate(
                              selectedCandidate === candidate.id
                                ? null
                                : candidate.id
                            )
                          }
                        >
                          {selectedCandidate === candidate.id ? "Hide" : "View"}
                        </Button>
                        <Button
                          size="sm"
                          className="w-full sm:w-28 sm:mt-5 text-xs sm:text-sm"
                          onClick={() => scheduleInterview(candidate.id)}
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
                          {topSkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="default"
                              className="text-xs sm:text-sm font-medium"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                Required Skills Match
                              </h4>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {Math.round(skillMatch.required.percentage)}%
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1 sm:gap-2">
                              {currentJob.requiredSkills.map((skill) => {
                                const isMatched =
                                  skillMatch.required.matched.includes(skill);
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
                                {Math.round(skillMatch.preferred.percentage)}%
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1 sm:gap-2">
                              {currentJob.preferredSkills.map((skill) => {
                                const isMatched =
                                  skillMatch.preferred.matched.includes(skill);
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
                          className={`rounded-lg p-3 ${skillMatch.recommendation.color}`}
                        >
                          <h4 className="font-medium text-sm sm:text-base">
                            {skillMatch.recommendation.label}
                          </h4>
                          <p className="mt-1 text-xs sm:text-sm">
                            {skillMatch.recommendation.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedCandidate === candidate.id && (
                      <div className="mt-4 space-y-4 border-t pt-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                          <div className="flex-1 space-y-3">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                              Programming Languages
                            </h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {candidate.skills.languages.map((lang) => (
                                <Badge
                                  key={lang}
                                  variant="default"
                                  className="text-xs sm:text-sm"
                                >
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                              Frameworks & Libraries
                            </h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {candidate.skills.frameworks.map((framework) => (
                                <Badge
                                  key={framework}
                                  variant="default"
                                  className="text-xs sm:text-sm"
                                >
                                  {framework}
                                </Badge>
                              ))}
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                              Databases
                            </h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {candidate.skills.databases.map((db) => (
                                <Badge
                                  key={db}
                                  variant="default"
                                  className="text-xs sm:text-sm"
                                >
                                  {db}
                                </Badge>
                              ))}
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                              Tools & Technologies
                            </h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {candidate.skills.tools.map((tool) => (
                                <Badge
                                  key={tool}
                                  variant="default"
                                  className="text-xs sm:text-sm"
                                >
                                  {tool}
                                </Badge>
                              ))}
                            </div>
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
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-600">
                                        Score
                                      </span>
                                      <span className="text-xs font-medium">
                                        {candidate.assignmentStatus.score ??
                                          "Pending Review"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-600">
                                        GitHub
                                      </span>
                                      <a
                                        href={`https://github.com/${candidate.githubUsername}/assignment`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                      >
                                        View
                                      </a>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-600">
                                        Live
                                      </span>
                                      <a
                                        href={`https://${candidate.githubUsername}.github.io/assignment`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                      >
                                        View
                                      </a>
                                    </div>
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
                            <div className="rounded-lg bg-blue-50 p-3">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                Inovact Score
                              </h4>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">
                                    Assignment
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <Code className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                    <span className="font-medium text-blue-600 text-xs sm:text-sm">
                                      {candidate.inovactScore.technical}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">
                                    Overall Score
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                    <span className="text-sm sm:text-lg font-semibold text-blue-600">
                                      {candidate.inovactScore.overall}
                                    </span>
                                  </div>
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
                            {candidate.projects.map((project, index) => (
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
                                      <a
                                        href={project.repoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        <Github className="h-4 w-4 sm:h-5 sm:w-5" />
                                      </a>
                                      <a
                                        href={project.liveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                                      </a>
                                    </div>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    {project.description}
                                  </p>
                                  <div className="space-y-1">
                                    <h6 className="text-xs sm:text-sm font-medium text-gray-700">
                                      Key Highlights:
                                    </h6>
                                    <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1">
                                      {project.highlights.map(
                                        (highlight, i) => (
                                          <li key={i}>{highlight}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                  <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {project.technologies.map((tech) => (
                                      <Badge
                                        key={tech}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {tech}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="text-xs bg-blue-300/40 text-blue-700 w-fit ml-auto font-semibold p-2 rounded-lg text-right">
                                    Code Quality: 85%
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="rounded-lg bg-gray-50 p-2 min-h-[8rem] bg-gradient-to-t from-blue-50 to-gray-50 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-xs font-medium text-gray-500">
                                Commits
                              </div>
                              <div className="mt-1 text-base font-semibold text-gray-900">
                                {candidate.githubStats.commits}
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-2 min-h-[8rem] bg-gradient-to-t from-blue-50 to-gray-50 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-xs font-medium text-gray-500">
                                Contributions
                              </div>
                              <div className="mt-1 text-base font-semibold text-gray-900">
                                {candidate.githubStats.contributions}
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-2 min-h-[8rem] bg-gradient-to-t from-blue-50 to-gray-50 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-xs font-medium text-gray-500">
                                Code Quality
                              </div>
                              <div className="mt-1 text-base font-semibold text-gray-900">
                                {candidate.githubStats.codeQuality}%
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg bg-blue-50 p-2 min-h-[8rem] bg-gradient-to-t from-blue-100 to-blue-50 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-xs font-medium text-blue-600">
                                Overall Score
                              </div>
                              <div className="mt-1 text-base font-semibold text-blue-600">
                                {calculateGitHubScore(candidate.githubStats)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:text-white w-full sm:w-36 text-xs sm:text-sm"
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
      </div>
    </>
  );
};
