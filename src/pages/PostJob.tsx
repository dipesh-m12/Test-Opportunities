/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/Spinner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Textarea } from "@/components/ui/Textarea";

interface JobFormData {
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
}

const jobTypes = [
  { value: "full-time", label: "Full-time" },
  { value: "internship", label: "Internship" },
];

const jobStatuses = [
  { value: "active", label: "Active" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "ended", label: "Ended" },
];

const locations = [
  { value: "remote", label: "Remote" },
  { value: "on-site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

const durations = [
  { value: "1", label: "1 Month" },
  { value: "3", label: "3 Months" },
  { value: "6", label: "6 Months" },
  { value: "custom", label: "Custom" },
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

export const PostJob = () => {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<JobFormData>({
    defaultValues: {
      requiredSkills: [],
      preferredSkills: [],
      description: "",
      assignment: {
        submissionPreferences: [],
      },
    },
  });
  const jobType = watch("type");
  const location = watch("location");
  const description = watch("description");
  const needsCity = location === "on-site" || location === "hybrid";
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const location_state = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [renderLoading, setRenderLoading] = useState(false);
  const data = location_state.state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (data && data.isEditing) {
      setIsEditing(data.isEditing);
      Object.entries(data).forEach(([key, value]: any) => {
        if (key === "requiredSkills") {
          setRequiredSkills(value);
          setValue("requiredSkills", value);
        } else if (key === "preferredSkills") {
          setPreferredSkills(value);
          setValue("preferredSkills", value);
        } else {
          setValue(key, value);
        }
      });
    }
  }, [data, setValue]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

  const onSubmit = async (data: JobFormData) => {
    setLoading(true);

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
    console.log(
      "Form Submission Data (JSON):",
      JSON.stringify(
        submissionData,
        (key, value) => {
          if (value instanceof File) {
            return {
              name: value.name,
              type: value.type,
              size: value.size,
              lastModified: value.lastModified,
            };
          }
          return value;
        },
        2
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
  };

  const handleSkillAdd = (
    type: "required" | "preferred",
    skill: string,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (skill.trim()) {
        const skillsArray =
          type === "required" ? requiredSkills : preferredSkills;
        if (skillsArray.length < 5 && !skillsArray.includes(skill.trim())) {
          const newSkills = [...skillsArray, skill.trim()];
          if (type === "required") {
            setRequiredSkills(newSkills);
            setValue("requiredSkills", newSkills, { shouldValidate: true });
          } else {
            setPreferredSkills(newSkills);
            setValue("preferredSkills", newSkills, { shouldValidate: true });
          }
        }
        e.currentTarget.value = "";
      }
    }
  };

  const removeSkill = (type: "required" | "preferred", skill: string) => {
    const newSkills =
      type === "required"
        ? requiredSkills.filter((s) => s !== skill)
        : preferredSkills.filter((s) => s !== skill);
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
    if (plainText.length <= 1000) {
      setValue("description", value, { shouldValidate: true });
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        {renderLoading ? (
          <Spinner />
        ) : (
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <p className="text-sm text-gray-500 mt-1">
                  {description?.replace(/<[^>]*>/g, "").length || 0}/1000
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
                        value.replace(/<[^>]*>/g, "").length <= 1000 ||
                        "Description must not exceed 1000 characters",
                    },
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills (max 5, at least 1)
                </label>
                <Input
                  placeholder="Type a skill and press Enter"
                  onKeyDown={(e) =>
                    handleSkillAdd("required", e.currentTarget.value, e)
                  }
                  error={errors.requiredSkills?.message}
                />
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Skills (max 5, at least 1)
                </label>
                <Input
                  placeholder="Type a skill and press Enter"
                  onKeyDown={(e) =>
                    handleSkillAdd("preferred", e.currentTarget.value, e)
                  }
                  error={errors.preferredSkills?.message}
                />
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
                  })}
                  error={errors.applicationDeadline?.message}
                />
              </div>

              <div className="flex justify-end space-x-4">
                {!isEditing && (
                  <Button
                    variant="outline"
                    type="button"
                    className="hover:text-white"
                  >
                    Save as Draft
                  </Button>
                )}
                <Button type="submit" disabled={loading || isSubmitting}>
                  {loading || isSubmitting ? <Spinner /> : "Publish Job"}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
