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
import { auth } from "@/utils/firebaseConfig";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { collection, doc, setDoc, getFirestore } from "firebase/firestore";

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
  const [fetchedData, setFetchedData] = useState<SettingsFormData>();
  const [companyId, setCompanyId] = useState<string>("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  // Initialize reCAPTCHA verifier
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Ensure browser environment and DOM element exist
    if (
      typeof window === "undefined" ||
      !document.getElementById("recaptcha-container")
    ) {
      setRecaptchaError(
        "reCAPTCHA container not found or not in browser environment."
      );
      return;
    }

    // Enable testing mode for localhost
    const isLocalhost = window.location.hostname === "localhost";
    if (isLocalhost) {
      console.log("Running in localhost, disabling reCAPTCHA for testing");
      auth.settings.appVerificationDisabledForTesting = true;
      setRecaptchaReady(true);
      setRecaptchaVerifier(null);
      return;
    }

    // Wait for reCAPTCHA script to load with retry limit
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds
    const checkRecaptchaScript = () => {
      console.log(`Checking reCAPTCHA script, attempt ${retryCount + 1}`);
      if (window.grecaptcha) {
        console.log("reCAPTCHA script loaded successfully");
        try {
          const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            "data-type": "normal",
            callback: () => {
              console.log("reCAPTCHA solved");
              setRecaptchaReady(true);
            },
            "expired-callback": () => {
              console.log("reCAPTCHA expired");
              setRecaptchaReady(false);
              setRecaptchaError("reCAPTCHA expired. Please try again.");
              toast.error("reCAPTCHA expired. Please refresh the page.");
            },
          });
          setRecaptchaVerifier(verifier);
          verifier
            .render()
            .then(() => {
              console.log("reCAPTCHA rendered");
              setRecaptchaReady(true);
            })
            .catch((error) => {
              console.error("Error rendering reCAPTCHA:", error);
              setRecaptchaError("Failed to render reCAPTCHA: " + error.message);
              toast.error(
                "Failed to initialize reCAPTCHA. Please refresh the page."
              );
            });
        } catch (error: any) {
          console.error("Error initializing reCAPTCHA:", error);
          setRecaptchaError("Failed to initialize reCAPTCHA: " + error.message);
          toast.error(
            "Failed to initialize reCAPTCHA. Please refresh the page."
          );
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(checkRecaptchaScript, 100);
      } else {
        console.error("reCAPTCHA script failed to load after max retries");
        setRecaptchaError(
          "reCAPTCHA script failed to load. Please check your network, ad blocker, or browser settings."
        );
        toast.error(
          "Failed to load reCAPTCHA. Please check your network, ad blocker, or browser settings."
        );
      }
    };

    console.log("Starting reCAPTCHA script check");
    checkRecaptchaScript();

    // Cleanup on unmount
    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, []);

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

        console.log("API Response:", response.data);
        console.log("API2 Response:", api2.data);
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
  }, [navigate, reset]);

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
        const response = await axios.put(
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

        const api2 = await axios.put(
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

        const api2 = await axios.put(
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

  const handleSendCode = async () => {
    if (phoneLoading) {
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    const isLocalhost = window.location.hostname === "localhost";
    if (
      !isLocalhost &&
      (!recaptchaVerifier || recaptchaError || !recaptchaReady)
    ) {
      if (recaptchaError) {
        toast.error(recaptchaError);
      } else if (!recaptchaReady) {
        toast.error(
          "reCAPTCHA is not ready. Please wait a moment and try again."
        );
      }
      return;
    }

    setPhoneLoading(true);
    try {
      const formattedPhone = `+91${phoneNumber}`; // Assuming US country code
      console.log("Sending verification code to:", formattedPhone);
      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        isLocalhost ? undefined : recaptchaVerifier!
      );
      setConfirmationResult(result);
      setCodeSent(true);
      toast.success("Verification code sent to your phone!");
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      if (error.code === "auth/invalid-phone-number") {
        toast.error("Invalid phone number format.");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please try again later.");
      } else if (error.code === "auth/invalid-app-credential") {
        toast.error(
          "reCAPTCHA verification failed. Please refresh the page and try again."
        );
      } else {
        toast.error("Failed to send verification code: " + error.message);
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (phoneLoading || !confirmationResult) return;

    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    setPhoneLoading(true);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;

      // Store verified phone number in Firestore
      const db = getFirestore();
      const phoneCollection = collection(db, "RecruiterPhoneNumbers");
      await setDoc(doc(phoneCollection, user.uid), {
        userId: user.uid,
        companyId: companyId || "unknown",
        phoneNumber: `+91${phoneNumber}`,
        verifiedAt: new Date().toISOString(),
      });

      toast.success("Phone number verified and saved!");
      setCodeSent(false);
      setPhoneNumber("");
      setVerificationCode("");
      setConfirmationResult(null);
    } catch (error: any) {
      console.error("Error verifying code:", error);
      if (error.code === "auth/invalid-verification-code") {
        toast.error("Invalid verification code.");
      } else {
        toast.error("Failed to verify code: " + error.message);
      }
    } finally {
      setPhoneLoading(false);
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
              <CardTitle>Phone Number Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!codeSent ? (
                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
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
                      disabled={
                        phoneLoading || !!recaptchaError || !recaptchaReady
                      }
                    />
                    {recaptchaError && (
                      <p className="mt-1 text-sm text-red-600">
                        {recaptchaError}
                      </p>
                    )}
                    {!recaptchaError && !recaptchaReady && (
                      <p className="mt-1 text-sm text-gray-600">
                        Loading reCAPTCHA, please wait...
                      </p>
                    )}
                  </div>
                  <div className="sm:mt-6">
                    <Button
                      type="button"
                      onClick={handleSendCode}
                      disabled={
                        phoneLoading || !!recaptchaError || !recaptchaReady
                      }
                    >
                      {phoneLoading ? <Spinner /> : "Verify"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
                  <div className="flex-1">
                    <label
                      htmlFor="verificationCode"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Verification Code
                    </label>
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      disabled={phoneLoading}
                    />
                  </div>
                  <div className="sm:mt-6">
                    <Button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={phoneLoading}
                    >
                      {phoneLoading ? <Spinner /> : "Verify Code"}
                    </Button>
                  </div>
                </div>
              )}
              <div id="recaptcha-container" />
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
