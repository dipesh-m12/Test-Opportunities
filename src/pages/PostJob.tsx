/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
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

interface JobFormData {
  id?: string;
  title: string;
  type: string;
  status: string;
  location: string;
  city?: string;
  stipend?: string;
  salary?: {
    min: string;
    max: string;
  };
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  assignment: {
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
  { value: "3", label: "3 Months" },
  { value: "6", label: "6 Months" },
  { value: "9999", label: "Custom" },
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
      assignment: {
        submissionPreferences: [],
        // deadline: moment("2024-06-05").format("YYYY-MM-DD"),
      },
    },
  });
  const jobType = watch("type");
  const location = watch("location");
  const description = watch("description");
  // Watch salary fields to enable dynamic validation
  const minSalary = watch("salary.min");
  const maxSalary = watch("salary.max");
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

          const assign = await axios.get(
            `${host}/company/${companyId}/job/${edit}/assignment/${job.data.assignments[0].id}`,
            {
              headers: {
                Authorization: idToken,
              },
            }
          );
          console.log("Assignment", assign.data);
          const refineData: FetchedJobDetails = {
            job: {
              id: job.data.id,
              title: data.title,
              description: data.description,
              type: data.type,
              city: data.work_mode == "Remote" ? "" : data.city || "",
              min_salary: data.type == "full-time" ? data!.min_salary! : "",
              //stipend
              max_salary: data.type == "full-time" ? data!.max_salary! : "",
              stipend: data.type !== "full-time" ? data.min_salary : "",
              //max_salary
              status: data.status,
              duration: `${data.duration}`,
              deadline: moment(data.deadline).format("YYYY-MM-DD"),
              work_mode: data.work_mode,
            },
            assignment: {
              id: job.data.assignments[0].id,
              description: data.assignments[0].description,
              SubmissionType: "file",
              deadline: moment(data.assignments[0].deadline).format(
                "YYYY-MM-DD"
              ),
              githubRepo: data.assignments[0].requireGitHubRepo,
              liveLink: data.assignments[0].requireLiveLink,
              documentation: data.assignments[0].requireDocumentation,
            },
            skills: {
              preferredSkills: data.job_skills
                .filter((e: any) => e.type == "preferred")
                .map((e: any) => ({ skill: e.skill, id: e.id })),
              requiredSkills: data.job_skills
                .filter((e: any) => e.type == "required")
                .map((e: any) => ({ skill: e.skill, id: e.id })),
            },
            file: {
              file: assign.data.file_download_url,
              id: job.data.assignments[0].id,
            },
            blob: job.data,
            assignBlob: assign.data,
          };
          setFetchedJobDetails(refineData);
          console.log(refineData);

          // Map boolean flags to submissionPreferences array
          const submissionPreferences = [];
          if (refineData.assignment.githubRepo)
            submissionPreferences.push("github");
          if (refineData.assignment.liveLink)
            submissionPreferences.push("liveLink");
          if (refineData.assignment.documentation)
            submissionPreferences.push("documentation");

          // console.log(submissionPreferences);

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
            assignment: {
              description: refineData.assignment.description,
              deadline: moment(refineData.assignment.deadline).format(
                "YYYY-MM-DD"
              ),
              // file: new File([], ""), // Reset file input
              submissionPreferences,
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
          setlink(assign.data.file_download_url);
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

    if (skillsArray.length >= 5) return; // max 5 skills
    if (skillsArray.includes(trimmedSkill)) return; // no duplicates

    const newSkills = [...skillsArray, trimmedSkill];

    if (type === "required") {
      setRequiredSkills(newSkills);
      setValue("requiredSkills", newSkills, { shouldValidate: true });
      setRequiredInput(""); // clear input state
    } else {
      setPreferredSkills(newSkills);
      setValue("preferredSkills", newSkills, { shouldValidate: true });
      setPreferredInput("");
    }

    // Clear actual input element's value
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
    if (selectedDate < today) {
      return "Assignment deadline cannot be in the past. Please select today or a future date.";
    }
    return true;
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  // Custom validation functions
  const validateMinSalary = (value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue < 0) {
      return "Minimum salary cannot be negative";
    }
    if (maxSalary && parseFloat(maxSalary) <= numValue) {
      return "Minimum salary must be less than maximum salary";
    }
    return true;
  };

  const validateMaxSalary = (value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue < 0) {
      return "Maximum salary cannot be negative";
    }
    if (minSalary && numValue <= parseFloat(minSalary)) {
      return "Maximum salary must be greater than minimum salary";
    }
    return true;
  };

  const onUpdate = async (data: JobFormData) => {
    if (!edit) {
      toast.error("Can not find the id to your job");
      return;
    }
    // console.log("here");
    // return;
    const file = fileInputRef.current?.files?.[0];

    // Prepare data with correct file
    const submissionData = {
      ...data,
      assignment: {
        ...data.assignment,
        file,
      },
    };

    // Console logs for debugging
    // console.log("Raw File Object:", file);
    // console.log("Form Submission Data (Object):", submissionData);
    // console.log(file);
    // return;

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
      // console.log(response.data.id);

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
          min_salary:
            submissionData.type == "full-time"
              ? +submissionData!.salary!.min
              : +submissionData!.stipend!,
          max_salary:
            submissionData.type == "full-time"
              ? +submissionData!.salary!.max
              : +submissionData!.stipend!,
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
      // console.log("Job", job.data);

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
      // console.log(fetchedJobDetails);

      let skillResponses = await Promise.all(skillPromises);
      // console.log(
      //   "Skills Added:",
      //   skillResponses.map((res) => res.data)
      // );
      skillResponses = skillResponses.map((res) => res.data);
      // console.log(skillResponses);

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
      // console.log(preferredSkills);
      // console.log(requiredSkills);
      let temp = {
        ...fetchedJobDetails,
        skills: {
          preferredSkills: [...preferredSkills],
          requiredSkills: [...requiredSkills],
        },
      };
      // console.log(temp);

      // setFetchedJobDetails(temp);

      const fileType = submissionData.assignment.submissionPreferences.includes(
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
        `${submissionData.assignment.submissionPreferences.includes("github")}`
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
        // Validate file (required and PDF)
        const file = submissionData.assignment.file;
        let fileValidationError;
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
        formData.append("file", file);
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

  // useEffect(() => {
  //   console.log(fetchedJobDetails.skills);
  // }, [fetchedJobDetails]);

  // useEffect(() => {
  //   console.log(fetchedJobDetails.file);
  // }, [fetchedJobDetails]);
  const onSubmit = async (data: JobFormData) => {
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

    // Prepare data with correct file
    const submissionData = {
      ...data,
      assignment: {
        ...data.assignment,
        file,
      },
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
      // return;

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
          min_salary:
            submissionData.type == "full-time"
              ? +submissionData!.salary!.min
              : +submissionData!.stipend!,
          max_salary:
            submissionData.type == "full-time"
              ? +submissionData!.salary!.max
              : +submissionData!.stipend!,
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
      // console.log();

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
      const fileType = submissionData.assignment.submissionPreferences.includes(
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
        `${submissionData.assignment.submissionPreferences.includes("github")}`
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

      // Reset form fields after successful submission
      reset({
        title: "",
        type: "full-time",
        status: "active",
        location: "Remote",
        city: "",
        stipend: "",
        salary: { min: "", max: "" },
        description: "",
        requiredSkills: [],
        preferredSkills: [],
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

    // Validate file (same as onSubmit)
    const file = fileInputRef.current?.files?.[0];
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

    if (isFormValid && !fileValidationError) {
      // If validations pass, prepare the submission data
      const formData = watch(); // Get current form values
      const submissionData = {
        ...formData,
        assignment: {
          ...formData.assignment,
          file,
        },
      };

      // Call saveDraft with the validated data
      saveDraft(submissionData);
    }

    setLoading(false);
  };

  const saveDraft = async (submissionData: JobFormData) => {
    // Your saveDraft logic here
    console.log("Saving draft with data:", data);

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
            min_salary:
              submissionData.type == "full-time"
                ? +submissionData!.salary!.min
                : +submissionData!.stipend!,
            max_salary:
              submissionData.type == "full-time"
                ? +submissionData!.salary!.max
                : +submissionData!.stipend!,
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
        // console.log();

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

        // Reset form fields after successful submission
        reset({
          title: "",
          type: "full-time",
          status: "active",
          location: "Remote",
          city: "",
          stipend: "",
          salary: { min: "", max: "" },
          description: "",
          requiredSkills: [],
          preferredSkills: [],
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
    // Example: Save to localStorage, send to an API endpoint, etc.
    // localStorage.setItem("jobDraft", JSON.stringify(data));
    // Or make an API call:
    // await fetch("/api/save-draft", { method: "POST", body: JSON.stringify(data) });
  };
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

              {jobType === "internship" ? (
                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label
                      htmlFor="stipend"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Monthly Stipend{" "}
                      <span className="hidden sm:inline-block">(INR)</span>
                    </label>
                    <Input
                      id="stipend"
                      type="number"
                      placeholder="e.g.Rs 15000"
                      {...register("stipend", {
                        required:
                          jobType === "internship" && "Stipend is required",
                        min: {
                          value: 5000,
                          message: "Minimum stipend is 5000",
                        },
                      })}
                      error={errors.stipend?.message}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Duration
                    </label>
                    <Select
                      id="duration"
                      options={durations}
                      {...register("duration", {
                        required:
                          jobType === "internship" && "Duration is required",
                      })}
                      error={errors.duration?.message}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="salaryMin"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Minimum Salary (INR/year)
                    </label>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="e.g. 500000"
                      {...register("salary.min", {
                        required:
                          jobType !== "internship" &&
                          "Minimum salary is required",
                        validate: validateMinSalary, // Add custom validation
                        valueAsNumber: true, // Ensures value is treated as a number
                      })}
                      error={errors.salary?.min?.message}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="salaryMax"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Maximum Salary (INR/year)
                    </label>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="e.g. 800000"
                      {...register("salary.max", {
                        required:
                          jobType !== "internship" &&
                          "Maximum salary is required",
                        validate: validateMaxSalary, // Add custom validation
                        valueAsNumber: true, // Ensures value is treated as a number
                      })}
                      error={errors.salary?.max?.message}
                    />
                  </div>
                </div>
              )}

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

                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Type a skill and press Enter"
                    value={requiredInput}
                    onChange={(e) => setRequiredInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSkillAdd("required", requiredInput, e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="block sm:hidden w-full bg-blue-600 text-white px-3 py-2 rounded text-sm"
                    onClick={(e) => {
                      // create a mock event with currentTarget.value for handleSkillAdd
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

                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Type a skill and press Enter"
                    value={preferredInput}
                    onChange={(e) => setPreferredInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSkillAdd("preferred", preferredInput, e);
                      }
                    }}
                  />
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
                        required: "Assignment description is required",
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
                      Curret assignment
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
                        required: "Assignment deadline is required",
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
                    validate: {
                      notInPast: validateDeadline,
                      afterAssignment: (value) => {
                        const assignmentDeadline = watch("assignment.deadline");
                        if (!assignmentDeadline) return true;
                        const appDate = new Date(value);
                        const assignDate = new Date(assignmentDeadline);
                        return appDate > assignDate
                          ? true
                          : "Application deadline must be greater than assignment deadline";
                      },
                    },
                  })}
                  error={errors.applicationDeadline?.message}
                />
              </div>

              <div className="flex justify-end space-x-4">
                {!isEditing && (
                  <Button
                    variant="outline"
                    type="button"
                    disabled={loading || isSubmitting || draftLoading}
                    onClick={handleSaveDraft}
                    className="hover:text-white"
                  >
                    {draftLoading ? <BlackSpinner /> : "Save as Draft"}
                  </Button>
                )}
                {isEditing ? (
                  <Button
                    type="submit"
                    // onClick={onUpdate}
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
