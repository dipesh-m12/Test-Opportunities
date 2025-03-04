import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

interface SettingsFormData {
  companyName: string;
  website: string;
  linkedin?: string; // Optional
  contactName: string;
  email: string;
  assignmentNotifications: boolean;
}

export const Settings = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    defaultValues: {
      assignmentNotifications: false,
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: SettingsFormData) => {
    setLoading(true);
    try {
      // TODO: Implement settings update logic
      console.log("Settings data:", data);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name
                </label>
                <Input
                  id="companyName"
                  {...register("companyName", {
                    required: "Company name is required",
                  })}
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.companyName.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700"
                >
                  Website
                </label>
                <Input
                  id="website"
                  type="url"
                  {...register("website", {
                    required: "Website is required",
                    pattern: {
                      value:
                        /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i,
                      message: "Please enter a valid URL",
                    },
                  })}
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.website.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="linkedin"
                  className="block text-sm font-medium text-gray-700"
                >
                  LinkedIn (Optional)
                </label>
                <Input
                  id="linkedin"
                  type="url"
                  {...register("linkedin", {
                    pattern: {
                      value:
                        /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i,
                      message: "Please enter a valid URL",
                    },
                  })}
                />
                {errors.linkedin && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.linkedin.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label
                  htmlFor="contactName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact Person Name
                </label>
                <Input
                  id="contactName"
                  {...register("contactName", {
                    required: "Contact name is required",
                  })}
                />
                {errors.contactName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contactName.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <input
                  id="assignmentNotifications"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  {...register("assignmentNotifications")}
                />
                <label
                  htmlFor="assignmentNotifications"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Email for submissions
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading || isSubmitting}>
              {loading || isSubmitting ? <Spinner /> : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
