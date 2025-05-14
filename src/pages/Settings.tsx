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
import { addDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { phoneCollection } from "@/utils/firebaseConfig";

interface SettingsFormData {
  companyName: string;
  website: string;
  linkedin?: string;
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
  const [fetchedData, setFetchedData] = useState<SettingsFormData>();
  const [companyId, setCompanyId] = useState<string>("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [phoneQueryLoading, setPhoneQueryLoading] = useState(false);

  // Timer effect for 30 seconds after OTP is sent
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Fetch company data
  useEffect(() => {
    const createCompany = async () => {
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

        const response = await axios.get(`${host}/company`, {
          headers: {
            Authorization: idToken,
          },
        });

        const api2 = await axios.get(`${host}/users`, {
          headers: {
            Authorization: idToken,
          },
        });
        reset({
          companyName: response.data.name || "",
          website: response.data.website || "",
          linkedin: response.data.linkedin_url || "",
          email: api2.data.email || "",
          contactName: api2.data.first_name || "",
          assignmentNotifications:
            response.data.company_preferences[0].email_preferences,
        });

        setCompanyId(response.data.id);

        setFetchedData({
          companyName: response.data.name || "",
          website: response.data.website || "",
          linkedin: response.data.linkedin_url || "",
          email: "",
          contactName: "",
          assignmentNotifications: false,
        });

        toast.success("Company fetched successfully!");
      } catch (error: any) {
        console.error("Error fetching company:", error);
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
            case 404:
              // toast.error("Company name already exists.");
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
  }, [navigate, reset]);

  // Fetch phone number from Firestore
  useEffect(() => {
    async function getNumber() {
      if (!companyId) {
        return;
      }
      setPhoneQueryLoading(true);
      try {
        const q = query(phoneCollection, where("companyId", "==", companyId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          if (data.phoneNumber) {
            // Remove +91 prefix if present
            const number = data.phoneNumber.replace(/^\+91/, "");
            setPhoneNumber(number);
          }
        }
      } catch (error: any) {
        console.error("Error fetching phone number:", error);
        toast.error("Failed to fetch phone number.");
      } finally {
        setPhoneQueryLoading(false);
      }
    }
    getNumber();
  }, [companyId]);

  // Generate a 6-digit OTP
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Handle sending OTP via Twilio
  const handleSendOtp = async () => {
    if (otpLoading || timer > 0 || phoneQueryLoading) return;

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setOtpLoading(true);
    try {
      const newOtp = generateOtp();
      const formattedPhone = `+91${phoneNumber}`;
      const response = await axios.post(
        "https://inovact-twilio-service.vercel.app/inovactservice/send-sms",
        {
          to: formattedPhone,
          body: `Your OTP is ${newOtp}. Valid for 5 minutes.`,
        }
      );

      if (response.data.success) {
        setGeneratedOtp(newOtp);
        setOtpSent(true);
        setTimer(30); // Start 30-second timer
        toast.success("OTP sent to your phone!");
      } else {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (otpLoading || !generatedOtp) return;

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setOtpLoading(true);
    try {
      if (otp === generatedOtp) {
        // Delete existing documents with matching companyId
        const q = query(phoneCollection, where("companyId", "==", companyId));
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
        console.log(
          `Deleted ${querySnapshot.size} documents for companyId: ${companyId}`
        );

        // Add new document
        await addDoc(phoneCollection, {
          companyId: companyId || "unknown",
          phoneNumber: `+91${phoneNumber}`,
          verifiedAt: new Date().toISOString(),
        });

        toast.success("Phone number verified and saved!");
        setOtpSent(false);
        setOtp("");
        setGeneratedOtp(null);
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP: " + error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle form submission for company settings
  const onSubmit = async (data: SettingsFormData) => {
    if (loading) return;
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
      if (fetchedData?.companyName) {
        await axios.put(
          `${host}/company/${companyId}`,
          {
            name: data.companyName,
            website: data.website,
            linkedin_url: data.linkedin,
            email_preferences: data.assignmentNotifications,
          },
          {
            headers: {
              Authorization: idToken,
            },
          }
        );

        await axios.put(
          `${host}/users`,
          {
            email: data.email,
            first_name: data.contactName,
            last_name: data.contactName,
          },
          {
            headers: {
              Authorization: idToken,
            },
          }
        );
        toast.success("Company settings updated successfully!");
      } else {
        const response = await axios.post(
          `${host}/company`,
          {
            name: data.companyName,
            website: data.website,
            linkedin_url: data.linkedin,
            email_preferences: data.assignmentNotifications,
          },
          {
            headers: {
              Authorization: idToken,
            },
          }
        );

        await axios.put(
          `${host}/users`,
          {
            email: data.email,
            first_name: data.contactName,
            last_name: data.contactName,
          },
          {
            headers: {
              Authorization: idToken,
            },
          }
        );
        setCompanyId(response.data.id);
        setFetchedData({
          companyName: data.companyName,
          website: data.website,
          linkedin: data.linkedin || "",
          contactName: data.contactName,
          email: data.email,
          assignmentNotifications: data.assignmentNotifications,
        });
        toast.success("Company settings added successfully!");
      }
    } catch (error: any) {
      console.error("Error updating settings:", error);
      if (error.response) {
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
              <CardTitle>Phone Number Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!otpSent ? (
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={otpLoading || timer > 0 || phoneQueryLoading}
                    />
                    {phoneQueryLoading && (
                      <p className="mt-1 text-sm text-gray-600">
                        Loading phone number...
                      </p>
                    )}
                  </div>
                  <div className="mt-6 ">
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || timer > 0 || phoneQueryLoading}
                    >
                      {otpLoading ? (
                        <Spinner />
                      ) : timer > 0 ? (
                        `Resend OTP (${timer}s)`
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-700"
                    >
                      OTP
                    </label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={otpLoading}
                    />
                  </div>
                  <div className="mt-6">
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading}
                    >
                      {otpLoading ? <Spinner /> : "Verify OTP"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                    nate: {
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
