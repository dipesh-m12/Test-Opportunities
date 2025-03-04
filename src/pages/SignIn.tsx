import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
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

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please sign in to your account
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
              className=" text-sm font-medium text-gray-700 flex items-center gap-2"
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
              className=" text-sm font-medium text-gray-700 flex items-center gap-2"
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
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        {/* Continue with Google */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="bg-gray-100 px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full  text-sm sm:text-base flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <Spinner />
          ) : (
            <FcGoogle className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
          {loading ? "Loading..." : "Google"}
        </Button>

        <p className="text-center text-xs sm:text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};
