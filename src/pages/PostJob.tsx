import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/Spinner";

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
    file?: File[];
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
    },
  });
  const navigate = useNavigate();
  const jobType = watch("type");
  const location = watch("location");
  const needsCity = location === "on-site" || location === "hybrid";
  const [requiredSkills, setRequiredSkills] = React.useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = React.useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: JobFormData) => {
    setLoading(true);
    // Add submission logic here
    setTimeout(() => setLoading(false), 2000); // Simulate async operation
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Job Title
              </label>
              <Input
                id="title"
                placeholder="e.g. Senior Frontend Developer"
                {...register("title", { required: "Job title is required" })}
                error={errors.title?.message}
                list="tech-jobs"
                className="w-full"
              />
              <datalist id="tech-jobs">
                {techJobSuggestions.map((job) => (
                  <option key={job} value={job} />
                ))}
              </datalist>
            </div>

            <div className="w-1/2">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Job Status
              </label>
              <Select
                id="status"
                options={jobStatuses}
                {...register("status", { required: "Job status is required" })}
                error={errors.status?.message}
                className="w-full"
              />
            </div>

            <div className="space-y-6">
              <div className="w-1/2">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Type
                </label>
                <Select
                  id="type"
                  options={jobTypes}
                  {...register("type", { required: "Job type is required" })}
                  error={errors.type?.message}
                  className="w-full"
                />
              </div>

              <div className="flex items-end gap-4">
                <div className="w-1/2">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700"
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
                  <div className="w-1/2">
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <Input
                      id="city"
                      placeholder="e.g. Bangalore"
                      {...register("city", {
                        required: "City is required for on-site/hybrid jobs",
                      })}
                      error={errors.city?.message}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {jobType === "internship" ? (
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label
                    htmlFor="stipend"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Monthly Stipend{" "}
                    <span className="hidden sm:inline-block">(INR)</span>
                  </label>
                  <Input
                    id="stipend"
                    type="number"
                    placeholder="e.g.Rs 15000"
                    {...register("stipend", {
                      required: "Stipend is required",
                      min: { value: 5000, message: "Minimum stipend is 5000" },
                    })}
                    error={errors.stipend?.message}
                  />
                </div>
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Duration
                  </label>
                  <Select
                    id="duration"
                    options={durations}
                    {...register("duration", {
                      required: "Duration is required",
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
                    className="block text-sm font-medium text-gray-700"
                  >
                    Minimum Salary (INR/year)
                  </label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="e.g. 500000"
                    {...register("salary.min", {
                      required: "Minimum salary is required",
                    })}
                    error={errors.salary?.min?.message}
                  />
                </div>
                <div>
                  <label
                    htmlFor="salaryMax"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Maximum Salary (INR/year)
                  </label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="e.g. 800000"
                    {...register("salary.max", {
                      required: "Maximum salary is required",
                    })}
                    error={errors.salary?.max?.message}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Job Description
              </label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Describe the role and responsibilities..."
                {...register("description", {
                  required: "Job description is required",
                })}
                error={errors.description?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Required Skills (max 5, at least 1)
              </label>
              <Input
                placeholder="Type a skill and press Enter"
                {...register("requiredSkills", {
                  validate: (value) =>
                    value.length > 0 || "At least one required skill is needed",
                })}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Skills (max 5, at least 1)
              </label>
              <Input
                placeholder="Type a skill and press Enter"
                {...register("preferredSkills", {
                  validate: (value) =>
                    value.length > 0 ||
                    "At least one preferred skill is needed",
                })}
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
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <h3 className="text-lg font-medium text-blue-900">
                Assignment Details
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="assignmentDescription"
                    className="block text-sm font-medium text-gray-700"
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
                    className="block text-sm font-medium text-gray-700"
                  >
                    Attach Assignment File (PDF)
                  </label>
                  <Input
                    id="assignmentFile"
                    type="file"
                    accept=".pdf"
                    {...register("assignment.file", {
                      validate: (file: File[] | undefined) =>
                        !file ||
                        file[0]?.type === "application/pdf" ||
                        "Only PDF files are allowed",
                    })}
                    error={errors.assignment?.file?.message}
                  />
                </div>
                <div>
                  <label
                    htmlFor="assignmentDeadline"
                    className="block text-sm font-medium text-gray-700"
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
              </div>
            </div>

            <div>
              <label
                htmlFor="applicationDeadline"
                className="block text-sm font-medium text-gray-700"
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
              <Button
                variant="outline"
                type="button"
                className="hover:text-white"
              >
                Save as Draft
              </Button>
              <Button type="submit" disabled={loading || isSubmitting}>
                {loading || isSubmitting ? <Spinner /> : "Publish Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
