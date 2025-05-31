/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { host } from "@/utils/routes";
import axios from "axios";
import toast from "react-hot-toast";
import { token } from "@/utils";
import { useNavigate } from "react-router-dom";
import { addDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { phoneCollection } from "@/utils/firebaseConfig";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface SettingsFormData {
  companyName: string;
  website: string;
  linkedin: string;
  contactName: string;
  email: string;
  assignmentNotifications: boolean;
}

export const Settings = ({
  checkPhoneNumber,
  setIsPostJobEnabled,
  setIsPhoneNumber,
}: any) => {
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
  const [isPhoneRegistered, setIsPhoneRegistered] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

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
        checkPhoneNumber(response.data.id);
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
        setIsPostJobEnabled(false);
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
            // setIsPhoneNumber(true);
            setPhoneNumber(number);
            setIsPhoneRegistered(true);
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
      if (!companyId) {
        return toast.error(
          "Please fill the company details and contact information to verify your number"
        );
      }
      const formattedPhone = `${phoneNumber}`;
      const response = await axios.post(
        "https://inovact-twilio-service.vercel.app/inovactservice/send-sms",
        {
          to: formattedPhone,
          body: `${newOtp}`,
        }
      );

      if (response.data.success) {
        setGeneratedOtp(newOtp);
        setOtpSent(true);
        setTimer(30); // Start 30-second timer
        toast.success("OTP sent to your phone via WhatsApp!");
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
          phoneNumber: `${phoneNumber}`,
          verifiedAt: new Date().toISOString(),
        });

        toast.success("Phone number verified and saved!");
        setIsPhoneNumber(true);
        setOtpSent(false);
        setOtp("");
        setGeneratedOtp(null);
        setIsPhoneRegistered(true);
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

  // Handle disconnect phone number
  const handleDisconnect = async () => {
    if (otpLoading) return;
    setOtpLoading(true);
    try {
      const q = query(phoneCollection, where("companyId", "==", companyId));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      console.log(
        `Deleted ${querySnapshot.size} documents for companyId: ${companyId}`
      );
      setPhoneNumber("");
      setIsPhoneRegistered(false);
      setIsPhoneNumber(false);
      toast.success("Phone number disconnected successfully!");
    } catch (error: any) {
      console.error("Error disconnecting phone number:", error);
      toast.error("Failed to disconnect phone number.");
    } finally {
      setOtpLoading(false);
      setShowDisconnectModal(false);
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

        toast.success("Company settings updated successfully!");
      } else {
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

        setCompanyId(response.data.id);
        setFetchedData({
          companyName: data.companyName,
          website: data.website,
          linkedin: data.linkedin,
          contactName: data.contactName,
          email: data.email,
          assignmentNotifications: data.assignmentNotifications,
        });
        setIsPostJobEnabled(true);
        toast.success("Company settings added successfully!");
      }
    } catch (error: any) {
      console.error("Error updating settings:", error);
      setIsPostJobEnabled(false);
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
          <Card className="px-4 sm:px-6">
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  disabled={loading}
                  id="companyName"
                  {...register("companyName", {
                    required: "Company name is required",
                  })}
                  className="w-full"
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
                  Website <span className="text-red-500">*</span>
                </label>
                <Input
                  disabled={loading}
                  id="website"
                  placeholder="https://"
                  type="url"
                  {...register("website", {
                    required: "Website URL is required",
                    pattern: {
                      value:
                        /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i,
                      message: "Please enter a valid URL",
                    },
                  })}
                  className="w-full"
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
                  LinkedIn <span className="text-red-500">*</span>
                </label>
                <Input
                  disabled={loading}
                  id="linkedin"
                  type="url"
                  {...register("linkedin", {
                    required: "LinkedIn URL is required",
                    pattern: {
                      value:
                        /^https?:\/\/(www\.)?linkedin\.com\/(company|in)\/[a-zA-Z0-9_-]+\/?$/i,
                      message: "Please enter a valid LinkedIn URL",
                    },
                  })}
                  className="w-full"
                />
                {errors.linkedin && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.linkedin.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="px-4 sm:px-6">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label
                  htmlFor="contactName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <Input
                  disabled={loading}
                  id="contactName"
                  {...register("contactName", {
                    required: "Contact name is required",
                  })}
                  className="w-full"
                />
                {errors.contactName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contactName.message}
                  </p>
                )}
              </div>
              <div>
                {/* <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email <span className="text-red-500">*</span>
                </label> */}
                {/* <Input
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
                  className="w-full"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )} */}
              </div>
            </CardContent>
          </Card>
          {companyId ? (
            <Card className="px-4 sm:px-6">
              <CardHeader>
                <CardTitle>Phone Number Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!otpSent && !isPhoneRegistered ? (
                  <div className="space-y-4">
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center justify-start space-x-4">
                      <div className="flex-1 relative">
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="1234567890"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          disabled={
                            otpLoading || timer > 0 || phoneQueryLoading
                          }
                          className="w-full"
                        />
                        {phoneQueryLoading && (
                          <p className="mt-1 text-sm text-gray-600">
                            Loading phone number...
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading || timer > 0 || phoneQueryLoading}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
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
                    <p className="text-sm text-gray-600">
                      OTP will be sent to your phone number via WhatsApp.
                    </p>
                  </div>
                ) : otpSent ? (
                  <div className="space-y-4">
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-700"
                    >
                      OTP
                    </label>
                    <div className="flex items-center justify-start space-x-4">
                      <div className="flex-1">
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          disabled={otpLoading}
                          className="w-full"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpLoading}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                      >
                        {otpLoading ? <Spinner /> : "Verify OTP"}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      OTP was sent to your phone number via WhatsApp.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center justify-start space-x-4">
                      <div className="flex-1 relative">
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={phoneNumber}
                          disabled={true}
                          className="w-full pr-10"
                        />
                        <CheckCircleIcon
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500"
                          aria-hidden="true"
                        />
                      </div>
                      <Button
                        variant="danger"
                        type="button"
                        onClick={() => setShowDisconnectModal(true)}
                        className="px-4 py-2  text-red-700 hover:bg-gray-400 rounded-md"
                        disabled={otpLoading}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            ""
          )}

          {/* Modal for Disconnect Confirmation */}
          {showDisconnectModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                <h2 className="text-lg font-semibold text-gray-900">
                  Confirm Disconnect
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to disconnect the phone number{" "}
                  <span className="font-medium">{phoneNumber}</span>? This
                  action cannot be undone.
                </p>
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="none"
                    className="px-4 py-2 bg-gray-200 text-gray-900 hover:bg-gray-300 rounded-md transition-colors"
                    onClick={() => setShowDisconnectModal(false)}
                    disabled={otpLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
                    onClick={handleDisconnect}
                    disabled={otpLoading}
                  >
                    {otpLoading ? <Spinner /> : "Disconnect"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Card className="px-4 sm:px-6">
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
            <Button
              type="submit"
              disabled={loading || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
            >
              {loading || isSubmitting ? <Spinner /> : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
