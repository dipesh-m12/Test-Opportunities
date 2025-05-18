/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebaseConfig"; // Adjust path as needed
import { createUserWithEmailAndPassword } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import { token } from "@/utils";
import axios from "axios";
import { host } from "@/utils/routes";

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    try {
      // Create user with email and password using Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Get the user object from userCredential
      const user = userCredential.user;
      const uid = userCredential.user.uid; // Extract the UID
      const idToken = await user.getIdToken(); // Get the ID token

      // Store token and UID in localStorage
      localStorage.setItem("uid", uid); // Store UID separately

      // console.log(idToken);
      // console.log("SignUp Success:", {
      //   email: user.email,
      //   uid: uid, // Log the UID
      //   idToken: idToken,
      // });
      console.log(idToken);

      const response = await axios.post(
        `${host}/users`,
        {
          email: data.email,
          first_name: "",
          last_name: "",
        },
        {
          headers: {
            Authorization: idToken, // Use Bearer token format
          },
        }
      );

      localStorage.setItem(token, idToken); // Assuming token is "authToken" or similar
      console.log("API Response:", response.data);

      toast.success(
        "Account created successfully! Redirecting to dashboard..."
      );

      // Navigate to home/dashboard after successful signup
      setTimeout(() => navigate("/settings"), 2000);
    } catch (error: any) {
      console.error("SignUp Error:", error.message);
      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("This email is already registered");
          break;
        case "auth/invalid-email":
          toast.error("Invalid email format");
          break;
        case "auth/weak-password":
          toast.error("Password is too weak");
          break;
        case "auth/operation-not-allowed":
          toast.error("Email/password sign-up is disabled");
          break;
        default:
          toast.error("Failed to create account. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      {/* Toaster for notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-6 sm:mb-8 text-center">
        Inovact Opportunities
      </h1>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Recruiter Sign Up
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Create your recruiter account to get started
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          {/* Email Field */}
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

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full text-sm sm:text-base"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full text-sm sm:text-base"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? <Spinner /> : null}
            {loading ? "Signing Up..." : "Recruiter Sign Up"}
          </Button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
