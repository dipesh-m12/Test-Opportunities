"use client";

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form"; // Add Controller import
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui/Spinner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Textarea } from "@/components/ui/Textarea";
import { BlackSpinner } from "@/components/ui/BlackSpinner";
import toast from "react-hot-toast";
import { host } from "@/utils/routes";
import axios from "axios";
import { token } from "@/utils";
import moment from "moment";

// Custom Toggle Switch Component
const ToggleSwitch = ({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col">
        <label
          className={`text-sm font-semibold text-gray-800 ${
            disabled ? "opacity-50" : "cursor-pointer"
          }`}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
        <p className="text-xs text-gray-500 mt-1">
          {checked 
            ? "Assignment is required for this job position" 
            : "Toggle to add an assignment for candidates to complete"
          }
        </p>
        {!checked && (
          <p className="text-xs text-red-500 mt-1">
            Note: This can't be changed later
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg hover:scale-105
          ${checked 
            ? "bg-gradient-to-r from-blue-500 to-blue-600 focus:ring-blue-300" 
            : "bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-300"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-xl"}
        `}
      >
        <span
          className={`
            inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 ease-in-out shadow-md
            ${checked ? "translate-x-7" : "translate-x-1"}
            ${checked ? "shadow-blue-200" : "shadow-gray-200"}
          `}
        >
          {/* Icon inside the toggle */}
          <div className="flex items-center justify-center h-full w-full">
            {checked ? (
              <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </span>
      </button>
    </div>
  );
};

interface JobFormData {
  id?: string;
  title: string;
  type: string;
  status: string;
  location: string;
  city?: string;
  // stipend?: string;
  stipend?: {
    min: string;
    max: string;
  }; // Updated to object for min/max stipend for internships
  salary?: {
    min: string;
    max: string;
  };
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  assignment?: {
    description: string;
    deadline: string;
    file: File;
    submissionPreferences: string[];
  };
  applicationDeadline: string;
  duration?: string;
  min_salary?: string;
  max_salary?: string;
  deadline?: string;
  work_mode?: string;
  hasAssignment?: boolean;
}

interface FetchedJobDetails {
  job: Partial<JobFormData>;
  skills: {
    preferredSkills: Array<{
      id: string;
      skill: string;
    }>;
    requiredSkills: Array<{
      id: string;
      skill: string;
    }>;
  };
  assignment: Partial<{
    id: string;
    description: string;
    deadline: string;
    SubmissionType?: string;
    // submissionPreferences: string[];
    githubRepo: boolean;
    liveLink: boolean;
    documentation: boolean;
  }>;
  file: Partial<{
    file: string;
    id: string;
  }>;
  blob?: any;
  assignBlob?: any;
}

const jobTypes = [
  { value: "full-time", label: "Full-time" },
  { value: "internship", label: "Internship" },
];

const jobStatuses = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }, //Withdrawn
  { value: "closed", label: "Closed" },
];

const locations = [
  { value: "Remote", label: "Remote" },
  { value: "Office", label: "On-site" },
  { value: "Hybrid", label: "Hybrid" },
];

const durations = [
  { value: "1", label: "1 Month" },
  { value: "2", label: "2 Months" },
  { value: "3", label: "3 Months" },
  { value: "4", label: "4 Months" },
  { value: "5", label: "5 Months" },
  { value: "6", label: "6 Months" },
  // { value: "9999", label: "Custom" },
];

const techJobSuggestions = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
];

const indianCities = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Gurgaon",
];

const submissionPreferencesOptions = [
  { value: "github", label: "GitHub Repo of the Assignment" },
  { value: "liveLink", label: "Live Link of the Assignment" },
  { value: "documentation", label: "Documentation" },
];

const SKILLS_LIST = [
  // Programming Languages
  "python",
  "java",
  "javascript",
  "dart",
  "go",
  "c#",
  "ruby",
  "rust",
  "php",
  "swift",
  "kotlin",
  "typescript",
  "R",
  "Julia",
  "c",
  // Markup Languages
  "html",
  "xml",
  // Stylesheet Languages
  "css",
  "tailwind css",
  "Bootstrap",
  // Frameworks/Major UI Libraries
  "flutter",
  "react",
  "angular",
  "vue.js",
  "django",
  "node.js/express",
  "springboot",
  ".net",
  "next.js",
  "rubyonrails",
  "laravel",
  "svelte",
  "kotlinmultiplatform",
  "swiftui",
  "androidjetpackcompose",
  "scikit-learn",
  "XGBoost",
  "LightGBM",
  "CatBoost",
  "TensorFlow",
  "Keras",
  "PyTorch",
  "statsmodels",
  "Pandas",
  "NumPy",
  "Matplotlib",
  "Seaborn",
  "HuggingFaceTransformers",
  "LangChain",
  "LlamaIndex",
  "OpenCV",
  "spaCy",
  "nltk",
  "SentenceTransformers",
  "gradio",
  "streamlit",
  "fastAPI",
  "flask",
  // State Management Solutions
  "bloc",
  "provider",
  "redux",
  "mobx",
  "vuex",
  "recoil",
  "zustand",
  "pinia",
  "ngrx",
  "rxjava",
  "riverpod",
  // Database
  "postgresql",
  "mongodb",
  "mysql",
  "firebase",
  "sqlite",
  "realm",
  "cassandra",
  "redis",
  "sqlserver",
  "snowflake",
  // Cloud Services
  "aws ec2",
  "aws lambda",
  "aws rds",
  "google cloud firebase",
  "googlecloudappengine",
  "googlecloudcomputeengine",
  "azurefunctions",
  "azurecosmosdb",
  "azureblobstorage",
  "vercel",
  "netlify",
  "heroku",
  "azure",
  "gcp",
  // AI Techniques
  "rag",
  "nlp",
  "genai",
  "llm",
  "TesseractOCR",
  "EasyOCR",
  "PaddleOCR",
  "OCRopus",
  "KrakenOCR",
  "GoogleCloudVisionOCR",
  "AWSTextract",
  "MicrosoftAzureOCR",
  "OCR.spaceAPI",
  "ABBYYFineReaderSDK",
  "ScanbotSDK",
  "DynamsoftOCRSDK",
  "Keras-OCR",
  "LayoutLM",
  "LayoutXLM",
  // Version Control
  "Git",
  // DevOps
  "docker",
  "kubernetes",
  "jenkins",
  "ansible",
  "terraform",
];

export const PostJob = ({ isPhoneNumber }: any) => {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    trigger,
  } = useForm<JobFormData>({
    defaultValues: {
      requiredSkills: [],
      preferredSkills: [],
      description: "",
      hasAssignment: false,
      assignment: {
        submissionPreferences: [],
        // deadline: moment("2024-06-05").format("YYYY-MM-DD"),
      },
    },
  });

  const jobType = watch("type");
  const location = watch("location");
  const description = watch("description");
  const hasAssignment = watch("hasAssignment");

  // Watch salary fields to enable dynamic validation
  const minSalary = watch("salary.min");
  const maxSalary = watch("salary.max");
  const minStipend = watch("stipend.min"); // Added for internship stipend
  const maxStipend = watch("stipend.max"); // Added for internship stipend
  const duration = watch("duration");
  const status = watch("status");
  const needsCity = location === "Office" || location === "Hybrid";

  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const location_state = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renderLoading, setRenderLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const data = location_state.state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const [link, setlink] = useState("");
  const [requiredInput, setRequiredInput] = useState("");
  const [preferredInput, setPreferredInput] = useState("");
  const [requiredSuggestions, setRequiredSuggestions] = useState<string[]>([]);
  const [preferredSuggestions, setPreferredSuggestions] = useState<string[]>(
    []
  );
  const [showRequiredSuggestions, setShowRequiredSuggestions] = useState(false);
  const [showPreferredSuggestions, setShowPreferredSuggestions] =
    useState(false);
  const [selectedRequiredIndex, setSelectedRequiredIndex] = useState(-1); // Track selected suggestion for required skills
  const [selectedPreferredIndex, setSelectedPreferredIndex] = useState(-1); // Track selected suggestion for preferred skills
  const [fetchedJobDetails, setFetchedJobDetails] = useState<FetchedJobDetails>(
    {
      job: {},
      skills: {
        preferredSkills: [],
        requiredSkills: [],
      },
      assignment: {},
      file: {},
      blob: {},
      assignBlob: {},
    }
  );

  useEffect(() => {
    if (!isPhoneNumber) navigate("/settings");
  }, [isPhoneNumber]);

  const [searchParams] = useSearchParams();
  const edit = searchParams.get("edit");

  // Handle assignment toggle
  const handleAssignmentToggle = (checked: boolean) => {
    setValue("hasAssignment", checked, { shouldValidate: true });

    // Clear assignment fields when toggled off
    if (!checked) {
      setValue("assignment.description", "");
      setValue("assignment.deadline", "");
      setValue("assignment.submissionPreferences", []);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFileError(undefined);
    }
  };

  // Handle skill suggestions
  const filterSuggestions = (input: string, type: "required" | "preferred") => {
    if (!input) return [];
    const lowerInput = input.toLowerCase();
    const otherSkills = type === "required" ? preferredSkills : requiredSkills;
    return SKILLS_LIST.filter(
      (skill) =>
        skill.toLowerCase().includes(lowerInput) &&
        !requiredSkills.includes(skill) &&
        !preferredSkills.includes(skill)
    ).slice(0, 5); // Limit to 5 suggestions
  };

  // Update suggestions based on input
  useEffect(() => {
    setRequiredSuggestions(filterSuggestions(requiredInput, "required"));
    setShowRequiredSuggestions(
      requiredInput.length > 0 && requiredSkills.length < 5
    );
    setSelectedRequiredIndex(-1); // Reset selection when suggestions change
  }, [requiredInput, requiredSkills, preferredSkills]);

  useEffect(() => {
    setPreferredSuggestions(filterSuggestions(preferredInput, "preferred"));
    setShowPreferredSuggestions(
      preferredInput.length > 0 && preferredSkills.length < 5
    );
    setSelectedPreferredIndex(-1); // Reset selection when suggestions change
  }, [preferredInput, preferredSkills, requiredSkills]);

  const handleSkillAdd = (
    type: "required" | "preferred",
    skill: string,
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | { currentTarget: HTMLInputElement; preventDefault: () => void }
  ) => {
    e.preventDefault();
    const trimmedSkill = skill.trim();
    if (!trimmedSkill) return;

    const skillsArray = type === "required" ? requiredSkills : preferredSkills;
    const otherSkills = type === "required" ? preferredSkills : requiredSkills;

    if (skillsArray.length >= 5) return; // max 5 skills
    if (
      skillsArray.includes(trimmedSkill) ||
      otherSkills.includes(trimmedSkill)
    )
      return; // no duplicates or cross-category skills

    const newSkills = [...skillsArray, trimmedSkill];
    if (type === "required") {
      setRequiredSkills(newSkills);
      setValue("requiredSkills", newSkills, { shouldValidate: true });
      setRequiredInput("");
      setShowRequiredSuggestions(false);
      setSelectedRequiredIndex(-1); // Reset selection
    } else {
      setPreferredSkills(newSkills);
      setValue("preferredSkills", newSkills, { shouldValidate: true });
      setPreferredInput("");
      setShowPreferredSuggestions(false);
      setSelectedPreferredIndex(-1); // Reset selection
    }
    e.currentTarget.value = "";
  };

  const removeSkill = (type: "required" | "preferred", skill: string) => {
    const skillsArray = type === "required" ? requiredSkills : preferredSkills;
    const newSkills = skillsArray.filter((s) => s !== skill);
    if (type === "required") {
      setRequiredSkills(newSkills);
      setValue("requiredSkills", newSkills, { shouldValidate: true });
    } else {
      setPreferredSkills(newSkills);
      setValue("preferredSkills", newSkills, { shouldValidate: true });
    }
  };

  const selectSuggestion = (type: "required" | "preferred", skill: string) => {
    handleSkillAdd(type, skill, {
      preventDefault: () => {},
      currentTarget: { value: skill } as HTMLInputElement,
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "required" | "preferred"
  ) => {
    const suggestions =
      type === "required" ? requiredSuggestions : preferredSuggestions;
    const selectedIndex =
      type === "required" ? selectedRequiredIndex : selectedPreferredIndex;
    const setSelectedIndex =
      type === "required"
        ? setSelectedRequiredIndex
        : setSelectedPreferredIndex;

    if (e.key === "Enter") {
      e.preventDefault();
      if (
        selectedIndex >= 0 &&
        selectedIndex < suggestions.length &&
        suggestions[selectedIndex]
      ) {
        // If a suggestion is highlighted, select it
        selectSuggestion(type, suggestions[selectedIndex]);
      } else {
        // Otherwise, add the input value as a skill
        handleSkillAdd(type, e.currentTarget.value, e);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault(); // Prevent page scrolling
      if (suggestions.length > 0) {
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); // Prevent page scrolling
      if (suggestions.length > 0) {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      }
    }
  };

  useEffect(() => {
    if (data && data.isEditing) {
      setIsEditing(data.isEditing);
    }
  }, [data, setValue]);

  useEffect(() => {
    if (data && data.isEditing) {
      console.log("editing", edit);
      const idToken = localStorage.getItem(token);
      if (!idToken) {
        toast.error("Seems like you are not logged in");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
        return;
      }
      async function getData() {
        //companyId
        try {
          setRenderLoading(true);
          console.log("here");
          const response = await axios.get(`${host}/company`, {
            headers: {
              Authorization: idToken,
            },
          });
          console.log("Company", response.data);
          const companyId = response.data.id;
          const job = await axios.get(
            `${host}/company/${companyId}/job/${edit}`,
            {
              headers: {
                Authorization: idToken,
              },
            }
          );
          console.log("Job", job.data);
          const data = job.data;

          // Check if job has assignments
          const hasAssignments =
            data.assignments && data.assignments.length > 0;

          let assignmentData = {};
          const submissionPreferences: string[] = [];

          if (hasAssignments) {
            const assign = await axios.get(
              `${host}/company/${companyId}/job/${edit}/assignment/${job.data.assignments[0].id}`,
              {
                headers: {
                  Authorization: idToken,
                },
              }
            );
            console.log("Assignment", assign.data);

            assignmentData = {
              id: job.data.assignments[0].id,
              description: data.assignments[0].description,
              SubmissionType: "file",
              deadline: moment(data.assignments[0].deadline).format(
                "YYYY-MM-DD"
              ),
              githubRepo: data.assignments[0].requireGitHubRepo,
              liveLink: data.assignments[0].requireLiveLink,
              documentation: data.assignments[0].requireDocumentation,
            };

            // Map boolean flags to submissionPreferences array
            if (data.assignments[0].requireGitHubRepo)
              submissionPreferences.push("github");
            if (data.assignments[0].requireLiveLink)
              submissionPreferences.push("liveLink");
            if (data.assignments[0].requireDocumentation)
              submissionPreferences.push("documentation");

            setlink(assign.data.file_download_url);
          }

          const refineData: FetchedJobDetails = {
            job: {
              id: job.data.id,
              title: data.title,
              description: data.description,
              type: data.type,
              city: data.work_mode == "Remote" ? "" : data.city || "",
              min_salary:
                data.type == "full-time"
                  ? data!.min_salary!
                  : data!.min_salary!,
              //stipend
              max_salary:
                data.type == "full-time"
                  ? data!.max_salary!
                  : data!.max_salary!,
              stipend: data.type !== "full-time" ? data.min_salary : "",
              // CHANGE: Map min_salary and max_salary to stipend for internships
              salary: {
                min: job.data.min_salary, // Map min_salary to salary.min
                max: job.data.max_salary, // Map max_salary to salary.max
              },
              status: data.status,
              duration: `${data.duration === 9999 ? "6" : data.duration}`,
              deadline: moment(data.deadline).format("YYYY-MM-DD"),
              work_mode: data.work_mode,
              hasAssignment: hasAssignments,
            },
            assignment: assignmentData,
            skills: {
              preferredSkills: data.job_skills
                .filter((e: any) => e.type == "preferred")
                .map((e: any) => ({ skill: e.skill, id: e.id })),
              requiredSkills: data.job_skills
                .filter((e: any) => e.type == "required")
                .map((e: any) => ({ skill: e.skill, id: e.id })),
            },
            file: hasAssignments
              ? {
                  file: link,
                  id: job.data.assignments[0].id,
                }
              : {},
            blob: job.data,
            assignBlob: hasAssignments ? assignmentData : {},
          };
          setFetchedJobDetails(refineData);
          console.log(refineData);

          //set the fields
          reset({
            title: refineData.job.title,
            type: refineData.job.type,
            status: refineData.job.status,
            location: refineData.job.work_mode,
            city: refineData.job.city,
            stipend: refineData.job.stipend,
            salary: {
              min: refineData.job.min_salary,
              max: refineData.job.max_salary,
            },
            description: refineData.job.description,
            requiredSkills: refineData.skills.requiredSkills.map(
              (e) => e.skill
            ),
            preferredSkills: refineData.skills.preferredSkills.map(
              (e) => e.skill
            ),
            hasAssignment: hasAssignments,
            assignment: hasAssignments
              ? {
                  description: refineData.assignment.description,
                  deadline: moment(refineData.assignment.deadline).format(
                    "YYYY-MM-DD"
                  ),
                  // file: new File([], ""), // Reset file input
                  submissionPreferences,
                }
              : {
                  description: "",
                  deadline: "",
                  submissionPreferences: [],
                },
            applicationDeadline: moment(refineData.job.deadline).format(
              "YYYY-MM-DD"
            ),
            duration: refineData.job.duration,
          });
          setRequiredSkills(
            refineData.skills.requiredSkills.map((e) => e.skill)
          );
          setPreferredSkills(
            refineData.skills.preferredSkills.map((e) => e.skill)
          );
        } catch (e) {
          console.error("Error", e);
          toast.error("Error fetching the job");
        } finally {
          setRenderLoading(false);
        }
      }
      getData();
    }
  }, [edit, data]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("title", value, { shouldValidate: true }); // Update form value with user input
    if (value) {
      const filteredSuggestions = techJobSuggestions.filter((job) =>
        job.toLowerCase().includes(value.toLowerCase())
      );
      setTitleSuggestions(filteredSuggestions);
      setShowTitleSuggestions(true);
    } else {
      setShowTitleSuggestions(false);
    }
  };

  const handleTitleSelect = (suggestion: string) => {
    setValue("title", suggestion, { shouldValidate: true });
    setShowTitleSuggestions(false);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("city", value, { shouldValidate: true }); // Update form value with user input
    if (value) {
      const filteredSuggestions = indianCities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setCitySuggestions(filteredSuggestions);
      setShowCitySuggestions(true);
    } else {
      setShowCitySuggestions(false);
    }
  };

  const handleCitySelect = (suggestion: string) => {
    setValue("city", suggestion, { shouldValidate: true });
    setShowCitySuggestions(false);
  };

  const handleDescriptionChange = (value: string) => {
    const plainText = value.replace(/<[^>]*>/g, "");
    if (plainText.length <= 5000) {
      setValue("description", value, { shouldValidate: true });
    }
  };

  // Custom validation function for assignment deadline
  const validateDeadline = (value: string) => {
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for comparison
    return true;
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 5, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  // Custom validation functions
  const validateMinSalary = (value: string) => {
    const numValue = Number.parseFloat(value) || 0;
    if (numValue < 0) {
      return "Minimum salary cannot be negative";
    }
    if (maxSalary && Number.parseFloat(maxSalary) < numValue) {
      return "Minimum salary must be less than or equal to maximum salary";
    }
    return true;
  };

  const validateMaxSalary = (value: string) => {
    const numValue = Number.parseFloat(value) || 0;
    if (numValue < 0) {
      return "Maximum salary cannot be negative";
    }
    if (minSalary && numValue < Number.parseFloat(minSalary)) {
      return "Maximum salary must be greater than or equal to minimum salary";
    }
    return true;
  };

  const onUpdate = async (data: JobFormData) => {
    if (!edit) {
      toast.error("Can not find the id to your job");
      return;
    }

    const file = fileInputRef.current?.files?.[0];

    // Validate assignment fields only if assignment is enabled
    if (data.hasAssignment) {
      let fileValidationError;
      if (!file && !link) {
        fileValidationError = "Assignment file is required";
        setFileError(fileValidationError);
        setLoading(false);
        return;
      }
      if (file && file.type !== "application/pdf") {
        fileValidationError = "Only PDF files are allowed";
        setFileError(fileValidationError);
        setLoading(false);
        return;
      }
      setFileError(undefined);
    }

    // Prepare data with correct file
    const submissionData = {
      ...data,
      assignment: data.hasAssignment
        ? {
            ...data.assignment,
            file,
          }
        : undefined,
    };

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
      console.log("Updating");
      const response = await axios.get(`${host}/company`, {
        headers: {
          Authorization: idToken,
        },
      });
      const companyId = response.data.id;

      //create job
      const job = await axios.put(
        `${host}/company/${response.data.id}/job/${edit}`,
        {
          title: submissionData.title,
          description: submissionData.description,
          type: submissionData.type,
          city:
            submissionData.location == "Remote"
              ? ""
              : submissionData.city || "",
          min_salary: +submissionData!.salary!.min,
          max_salary: +submissionData!.salary!.max,
          // CHANGE: Added stipend field for internships to API payload
          stipend:
            submissionData.type === "internship"
              ? `${submissionData!.salary!.min}-${submissionData!.salary!.max}`
              : undefined,
          status: submissionData.status || "active",
          duration:
            submissionData.type == "internship"
              ? +submissionData.duration! || 0
              : 0,
          deadline: moment(submissionData.applicationDeadline, "YYYY-MM-DD")
            .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
            .toISOString(),
          work_mode: submissionData.location,
        },
        {
          headers: {
            Authorization: idToken, // Use ID token for authorization
          },
        }
      );

      const jobId = job.data.id;

      //create skills
      const skillPromises: Promise<any>[] = [];
      //delete skills
      fetchedJobDetails.skills.preferredSkills.forEach((skill) => {
        skillPromises.push(
          axios.delete(
            `${host}/company/${companyId}/job/${edit}/skills/${skill.id}`,
            {
              headers: {
                Authorization: idToken,
                "Content-Type": "application/json",
              },
            }
          )
        );
      });
      fetchedJobDetails.skills.requiredSkills.forEach((skill) => {
        skillPromises.push(
          axios.delete(
            `${host}/company/${companyId}/job/${edit}/skills/${skill.id}`,
            {
              headers: {
                Authorization: idToken,
                "Content-Type": "application/json",
              },
            }
          )
        );
      });

      // Preferred skills
      submissionData.preferredSkills.forEach((skill) => {
        skillPromises.push(
          axios.post(
            `${host}/company/${companyId}/job/${edit}/skills`,
            {
              skill,
              type: "preferred",
            },
            {
              headers: {
                Authorization: idToken,
                "Content-Type": "application/json",
              },
            }
          )
        );
      });

      // Required skills
      submissionData.requiredSkills.forEach((skill) => {
        skillPromises.push(
          axios.post(
            `${host}/company/${companyId}/job/${edit}/skills`,
            {
              skill,
              type: "required",
            },
            {
              headers: {
                Authorization: idToken,
                "Content-Type": "application/json",
              },
            }
          )
        );
      });

      // Wait for all skills to be added
      let skillResponses = await Promise.all(skillPromises);
      skillResponses = skillResponses.map((res) => res.data);

      const preferredSkills: Array<{ id: string; skill: string }> =
        skillResponses
          .filter((e) => e.type === "preferred")
          .map((e) => ({
            id: e.id,
            skill: e.skill,
          }));
      const requiredSkills: Array<{ id: string; skill: string }> =
        skillResponses
          .filter((e) => e.type === "required")
          .map((e) => ({
            id: e.id,
            skill: e.skill,
          }));

      let temp = {
        ...fetchedJobDetails,
        skills: {
          preferredSkills: [...preferredSkills],
          requiredSkills: [...requiredSkills],
        },
      };

      // Handle assignment only if enabled
      if (submissionData.hasAssignment && submissionData.assignment) {
        const fileType =
          submissionData!.assignment!.submissionPreferences!.includes(
            "documentation"
          )
            ? "file"
            : "project";

        //create assignment
        const formData = new FormData();
        formData.append("description", submissionData.assignment.description);
        formData.append("submissionType", fileType);
        formData.append(
          "deadline",
          moment(submissionData.assignment.deadline, "YYYY-MM-DD")
            .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
            .toISOString()
        );
        formData.append(
          "requireGitHubRepo",
          `${submissionData.assignment.submissionPreferences.includes(
            "github"
          )}`
        );
        formData.append(
          "requireLiveLink",
          `${submissionData.assignment.submissionPreferences.includes(
            "liveLink"
          )}`
        );
        formData.append(
          "requireDocumentation",
          `${submissionData.assignment.submissionPreferences.includes(
            "documentation"
          )}`
        );

        // Validate and append file if present
        if (submissionData.assignment.file) {
          formData.append("file", submissionData.assignment.file);
        }

        // Update assignment with FormData
        const assign = await axios.put(
          `${host}/company/${response.data.id}/job/${edit}/assignment/${fetchedJobDetails.assignment.id}`,
          formData,
          {
            headers: {
              Authorization: idToken,
              // Content-Type is automatically set to multipart/form-data by axios when using FormData
            },
          }
        );
        console.log("Assignment", assign.data);

        // Fetch download URL if file was updated
        if (submissionData.assignment.file) {
          const fileFetch = await axios.get(
            `${host}/company/${response.data.id}/job/${edit}/assignment/${fetchedJobDetails.assignment.id}`,
            {
              headers: {
                Authorization: idToken,
              },
            }
          );
          console.log("Assign get", fileFetch.data);
          setlink(fileFetch.data.file_download_url);
          temp = {
            ...temp,
            file: {
              file: fileFetch.data.file_download_url,
              id: fetchedJobDetails.file.id,
            },
          };
        }
      }

      setFetchedJobDetails(temp);
      navigate("/manage-jobs");
      toast.success("Job updated successfully!");
    } catch (e) {
      toast.error("Something went wrong");
      console.log("Error", e);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: JobFormData) => {
    // Validate assignment fields only if assignment is enabled
    if (data.hasAssignment) {
      // Get the file from ref
      const file = fileInputRef.current?.files?.[0];
      // Validate file (required and PDF)
      let fileValidationError: string | undefined;
      if (!file) {
        fileValidationError = "Assignment file is required";
        setFileError(fileValidationError);
        setLoading(false);
        return;
      }
      if (file.type !== "application/pdf") {
        fileValidationError = "Only PDF files are allowed";
        setFileError(fileValidationError);
        setLoading(false);
        return;
      }
      setFileError(undefined);
    }

    const file = fileInputRef.current?.files?.[0];

    // Prepare data with correct file
    const submissionData = {
      ...data,
      assignment: data.hasAssignment
        ? {
            ...data.assignment,
            file,
          }
        : undefined,
    };

    // Console logs for debugging
    console.log("Raw File Object:", file);
    console.log("Form Submission Data (Object):", submissionData);

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
      console.log("adding");

      //for companyId
      const response = await axios.get(`${host}/company`, {
        headers: {
          Authorization: idToken,
        },
      });
      const companyId = response.data.id;
      console.log(response.data.id);
      //create job
      const job = await axios.post(
        `${host}/company/${response.data.id}/job`,
        {
          title: submissionData.title,
          description: submissionData.description,
          type: submissionData.type,
          city:
            submissionData.location == "Remote"
              ? ""
              : submissionData.city || "",
          min_salary: +submissionData!.salary!.min,
          max_salary: +submissionData!.salary!.max,
          // CHANGE: Added stipend field for internships to API payload
          stipend:
            submissionData.type === "internship"
              ? `${submissionData!.salary!.min}-${submissionData!.salary!.max}`
              : undefined,
          status: "active",
          duration:
            submissionData.type == "internship"
              ? +submissionData.duration! || 0
              : 0,
          deadline: moment(submissionData.applicationDeadline, "YYYY-MM-DD")
            .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
            .toISOString(),
          work_mode: submissionData.location,
        },
        {
          headers: {
            Authorization: idToken, // Use ID token for authorization
          },
        }
      );
      const jobId = job.data.id;
      console.log("Job", job.data);

      //create skills
      const skillPromises: Promise<any>[] = [];
      // Preferred skills
      submissionData.preferredSkills.forEach((skill) => {
        skillPromises.push(
          axios.post(
            `${host}/company/${companyId}/job/${jobId}/skills`,
            {
              skill,
              type: "preferred",
            },
            {
              headers: {
                Authorization: idToken,
                "Content-Type": "application/json",
              },
            }
          )
        );
      });

      // Required skills
      submissionData.requiredSkills.forEach((skill) => {
        skillPromises.push(
          axios.post(
            `${host}/company/${companyId}/job/${jobId}/skills`,
            {
              skill,
              type: "required",
            },
            {
              headers: {
                Authorization: idToken,
                "Content-Type": "application/json",
              },
            }
          )
        );
      });

      // Wait for all skills to be added
      const skillResponses = await Promise.all(skillPromises);
      console.log(
        "Skills Added:",
        skillResponses.map((res) => res.data)
      );

      // Handle assignment only if enabled
      if (submissionData.hasAssignment && submissionData.assignment) {
        const fileType =
          submissionData.assignment.submissionPreferences.includes(
            "documentation"
          )
            ? "file"
            : "project";

        //create assignment
        const formData = new FormData();
        formData.append("description", submissionData.assignment.description);
        formData.append("submissionType", fileType);
        formData.append(
          "deadline",
          moment(submissionData.assignment.deadline, "YYYY-MM-DD")
            .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
            .toISOString()
        );
        formData.append(
          "githubRepo",
          `${submissionData.assignment.submissionPreferences.includes(
            "github"
          )}`
        );
        formData.append(
          "liveLink",
          `${submissionData.assignment.submissionPreferences.includes(
            "liveLink"
          )}`
        );
        formData.append(
          "documentation",
          `${submissionData.assignment.submissionPreferences.includes(
            "documentation"
          )}`
        );

        // Append file if it exists
        if (submissionData.assignment.file) {
          formData.append("file", submissionData.assignment.file);
        }

        const assign = await axios.post(
          `${host}/company/${response.data.id}/job/${job.data.id}/assignment`,
          formData,
          {
            headers: {
              Authorization: idToken,
              // Note: Content-Type is automatically set to multipart/form-data by axios when using FormData
            },
          }
        );
        console.log("Assignment", assign.data);
      }

      // Reset form fields after successful submission
      reset({
        title: "",
        type: "full-time",
        status: "active",
        location: "Remote",
        city: "",
        stipend: {
          min: "",
          max: "",
        },
        salary: { min: "", max: "" },
        description: "",
        requiredSkills: [],
        preferredSkills: [],
        hasAssignment: false,
        assignment: {
          description: "",
          deadline: "",
          file: new File([], ""), // Reset file input
          submissionPreferences: [],
        },
        applicationDeadline: "",
        duration: "1",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input manually
      }
      setPreferredSkills([]);
      setRequiredSkills([]);
      setFileError(undefined); // Clear any file error
      navigate("/manage-jobs");
      toast.success("Job added successfully!");
    } catch (e) {
      toast.error("Something went wrong");
      console.log("Error", e);
    } finally {
      setLoading(false);
    }
  };

  // New handler for Save as Draft
  const handleSaveDraft = async () => {
    setLoading(true);
    // Trigger form validation for all fields
    const isFormValid = await trigger();

    // Validate assignment fields only if assignment is enabled
    let fileValidationError: string | undefined;
    if (watch("hasAssignment")) {
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        fileValidationError = "Assignment file is required";
        setFileError(fileValidationError);
        setLoading(false);
        return;
      }
      if (file.type !== "application/pdf") {
        fileValidationError = "Only PDF files are allowed";
        setFileError(fileValidationError);
        setLoading(false);
        return;
      }
      setFileError(undefined);
    }

    if (isFormValid && !fileValidationError) {
      // If validations pass, prepare the submission data
      const formData = watch(); // Get current form values
      const file = fileInputRef.current?.files?.[0];
      const submissionData = {
        ...formData,
        assignment: formData.hasAssignment
          ? {
              ...formData.assignment,
              file,
            }
          : undefined,
      };

      // Call saveDraft with the validated data
      saveDraft(submissionData);
    }
    setLoading(false);
  };

  const saveDraft = async (submissionData: JobFormData) => {
    // Your saveDraft logic here
    console.log("Saving draft with data:", submissionData);
    try {
      setDraftLoading(true);
      try {
        const idToken = localStorage.getItem(token);
        if (!idToken) {
          toast.error("Seems like you are not logged in");
          setTimeout(() => {
            navigate("/sign-in");
          }, 2000);
          return;
        }
        console.log("adding");
        //for companyId
        const response = await axios.get(`${host}/company`, {
          headers: {
            Authorization: idToken,
          },
        });
        const companyId = response.data.id;
        console.log(response.data.id);
        //create job
        const job = await axios.post(
          `${host}/company/${response.data.id}/job`,
          {
            title: submissionData.title,
            description: submissionData.description,
            type: submissionData.type,
            city:
              submissionData.location == "Remote"
                ? ""
                : submissionData.city || "",
            min_salary: +submissionData!.salary!.min,
            max_salary: +submissionData!.salary!.max,
            // CHANGE: Added stipend field for internships to API payload
            stipend:
              submissionData.type === "internship"
                ? `${submissionData!.salary!.min}-${
                    submissionData!.salary!.max
                  }`
                : undefined,
            status: "draft",
            duration:
              submissionData.type == "internship"
                ? +submissionData.duration! || 0
                : 0,
            deadline: moment(submissionData.applicationDeadline, "YYYY-MM-DD")
              .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
              .toISOString(),
            work_mode: submissionData.location,
          },
          {
            headers: {
              Authorization: idToken, // Use ID token for authorization
            },
          }
        );
        const jobId = job.data.id;
        console.log("Job", job.data);

        //create skills
        const skillPromises: Promise<any>[] = [];
        // Preferred skills
        submissionData.preferredSkills.forEach((skill) => {
          skillPromises.push(
            axios.post(
              `${host}/company/${companyId}/job/${jobId}/skills`,
              {
                skill,
                type: "preferred",
              },
              {
                headers: {
                  Authorization: idToken,
                  "Content-Type": "application/json",
                },
              }
            )
          );
        });

        // Required skills
        submissionData.requiredSkills.forEach((skill) => {
          skillPromises.push(
            axios.post(
              `${host}/company/${companyId}/job/${jobId}/skills`,
              {
                skill,
                type: "required",
              },
              {
                headers: {
                  Authorization: idToken,
                  "Content-Type": "application/json",
                },
              }
            )
          );
        });

        // Wait for all skills to be added
        const skillResponses = await Promise.all(skillPromises);
        console.log(
          "Skills Added:",
          skillResponses.map((res) => res.data)
        );

        // Handle assignment only if enabled
        if (submissionData.hasAssignment && submissionData.assignment) {
          const fileType =
            submissionData.assignment.submissionPreferences.includes(
              "documentation"
            )
              ? "file"
              : "project";

          //create assignment
          const formData = new FormData();
          formData.append("description", submissionData.assignment.description);
          formData.append("submissionType", fileType);
          formData.append(
            "deadline",
            moment(submissionData.assignment.deadline, "YYYY-MM-DD")
              .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
              .toISOString()
          );
          formData.append(
            "githubRepo",
            `${submissionData.assignment.submissionPreferences.includes(
              "github"
            )}`
          );
          formData.append(
            "liveLink",
            `${submissionData.assignment.submissionPreferences.includes(
              "liveLink"
            )}`
          );
          formData.append(
            "documentation",
            `${submissionData.assignment.submissionPreferences.includes(
              "documentation"
            )}`
          );

          // Append file if it exists
          if (submissionData.assignment.file) {
            formData.append("file", submissionData.assignment.file);
          }

          const assign = await axios.post(
            `${host}/company/${response.data.id}/job/${job.data.id}/assignment`,
            formData,
            {
              headers: {
                Authorization: idToken,
                // Note: Content-Type is automatically set to multipart/form-data by axios when using FormData
              },
            }
          );
          console.log("Assignment", assign.data);
        }

        // Reset form fields after successful submission
        reset({
          title: "",
          type: "full-time",
          status: "active",
          location: "Remote",
          city: "",
          stipend: {
            min: "",
            max: "",
          },
          salary: { min: "", max: "" },
          description: "",
          requiredSkills: [],
          preferredSkills: [],
          hasAssignment: false,
          assignment: {
            description: "",
            deadline: "",
            file: new File([], ""), // Reset file input
            submissionPreferences: [],
          },
          applicationDeadline: "",
          duration: "1",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Clear file input manually
        }
        setPreferredSkills([]);
        setRequiredSkills([]);
        setFileError(undefined); // Clear any file error
        navigate("/manage-jobs");
        toast.success("Job drafted successfully!");
      } catch (e) {
        toast.error("Something went wrong");
        console.log("Error", e);
      } finally {
        setDraftLoading(false);
      }
    } catch (e) {
      console.log("error", e);
    } finally {
      console.log("drafting done");
      setDraftLoading(false);
    }
  };

  const type = watch("type");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
      </div>
      <Card className="px-4 sm:px-6">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        {renderLoading ? (
          <Spinner />
        ) : (
          <CardContent>
            <form
              onSubmit={handleSubmit(isEditing ? onUpdate : onSubmit)}
              className="space-y-6"
            >
              <div className="w-full md:w-1/2 relative">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Title
                </label>
                <div className="relative">
                  <Input
                    id="title"
                    placeholder="e.g. Senior Frontend Developer"
                    {...register("title", {
                      required: "Job title is required",
                    })}
                    onChange={handleTitleChange}
                    onFocus={() => setShowTitleSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowTitleSuggestions(false), 200)
                    }
                    error={errors.title?.message}
                    className="w-full appearance-none"
                    autoComplete="off"
                  />
                </div>
                {showTitleSuggestions && titleSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {titleSuggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                        onMouseDown={() => handleTitleSelect(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="w-1/2">
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Job Status
                  </label>
                  <Select
                    id="status"
                    value={status}
                    options={jobStatuses}
                    {...register("status", {
                      required: "Job status is required",
                    })}
                    error={errors.status?.message}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="w-full md:w-1/3">
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Job Type
                    </label>
                    <Select
                      id="type"
                      value={type}
                      options={jobTypes}
                      {...register("type", {
                        required: "Job type is required",
                      })}
                      error={errors.type?.message}
                      className="w-full"
                    />
                  </div>
                  <div className="w-full md:w-2/3 flex flex-row space-x-4">
                    <div className="w-1/2">
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Location
                      </label>
                      <Select
                        id="location"
                        value={location}
                        options={locations}
                        {...register("location", {
                          required: "Location is required",
                        })}
                        error={errors.location?.message}
                        className="w-full"
                      />
                    </div>
                    {needsCity && (
                      <div className="w-1/2 relative">
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          City
                        </label>
                        <div className="relative">
                          <Input
                            id="city"
                            placeholder="e.g. Bangalore"
                            {...register("city", {
                              required:
                                needsCity &&
                                "City is required for on-site/hybrid jobs",
                            })}
                            onChange={handleCityChange}
                            onFocus={() => setShowCitySuggestions(true)}
                            onBlur={() =>
                              setTimeout(
                                () => setShowCitySuggestions(false),
                                200
                              )
                            }
                            error={errors.city?.message}
                            className="w-full appearance-none"
                            autoComplete="off"
                          />
                        </div>
                        {showCitySuggestions && citySuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {citySuggestions.map((suggestion) => (
                              <div
                                key={suggestion}
                                className="px-4 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                                onMouseDown={() => handleCitySelect(suggestion)}
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3  gap-6">
                  <div>
                    <label
                      htmlFor="salaryMin"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {jobType === "internship"
                        ? "Minimum Stipend (INR/month)"
                        : "Minimum Salary (INR/year)"}
                    </label>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder={
                        jobType === "internship" ? "e.g. 10000" : "e.g. 500000"
                      }
                      {...register("salary.min", {
                        required: `${
                          jobType === "internship"
                            ? "Minimum stipend"
                            : "Minimum salary"
                        } is required`,
                        min: {
                          value: jobType === "internship" ? 5000 : 0,
                          message:
                            jobType === "internship"
                              ? "Minimum stipend is 5000"
                              : "Minimum salary cannot be negative",
                        },
                        validate: validateMinSalary,
                        valueAsNumber: true,
                      })}
                      error={errors.salary?.min?.message}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="salaryMax"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {jobType === "internship"
                        ? "Maximum Stipend (INR/month)"
                        : "Maximum Salary (INR/year)"}
                    </label>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder={
                        jobType === "internship" ? "e.g. 20000" : "e.g. 800000"
                      }
                      {...register("salary.max", {
                        required: `${
                          jobType === "internship"
                            ? "Maximum stipend"
                            : "Maximum salary"
                        } is required`,
                        min: {
                          value: jobType === "internship" ? 5000 : 0,
                          message:
                            jobType === "internship"
                              ? "Minimum stipend is 5000"
                              : "Maximum salary cannot be negative",
                        },
                        validate: validateMaxSalary,
                        valueAsNumber: true,
                      })}
                      error={errors.salary?.max?.message}
                    />
                  </div>
                  {jobType === "internship" && (
                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Duration
                      </label>
                      <Select
                        id="duration"
                        value={duration}
                        options={durations}
                        {...register("duration", {
                          required:
                            jobType === "internship" && "Duration is required",
                        })}
                        error={errors.duration?.message}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Description (max 1000 characters)
                </label>
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={handleDescriptionChange}
                  modules={modules}
                  placeholder="Describe the role and responsibilities..."
                  className="h-48 mb-12"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
                <p className="text-sm  text-gray-500 mt-1">
                  {description?.replace(/<[^>]*>/g, "").length || 0}/5000
                  characters
                </p>
                <input
                  type="hidden"
                  {...register("description", {
                    required: "Job description is required",
                    validate: {
                      minLength: (value) =>
                        value.replace(/<[^>]*>/g, "").length >= 50 ||
                        "Description must be at least 50 characters",
                      maxLength: (value) =>
                        value.replace(/<[^>]*>/g, "").length <= 5000 ||
                        "Description must not exceed 5000 characters",
                    },
                  })}
                />
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills (max 5, at least 1)
                </label>
                <div className="relative flex flex-col sm:flex-row gap-2 w-full">
                  <div className="relative w-full">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Type a skill and press Enter"
                      value={requiredInput}
                      onChange={(e) => setRequiredInput(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "required")}
                      onFocus={() => {
                        if (requiredInput) setShowRequiredSuggestions(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowRequiredSuggestions(false);
                          setSelectedRequiredIndex(-1); // Reset selection on blur
                        }, 200);
                      }}
                    />
                    {showRequiredSuggestions &&
                      requiredSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                          {requiredSuggestions.map((suggestion, index) => (
                            <li
                              key={suggestion}
                              className={`px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm ${
                                index === selectedRequiredIndex
                                  ? "bg-blue-200"
                                  : ""
                              }`}
                              onMouseDown={() =>
                                selectSuggestion("required", suggestion)
                              }
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                  <button
                    type="button"
                    className="block sm:hidden w-full bg-blue-600 text-white px-3 py-2 rounded text-sm"
                    onClick={(e) => {
                      handleSkillAdd("required", requiredInput, {
                        preventDefault: () => {},
                        currentTarget: {
                          value: requiredInput,
                        } as HTMLInputElement,
                      });
                    }}
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill("required", skill)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="hidden"
                  {...register("requiredSkills", {
                    validate: {
                      minLength: (value) =>
                        value.length >= 1 ||
                        "At least one required skill is needed",
                      maxLength: (value) =>
                        value.length <= 5 ||
                        "Maximum 5 required skills allowed",
                    },
                  })}
                />
                {errors.requiredSkills && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.requiredSkills.message}
                  </p>
                )}
              </div>

              {/* Preferred Skills */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Skills (max 5, at least 1)
                </label>
                <div className="relative flex flex-col sm:flex-row gap-2 w-full">
                  <div className="relative w-full">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Type a skill and press Enter"
                      value={preferredInput}
                      onChange={(e) => setPreferredInput(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "preferred")}
                      onFocus={() => {
                        if (preferredInput) setShowPreferredSuggestions(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowPreferredSuggestions(false);
                          setSelectedPreferredIndex(-1); // Reset selection on blur
                        }, 200);
                      }}
                    />
                    {showPreferredSuggestions &&
                      preferredSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                          {preferredSuggestions.map((suggestion, index) => (
                            <li
                              key={suggestion}
                              className={`px-3 py-2 hover:bg-green-100 cursor-pointer text-sm ${
                                index === selectedPreferredIndex
                                  ? "bg-green-200"
                                  : ""
                              }`}
                              onMouseDown={() =>
                                selectSuggestion("preferred", suggestion)
                              }
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                  <button
                    type="button"
                    className="block sm:hidden w-full bg-blue-600 text-white px-3 py-2 rounded text-sm"
                    onClick={(e) => {
                      handleSkillAdd("preferred", preferredInput, {
                        preventDefault: () => {},
                        currentTarget: {
                          value: preferredInput,
                        } as HTMLInputElement,
                      });
                    }}
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm text-green-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill("preferred", skill)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="hidden"
                  {...register("preferredSkills", {
                    validate: {
                      minLength: (value) =>
                        value.length >= 1 ||
                        "At least one preferred skill is needed",
                      maxLength: (value) =>
                        value.length <= 5 ||
                        "Maximum 5 preferred skills allowed",
                    },
                  })}
                />
                {errors.preferredSkills && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.preferredSkills.message}
                  </p>
                )}
              </div>

              {/* Assignment Toggle */}
              <div className="border-t pt-6 sm:pt-3 ">
                <ToggleSwitch
                  checked={hasAssignment || false}
                  onChange={handleAssignmentToggle}
                  label="Include Assignment"
                  disabled={isEditing}
                />
              </div>

              {/* Assignment Section - Conditionally Rendered */}
              {hasAssignment && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <h3 className="text-lg font-medium text-blue-900">
                    Assignment Details
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="assignmentDescription"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Assignment Description
                      </label>
                      <Textarea
                        id="assignmentDescription"
                        rows={4}
                        placeholder="Describe the assignment task..."
                        {...register("assignment.description", {
                          required:
                            hasAssignment &&
                            "Assignment description is required",
                        })}
                        error={errors.assignment?.description?.message}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="assignmentFile"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Attach Assignment File (PDF)
                      </label>
                      <Input
                        id="assignmentFile"
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        error={fileError}
                      />
                    </div>
                    {link && (
                      <a
                        className="text-sm ml-3 underline text-blue-800"
                        href={link}
                      >
                        Current assignment
                      </a>
                    )}
                    <div>
                      <label
                        htmlFor="assignmentDeadline"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Assignment Deadline
                      </label>
                      <Input
                        id="assignmentDeadline"
                        type="date"
                        {...register("assignment.deadline", {
                          required:
                            hasAssignment && "Assignment deadline is required",
                          validate: validateDeadline, // Add custom validation
                        })}
                        error={errors.assignment?.deadline?.message}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Submission Preference (select at least one)
                      </label>
                      <div className="space-y-2">
                        {submissionPreferencesOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              value={option.value}
                              {...register("assignment.submissionPreferences", {
                                validate: (value) =>
                                  !hasAssignment ||
                                  value.length > 0 ||
                                  "At least one submission preference is required",
                              })}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors.assignment?.submissionPreferences && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.assignment.submissionPreferences.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="applicationDeadline"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Application Deadline
                </label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  {...register("applicationDeadline", {
                    required: "Application deadline is required",
                  })}
                  error={errors.applicationDeadline?.message}
                />
              </div>

              <div className="flex justify-end space-x-4">
                {/* {!isEditing && (
                  <Button
                    variant="outline"
                    type="button"
                    disabled={loading || isSubmitting || draftLoading}
                    onClick={handleSaveDraft}
                    className="hover:text-white bg-transparent"
                  >
                    {draftLoading ? <BlackSpinner /> : "Save as Draft"}
                  </Button>
                )} */}
                {isEditing ? (
                  <Button
                    type="submit"
                    disabled={loading || isSubmitting || draftLoading}
                  >
                    {loading || isSubmitting ? <Spinner /> : "Update job"}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading || isSubmitting || draftLoading}
                  >
                    {loading || isSubmitting ? <Spinner /> : "Publish Job"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
