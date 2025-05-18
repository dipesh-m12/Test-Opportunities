/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react"; // Added Eye and EyeOff icons
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebaseConfig"; // Adjust path as needed
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { token } from "@/utils";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { host } from "@/utils/routes";

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
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const navigate = useNavigate();
  const [phoneNumber, setphoneNumber] = useState("");

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);
    try {
      console.log("Attempting sign-in with:", data.email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const idToken = await userCredential.user.getIdToken();

      // console.log("Email Sign-In Success:", {
      //   email: userCredential.user.email,
      //   idToken: idToken,
      // });
      console.log(idToken);

      // Make Axios call to the /users API with idToken
      const response = await axios.get(`${host}/users`, {
        headers: {
          Authorization: idToken, // Use Bearer token format
        },
      });

      localStorage.setItem(token, idToken);
      console.log("API Response:", response.data);

      toast.success("Successfully signed in!");
      handleNavigation();
      // setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error: any) {
      console.error("Email Sign-In Error:", error.message);
      switch (error.code) {
        case "auth/invalid-credential":
          toast.error("Invalid email or password");
          break;
        case "auth/user-not-found":
          toast.error("No account found with this email");
          break;
        case "auth/wrong-password":
          toast.error("Incorrect password");
          break;
        case "auth/too-many-requests":
          toast.error("Too many attempts. Try again later");
          break;
        default:
          toast.error("Sign-in failed. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = async () => {
    const idToken = localStorage.getItem(token);
    if (!idToken) {
      // toast.error("Seems like you are not logged in");
      // setTimeout(() => {
      //   navigate("/sign-in");
      // }, 2000);
      return;
    }

    try {
      console.log("dashboard companyId");
      const response = await axios.get(`${host}/company`, {
        headers: {
          Authorization: idToken,
        },
      });
      if (response.status === 200) {
        console.log(response.data.id);
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      navigate("/settings");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      const {
        user: { email, displayName },
      } = userCredential;

      console.log("Google Sign-In Success:", { email, displayName, idToken });

      const response = await axios.get(`${host}/users`, {
        headers: {
          Authorization: idToken, // Use Bearer token format
        },
      });

      localStorage.setItem(token, idToken);

      console.log("API Response:", response.data);

      toast.success("Signed in with Google!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error.message);
      toast.error("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    toast.success(
      "Sms will be sent to you. This feature will be available soon"
    );
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
            Recruiter Sign In
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Welcome back! Please sign in to your account
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

          <div>
            <label
              htmlFor="password"
              className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
              Password
            </label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"} // Toggle type based on state
                placeholder="••••••••"
                className="w-full text-sm sm:text-base pr-10" // Added padding-right for icon
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {!showPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? <Spinner /> : null}
            {loading ? "Signing In..." : "Recruiter Sign In"}
          </Button>
        </form>

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

        {/* <div className="mt-6">
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number
          </label>
          <div className="flex gap-4">
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setphoneNumber(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your phone number"
            />
            <button
              type="button"
              onClick={handlePhoneVerify}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Verify
            </button>
          </div>
        </div> */}

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
