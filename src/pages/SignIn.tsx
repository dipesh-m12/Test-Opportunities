import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";

interface SignInFormData {
  email: string;
  password: string;
}

export const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate("/");
      console.log("SignIn data:", data);
    } catch (error) {
      console.error("SignIn error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    // Simulate Google OAuth redirect
    setTimeout(() => {
      console.log("Continue with Google");
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      {/* Header Outside Card */}
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-6 sm:mb-8">
        Inovact Opportunities
      </h1>

      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-6 sm:space-y-8">
        {/* Subheader */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Recruiter Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please sign in to your account
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full"
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
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
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
            {loading ? "Signing In..." : "Recruiter Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          className="w-full text-sm sm:text-base flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 bg-white text-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <Spinner />
          ) : (
            <FcGoogle className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
          {loading ? "Loading..." : "Google"}
        </button>

        {/* Sign-Up Link */}
        <p className="text-center text-xs sm:text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/sign-up" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
