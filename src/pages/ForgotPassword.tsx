/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { auth } from "../utils/firebaseConfig"; // Adjust path as needed
import { sendPasswordResetEmail } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // Timer for resend cooldown (in seconds)
  const [resendDisabled, setResendDisabled] = useState(false);

  // Timer effect to handle resend cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      console.log("Attempting to send password reset email to:", data.email);
      await sendPasswordResetEmail(auth, data.email);
      toast.success("Password reset email sent! Check your inbox.");
      setTimer(60); // Start 60-second cooldown
      setResendDisabled(true);
    } catch (error: any) {
      console.error("Password Reset Error:", error.message);
      switch (error.code) {
        case "auth/invalid-email":
          toast.error("Please enter a valid email address");
          break;
        case "auth/user-not-found":
          toast.error("No account found with this email");
          break;
        case "auth/too-many-requests":
          toast.error("Too many attempts. Try again later");
          break;
        default:
          toast.error("Failed to send reset email. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-poppins min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      {/* Toaster for notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      <h1 className="font-poppins text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-6 sm:mb-8 text-center">
        Inovact Opportunities
      </h1>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full text-sm sm:text-base"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full text-sm sm:text-base"
            disabled={loading || resendDisabled}
          >
            {loading ? <Spinner /> : null}
            {loading
              ? "Sending..."
              : resendDisabled
              ? `Resend in ${timer}s`
              : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-600">
          Remembered your password?{" "}
          <Link to="/sign-in" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
