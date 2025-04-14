/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { host } from "@/utils/routes";
import axios from "axios";
import toast from "react-hot-toast";
import { token } from "@/utils";
import { useNavigate } from "react-router-dom";

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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    defaultValues: {
      assignmentNotifications: false,
    },
  });
  const [fetchedData, setFetchedData] = useState<{
    [key: string]: string | boolean;
  }>();
  const navigate = useNavigate();

  useEffect(() => {
    const createCompany = async () => {
      setLoading(true);
      try {
        // Get the current user and their ID token
        const idToken = localStorage.getItem(token);
        if (!idToken) {
          toast.error("Seems like you are not logged in");
          setTimeout(() => {
            navigate("/sign-in");
          }, 2000);

          return;
        }

        // Make API call to create company
        const response = await axios.get(`${host}/company`, {
          headers: {
            Authorization: idToken,
          },
        });
        reset({
          companyName: response.data.name || "",
          website: response.data.website || "",
          linkedin: response.data.linkedin_url || "",
          email: "",
          contactName: "",
          assignmentNotifications: false,
        });
        setFetchedData({
          companyName: response.data.name || "",
          website: response.data.website || "",
          linkedin: response.data.linkedin_url || "",
          email: "",
          contactName: "",
          assignmentNotifications: false,
        });

        console.log("API Response:", response.data);
        toast.success("Company fetched successfully!");
      } catch (error: any) {
        console.error("Error creating company:", error);
        if (error.response) {
          switch (error.response.status) {
            case 400:
              toast.error("Invalid data provided.");
              break;
            case 401:
              toast.error("Authentication failed. Please log in.");
              break;
            case 409:
              toast.error("Company name already exists.");
              break;
            default:
              toast.error("Failed to get company.");
          }
        } else if (error.message === "User not authenticated") {
          toast.error("Please log in to create a company.");
        } else {
          toast.error("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    createCompany();
  }, []);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: SettingsFormData) => {
    if (loading) return;
    setLoading(true);

    try {
      // Get the current user and their ID token
      const idToken = localStorage.getItem(token);
      if (!idToken) {
        toast.error("Seems like you are not logged in");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);

        return;
      }
      if (fetchedData?.companyName) {
        console.log("updating");
        const response = await axios.put(
          `${host}/company`,
          {
            name: data.companyName,
            website: data.website,
            linkedin_url: data.linkedin,
          },
          {
            headers: {
              Authorization: idToken, // Use ID token for authorization
            },
          }
        );
        console.log("API Response:", response.data);
        toast.success("Company settings updated successfully!");
      } else {
        console.log("adding");
        // Make API call to create company
        const response = await axios.post(
          `${host}/company`,
          {
            name: data.companyName,
            website: data.website,
            linkedin_url: data.linkedin,
          },
          {
            headers: {
              Authorization: idToken, // Use ID token for authorization
            },
          }
        );

        console.log("API Response:", response.data);
        toast.success("Company settings added successfully!");
      }
    } catch (error: any) {
      console.error("Error updating settings:", error);
      if (error.response) {
        // API-specific errors
        switch (error.response.status) {
          case 400:
            toast.error("Invalid data provided. Please check your inputs.");
            break;
          case 401:
            toast.error("Authentication failed. Please log in again.");
            break;
          case 409:
            toast.error("Company name already exists.");
            break;
          default:
            toast.error("Failed to update settings. Please try again.");
        }
      } else if (error.message === "User not authenticated") {
        toast.error("Please log in to update settings.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
