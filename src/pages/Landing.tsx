/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckSquare,
  Calendar,
  ArrowRight,
  Check,
  Zap,
  Loader2,
  Github,
} from "lucide-react";
import { addDoc } from "firebase/firestore";
import { requests } from "@/utils/firebaseConfig";
import toast, { Toaster } from "react-hot-toast";
import emailjs from "@emailjs/browser";
import dashboard from "../assets/dashboard.png";
import manage from "../assets/managejobs.png";
import post from "../assets/postjob.png";
import projects from "../assets/image.png";
import screencandi from "../assets/screencandi.png";
import Footer from "@/components/Footer";

export default function Home() {
  const secRef = useRef<any>();
  const scrollUpRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    companySize: "",
    linkedIn: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    companyName: "",
    companySize: "",
    linkedIn: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const scrollUp = () => {
    scrollUpRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollUpEffort = () => {};

  const validateLinkedInURL = (url: any) => {
    // LinkedIn URL should match the pattern: https://(www.)linkedin.com/in/username
    const linkedInRegex =
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]{3,100}(\/)?$/;
    return linkedInRegex.test(url);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
      isValid = false;
    }

    if (!formData.companySize) {
      newErrors.companySize = "Company size is required";
      isValid = false;
    }

    if (!formData.linkedIn.trim()) {
      newErrors.linkedIn = "Linkedin is required";
      isValid = false;
    } else if (!validateLinkedInURL(formData.linkedIn)) {
      newErrors.linkedIn =
        "Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Here you would typically send the data to your backend
      console.log("Form submitted:", formData);
      setFormSubmitted(true);

      // Reset form after submission
      try {
        console.log(1);
        setLoading(true);
        await addDoc(requests, { ...formData, time: new Date() });
        //hello
        emailjs
          .send(
            "service_g3z66ko",
            "template_jecaf4i",
            {
              from_name: formData.companyName,
              to_name: "Sarang",
              from_email: formData.email,
              to_email: "inovacteam@gmail.com",
              message: `
              fullName: ${formData.name}
              companyName :${formData.companyName}
              email: ${formData.email}
              companySize: ${formData.companySize}
              linkedIn: ${formData.linkedIn}
            `,
            },
            "5bG7oTqyWUlj9dOIg"
          )
          .then(() => console.log(1));
        toast.success("Request received");
      } catch (e) {
        console.log(e);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);

        setFormData({
          name: "",
          email: "",
          companyName: "",
          companySize: "",
          linkedIn: "",
        });
      }

      // Show success message for 3 seconds
      setTimeout(() => {
        setFormSubmitted(false);
      }, 3000);
    }
  };

  const HowItWorksSection = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Function to open modal with the clicked image
    const openModal = (imageSrc: any) => {
      setSelectedImage(imageSrc);
      setIsModalOpen(true);
    };

    // Function to close modal
    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedImage(null);
    };

    return (
      <section className="py-20 px-2 sm:px-6" id="how-it-works">
        <div className="container mx-auto max-w-screen-2xl">
          <h2 className="text-3xl font-bold mb-4 text-center">How It Works</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-12 max-w-5xl mx-auto text-left sm:text-center">
            Our Proof of work-based recruitment platform replaces traditional
            résumés with real projects, eliminating guesswork and saving you
            time.
          </p>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8 ">
            <div className="sm:flex border-b overflow-x-auto hidden ">
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === "dashboard"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === "postJobs"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("postJobs")}
              >
                Post Jobs
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === "screenCandidates"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("screenCandidates")}
              >
                Screen Candidates
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === "reviewProjects"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("reviewProjects")}
              >
                Review Projects
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === "manageJobs"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("manageJobs")}
              >
                Manage Jobs
              </button>
            </div>
            <div className="p-6 hidden sm:block">
              {activeTab === "dashboard" && (
                <div>
                  <div className="text-left mb-6">
                    <h3 className="text-xl font-bold mb-2">
                      Recruiter Dashboard
                    </h3>
                    <p className="text-gray-600">
                      Get a complete overview of your hiring process with active
                      jobs, total candidates, and shortlisted profiles all in
                      one place.
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-3/5">
                      <img
                        src={dashboard}
                        alt="Dashboard Interface"
                        className="w-full rounded-lg border border-gray-200 cursor-pointer"
                        onClick={() => openModal(dashboard)}
                      />
                    </div>
                    <div className="w-full md:w-2/5 space-y-4 self-start mt-0 md:mt-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          View active jobs, total candidates, and shortlisted
                          applicants at a glance
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          Track recent applications in{" "}
                          <span className="text-blue-700 font-semibold">
                            real-time
                          </span>{" "}
                          with application status
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          Quickly{" "}
                          <span className="text-blue-700 font-semibold">
                            access
                          </span>{" "}
                          shortlisted candidates and schedule interviews
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "postJobs" && (
                <div>
                  <div className="text-left mb-6">
                    <h3 className="text-xl font-bold mb-2">Post Jobs</h3>
                    <p className="text-gray-600">
                      Create detailed job listings with skill requirements that
                      our AI will use to match with candidate profiles and
                      projects.
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-3/5 ">
                      <img
                        src={post}
                        alt="Post Jobs Interface"
                        className="w-full rounded-lg border border-gray-200 cursor-pointer"
                        onClick={() => openModal(post)}
                      />
                    </div>
                    <div className="w-full md:w-2/5 space-y-4 self-start mt-0 md:mt-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          Define technical requirements with precision using our{" "}
                          <span className="text-blue-700 font-semibold">
                            skill taxonomy
                          </span>
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          Set up{" "}
                          <span className="text-blue-700 font-semibold">
                            custom
                          </span>{" "}
                          technical assessments specific to your role
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "screenCandidates" && (
                <div>
                  <div className="text-left mb-6">
                    <h3 className="text-xl font-bold mb-2">
                      Screen Candidates
                    </h3>
                    <p className="text-gray-600">
                      Our AI analyzes candidates' GitHub repositories and code
                      to match them with your job requirements.
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-3/5">
                      <img
                        src={screencandi}
                        alt="Screen Candidates Interface"
                        className="w-full rounded-lg border border-gray-200 cursor-pointer"
                        onClick={() => openModal(screencandi)}
                      />
                    </div>
                    <div className="w-full md:w-2/5 space-y-4 self-start mt-0 md:mt-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          <span className="text-blue-700 font-semibold">
                            AI-powered
                          </span>{" "}
                          matching of candidate skills to job requirements
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          Objective evaluation of{" "}
                          <span className="text-blue-700 font-semibold">
                            code quality
                          </span>{" "}
                          and problem-solving approach
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          Eliminate bias with blind screening focused only on{" "}
                          <span className="text-blue-700 font-semibold">
                            technical merit
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviewProjects" && (
                <div>
                  <div className="text-left mb-6">
                    <h3 className="text-xl font-bold mb-2">Review Projects</h3>
                    <p className="text-gray-600">
                      Evaluate candidates based on their Proof of work and code
                      contributions rather than just their resume claims.
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-3/5">
                      <img
                        src={projects}
                        alt="Review Projects Interface"
                        className="w-full rounded-lg border border-gray-200 cursor-pointer"
                        onClick={() => openModal(projects)}
                      />
                    </div>
                    <div className="w-full md:w-2/5 space-y-4 self-start mt-0 md:mt-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          <span className="text-blue-700 font-semibold">
                            Deep analysis
                          </span>{" "}
                          of code structure, patterns, and best practices
                        </p>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          Identify top performers based on actual{" "}
                          <span className="text-blue-700 font-semibold">
                            coding ability
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "manageJobs" && (
                <div>
                  <div className="text-left mb-6">
                    <h3 className="text-xl font-bold mb-2">Manage Jobs</h3>
                    <p className="text-gray-600">
                      Track the progress of all your open positions and manage
                      the entire hiring pipeline efficiently.
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-3/5">
                      <img
                        src={manage}
                        alt="Manage Jobs Interface"
                        className="w-full rounded-lg border border-gray-200 cursor-pointer"
                        onClick={() => openModal(manage)}
                      />
                    </div>
                    <div className="w-full md:w-2/5 space-y-4 self-start mt-0 md:mt-6 ">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          Centralized dashboard for all{" "}
                          <span className="text-blue-700 font-semibold">
                            recruitment activities
                          </span>
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 text-blue-600">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="ml-2 text-gray-700">
                          <span className="text-blue-700 font-semibold">
                            One-click
                          </span>{" "}
                          scheduling for interviews with calendar integration
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* mobile view */}
            <div className="flex sm:hidden flex-col justify-center items-center gap-16 p-2">
              <div>
                <div className="text-left mb-6">
                  <h3 className="text-xl font-bold mb-2">
                    Recruiter Dashboard
                  </h3>
                  <p className="text-gray-600">
                    Get a complete overview of your hiring process with active
                    jobs, total candidates, and shortlisted profiles all in one
                    place.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-3/5">
                    <img
                      src={dashboard}
                      alt="Dashboard Interface"
                      className="w-full rounded-lg border border-gray-200 cursor-pointer"
                      onClick={() => openModal(dashboard)}
                    />
                  </div>
                  <div className="w-full md:w-2/5 space-y-4 self-start mt-0 md:mt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        View active jobs, total candidates, and shortlisted
                        applicants at a glance
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        Track recent applications in{" "}
                        <span className="text-blue-700 font-semibold">
                          real-time
                        </span>{" "}
                        with application status
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        Quickly{" "}
                        <span className="text-blue-700 font-semibold">
                          access
                        </span>{" "}
                        shortlisted candidates and schedule interviews
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-left mb-6">
                  <h3 className="text-xl font-bold mb-2">Post Jobs</h3>
                  <p className="text-gray-600">
                    Create detailed job listings with skill requirements that
                    our AI will use to match with candidate profiles and
                    projects.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-3/5 ">
                    <img
                      src={post}
                      alt="Post Jobs Interface"
                      className="w-full rounded-lg border border-gray-200 cursor-pointer"
                      onClick={() => openModal(post)}
                    />
                  </div>
                  <div className="w-full md:w-2/5 space-y-4 self-start mt-0 md:mt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        Define technical requirements with precision using our{" "}
                        <span className="text-blue-700 font-semibold">
                          skill taxonomy
                        </span>
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        Set up{" "}
                        <span className="text-blue-700 font-semibold">
                          custom
                        </span>{" "}
                        technical assessments specific to your role
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-left mb-6">
                  <h3 className="text-xl font-bold mb-2">Screen Candidates</h3>
                  <p className="text-gray-600">
                    Our AI analyzes candidates' GitHub repositories and code to
                    match them with your job requirements.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-3/5">
                    <img
                      src={screencandi}
                      alt="Screen Candidates Interface"
                      className="w-full rounded-lg border border-gray-200 cursor-pointer"
                      onClick={() => openModal(screencandi)}
                    />
                  </div>
                  <div className="w-full md:w-2/5 space-y-4 self-start mt-0 md:mt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        <span className="text-blue-700 font-semibold">
                          AI-powered
                        </span>{" "}
                        matching of candidate skills to job requirements
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        Objective evaluation of{" "}
                        <span className="text-blue-700 font-semibold">
                          code quality
                        </span>{" "}
                        and problem-solving approach
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        Eliminate bias with blind screening focused only on{" "}
                        <span className="text-blue-700 font-semibold">
                          technical merit
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-left mb-6">
                  <h3 className="text-xl font-bold mb-2">Review Projects</h3>
                  <p className="text-gray-600">
                    Evaluate candidates based on their Proof of work and code
                    contributions rather than just their resume claims.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-3/5">
                    <img
                      src={projects}
                      alt="Review Projects Interface"
                      className="w-full rounded-lg border border-gray-200 cursor-pointer"
                      onClick={() => openModal(projects)}
                    />
                  </div>
                  <div className="w-full md:w-2/5 space-y-4 self-start mt-0 md:mt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        <span className="text-blue-700 font-semibold">
                          Deep analysis
                        </span>{" "}
                        of code structure, patterns, and best practices
                      </p>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        Identify top performers based on actual{" "}
                        <span className="text-blue-700 font-semibold">
                          coding ability
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-left mb-6">
                  <h3 className="text-xl font-bold mb-2">Manage Jobs</h3>
                  <p className="text-gray-600">
                    Track the progress of all your open positions and manage the
                    entire hiring pipeline efficiently.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-3/5">
                    <img
                      src={manage}
                      alt="Manage Jobs Interface"
                      className="w-full rounded-lg border border-gray-200 cursor-pointer"
                      onClick={() => openModal(manage)}
                    />
                  </div>
                  <div className="w-full md:w-2/5 space-y-4 self-start mt-0 md:mt-6 ">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        Centralized dashboard for all{" "}
                        <span className="text-blue-700 font-semibold">
                          recruitment activities
                        </span>
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-gray-700">
                        <span className="text-blue-700 font-semibold">
                          One-click
                        </span>{" "}
                        scheduling for interviews with calendar integration
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={closeModal}
            >
              <div
                className="max-w-6xl w-full p-4"
                onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the image container
              >
                <img
                  src={selectedImage!}
                  alt="Full-size preview"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="flex flex-col min-h-screen font-poppins">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600">
            Inovact Opportunities
          </Link>
          <div className="flex items-center space-x-4">
            {/* Desktop version (hidden on mobile) */}
            <span
              onClick={() =>
                // secRef?.current?.scrollIntoView({ behavior: "smooth" })
                navigate("/sign-in")
              }
              className="cursor-pointer hidden sm:block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Join waitlist
            </span>
            {/* Mobile version (hidden on desktop) */}
            <span
              onClick={() =>
                // secRef?.current?.scrollIntoView({ behavior: "smooth" })
                navigate("/sign-in")
              }
              className="sm:hidden p-2 inline-block rounded-full bg-white border-2 border-blue-600 text-blue-600 font-medium transition-all duration-300 hover:bg-blue-50 active:scale-95 group"
            >
              <svg
                className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b">
            <div className="container mx-auto px-6 py-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section ref={scrollUpRef} className="py-16 md:py-24 md:pb-12 px-6">
          <div className="container mx-auto max-w-6xl justify-center items-center">
            {/* Free for First 100 Recruiters - Minimalist Top Banner */}
            <div className="text-center mb-8">
              <span className="text-xl md:text-5xl font-semibold text-slate-800 ">
                Free for first{" "}
                <span className="text-blue-600">100 Recruiters</span>
              </span>
            </div>

            <div className="flex justify-start sm:justify-center">
              <div className="inline-flex items-center bg-blue-100 text-blue-600 px-4 py-1 rounded-full mb-6">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                <span className="sm:text-base text-sm">
                  Revolutionizing Tech Recruitment
                </span>
              </div>
            </div>
            <h1 className=" text-4xl md:text-6xl font-bold mb-8 max-w-5xl mx-auto text-start sm:text-center">
              Stop hiring based on{" "}
              <span className="text-blue-600 underline decoration-2">
                promises
              </span>
              .
              <br />
              Start hiring based on{" "}
              <span className="text-blue-600 underline decoration-2">
                proof
              </span>
              .
            </h1>
            <p className="text-sm sm:text-base text-start sm:text-center text-gray-600 mb-10 max-w-5xl mx-auto">
              <span className="font-semibold">90% of traditional hiring</span>{" "}
              relies on unverified resumes. Inovact Opportunities replaces empty
              claims with real proof of work and code matching the{" "}
              <span className="font-semibold">right talent</span> to your needs
              with unparalleled accuracy.
            </p>
            <div className="flex flex-col justify-center sm:flex-row gap-4 mb-12">
              <span
                onClick={() =>
                  secRef?.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                Join waitlist <ArrowRight className="ml-2 h-4 w-4" />
              </span>
              {/* <span className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
        See Demo
      </span> */}
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-bold">3x</div>
                <div className="text-sm sm:text-base">Higher Quality Hires</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold">80%</div>
                <div className="text-sm sm:text-base">Faster Time-to-Hire</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold">+ 40-50%</div>
                <div className="text-sm sm:text-base">Candidate Match Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        {/* <section className="py-20 px-6" id="how-it-works">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-4 text-center">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-12 max-w-5xl mx-auto text-center">
              Our Proof of work-based recruitment platform replaces traditional
              résumés with real projects, eliminating guesswork and saving you
              time.
            </p>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
              <div className="flex border-b overflow-x-auto">
                <button
                  className={`px-6 py-3 font-medium ${
                    activeTab === "dashboard"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  Dashboard
                </button>
                <button
                  className={`px-6 py-3 font-medium ${
                    activeTab === "postJobs"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("postJobs")}
                >
                  Post Jobs
                </button>
                <button
                  className={`px-6 py-3 font-medium ${
                    activeTab === "screenCandidates"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("screenCandidates")}
                >
                  Screen Candidates
                </button>
                <button
                  className={`px-6 py-3 font-medium ${
                    activeTab === "reviewProjects"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("reviewProjects")}
                >
                  Review Projects
                </button>
                <button
                  className={`px-6 py-3 font-medium ${
                    activeTab === "manageJobs"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("manageJobs")}
                >
                  Manage Jobs
                </button>
              </div>
              <div className="p-6">
                {activeTab === "dashboard" && (
                  <div>
                    <div className="text-left mb-6">
                      <h3 className="text-xl font-bold mb-2">
                        Recruiter Dashboard
                      </h3>
                      <p className="text-gray-600">
                        Get a complete overview of your hiring process with
                        active jobs, total candidates, and shortlisted profiles
                        all in one place.
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full">
                        <img
                          src={dashboard}
                          alt="Dashboard Interface"
                          className="w-full rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="w-full md:w-1/3 space-y-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            View active jobs, total candidates, and shortlisted
                            applicants at a glance
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            Track recent applications in real-time with
                            application status
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            Quickly access shortlisted candidates and schedule
                            interviews
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "postJobs" && (
                  <div>
                    <div className="text-left mb-6">
                      <h3 className="text-xl font-bold mb-2">Post Jobs</h3>
                      <p className="text-gray-600">
                        Create detailed job listings with skill requirements
                        that our AI will use to match with candidate profiles
                        and projects.
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full">
                        <img
                          src={post}
                          alt="Post Jobs Interface"
                          className="w-full rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="w-full md:w-1/3 space-y-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            Define technical requirements with precision using
                            our skill taxonomy
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            Set up custom technical assessments specific to your
                            role
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "screenCandidates" && (
                  <div>
                    <div className="text-left mb-6">
                      <h3 className="text-xl font-bold mb-2">
                        Screen Candidates
                      </h3>
                      <p className="text-gray-600">
                        Our AI analyzes candidates' GitHub repositories and code
                        to match them with your job requirements.
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full">
                        <img
                          src={screencandi}
                          alt="Screen Candidates Interface"
                          className="w-full rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="w-full md:w-1/3 space-y-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            AI-powered matching of candidate skills to job
                            requirements
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            Objective evaluation of code quality and
                            problem-solving approach
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            Eliminate bias with blind screening focused only on
                            technical merit
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviewProjects" && (
                  <div>
                    <div className="text-left mb-6">
                      <h3 className="text-xl font-bold mb-2">
                        Review Projects
                      </h3>
                      <p className="text-gray-600">
                        Evaluate candidates based on their Proof of work and
                        code contributions rather than just their resume claims.
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full">
                        <img
                          src={projects}
                          alt="Review Projects Interface"
                          className="w-full rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="w-full md:w-1/3 space-y-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            Deep analysis of code structure, patterns, and best
                            practices
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            Compare candidate solutions to industry benchmarks
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            Identify top performers based on actual coding
                            ability
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "manageJobs" && (
                  <div>
                    <div className="text-left mb-6">
                      <h3 className="text-xl font-bold mb-2">Manage Jobs</h3>
                      <p className="text-gray-600">
                        Track the progress of all your open positions and manage
                        the entire hiring pipeline efficiently.
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full">
                        <img
                          src={manage}
                          alt="Manage Jobs Interface"
                          className="w-full rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="w-full md:w-1/3 space-y-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            Centralized dashboard for all recruitment activities
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="ml-2 text-gray-700">
                            One-click scheduling for interviews with calendar
                            integration
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section> */}

        <HowItWorksSection />

        {/* Better Hiring Decisions */}
        <section className="py-20 px-6" id="features">
          <div className="container mx-auto max-w-6xl">
            <div className="flex sm:justify-center justify-start">
              <div className="inline-flex items-center bg-blue-100 text-blue-600 px-4 py-1 rounded-full mb-6">
                <Zap className="h-4 w-4 mr-2" />
                <span className="sm:text-base text-sm">
                  Game-Changing Features
                </span>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-6 sm:text-center text-left">
              Make{" "}
              <span className="text-blue-600">better hiring decisions</span>{" "}
              faster
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-16 text-left sm:text-center">
              Traditional hiring is broken:{" "}
              <span className="font-semibold">
                74% of companies report making bad hires
              </span>{" "}
              <br />
              Inovact Opportunities eliminates the guesswork with data-driven
              talent matching.
            </p>

            <div className="flex flex-col gap-8">
              {/* First Row: 3 Cards Centered */}
              <div className="flex flex-col sm:flex-row justify-center gap-8">
                {/* Feature 1 */}
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-left bg-blue-300/10 shadow-xl sm:w-1/3">
                  <div className="bg-blue-100 p-3 rounded-lg inline-block mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    Proof of Work-Based Hiring
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Replace subjective resume evaluations with objective project
                    assessments.
                    <span className="text-blue-600 font-medium">
                      {" "}
                      Average time-to-hire reduced by 80%
                    </span>
                    .
                  </p>
                </div>
                {/* Feature 2 */}
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-left bg-blue-300/10 shadow-xl sm:w-1/3">
                  <div className="bg-blue-100 p-3 rounded-lg inline-block mb-4">
                    <Github className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    Intelligent GitHub Integration
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Our AI analyzes real code contributions and matches them to
                    your job requirements.
                    <span className="text-blue-600 font-medium">
                      {" "}
                      85% higher accuracy than keyword matching
                    </span>
                    .
                  </p>
                </div>
                {/* Feature 3
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-left bg-blue-300/10 shadow-xl sm:w-1/3">
                  <div className="bg-blue-100 p-3 rounded-lg inline-block mb-4">
                    <Code className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    Advanced Code Quality Analysis
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Get detailed insights on code quality, efficiency, and best
                    practices adoption.
                    <span className="text-blue-600 font-medium">
                      {" "}
                      Identifies top performers with 89% accuracy
                    </span>
                    .
                  </p>
                </div> */}
              </div>

              {/* Second Row: 2 Cards Centered */}
              <div className="flex flex-col sm:flex-row justify-center gap-8">
                {/* Feature 4 */}
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-left bg-blue-300/10 shadow-xl sm:w-1/3">
                  <div className="bg-blue-100 p-3 rounded-lg inline-block mb-4">
                    <CheckSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    Custom Technical Assessments
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Evaluate hands-on skills with customized tasks relevant to
                    your specific needs.
                    <span className="text-blue-600 font-medium">
                      {" "}
                      Reduces screening interviews by 65%
                    </span>
                    .
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-left bg-blue-300/10 shadow-xl sm:w-1/3">
                  <div className="bg-blue-100 p-3 rounded-lg inline-block mb-4">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    Streamlined Interview Process
                  </h3>
                  <p className="text-gray-600 mb-3">
                    One-click scheduling and integrated video interviews slash
                    administrative time.
                    <span className="text-blue-600 font-medium">
                      {" "}
                      Saves 5+ hours per hire
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Comparison */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-8 text-center bg-blue-600 text-white py-4 rounded-t-lg">
              Performance Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-b-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-4 text-left text-gray-700">
                      Performance Metric
                    </th>
                    <th className="px-6 py-4 text-center text-gray-700">
                      Traditional Methods
                    </th>
                    <th className="px-6 py-4 text-center text-gray-700">
                      Other Platforms
                    </th>
                    <th className="px-6 py-4 text-center bg-blue-50 text-blue-700">
                      Inovact Opportunities
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-6 py-4 text-gray-700">
                      Time to Screen 100 Candidates
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      ~40 hours
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      ~20 hours
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50 text-blue-700 font-medium">
                      ~2 hours
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-6 py-4 text-gray-700">
                      Skill-Match Accuracy
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      ~50%
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      ~70%
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50 text-blue-700 font-medium">
                      90%+
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-6 py-4 text-gray-700">
                      Interview Scheduling Time
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      24-48 hours
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      2-24 hours
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50 text-blue-700 font-medium">
                      Seconds
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-6 py-4 text-gray-700">
                      Candidate Quality Assessment
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      Subjective
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      Partially Objective
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50 text-blue-700 font-medium">
                      Data-Driven & Objective
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="pt-0 sm:py-20 md:pt-0 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl  border border-gray-100 text-center bg-blue-300/10 shadow-xl">
                <div className="bg-blue-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-2">80%</h3>
                <h4 className="text-lg font-medium mb-3">
                  Reduction in time-to-hire
                </h4>
                {/* <p className="text-gray-600">
                  Customers report cutting their hiring timeline in half with
                  Inovact Opportunities.
                </p> */}
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center bg-blue-300/10 shadow-xl">
                <div className="bg-blue-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-2">2-3x</h3>
                <h4 className="text-lg font-medium mb-3">
                  Higher candidate quality
                </h4>
                {/* <p className="text-gray-600">
                  Proof-based hiring consistently delivers better talent
                  matches.
                </p> */}
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center bg-blue-300/10 shadow-xl">
                <div className="bg-blue-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-2">60%</h3>
                <h4 className="text-lg font-medium mb-3">
                  Reduction in hiring costs
                </h4>
                {/* <p className="text-gray-600">
                  Less time spent on unqualified candidates means lower
                  recruitment costs.
                </p> */}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Inovact */}
        <section className="py-20 px-6 bg-blue-50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Why choose Inovact Opportunities?
                </h2>
                <p className="text-gray-600 mb-8">
                  While other platforms focus on keyword matching, we analyze
                  real-world programming skills and project contributions.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-700">
                      Reduced hiring costs by an average of 60%
                    </p>
                  </li>
                  {/* <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-700">
                      90% candidate match rate vs. 23% industry average
                    </p>
                  </li> */}
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-700">
                      Eliminate unconscious bias in technical evaluation
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-700">
                      Decrease time-to-hire by 80% on average
                    </p>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="text-center mb-6">
                  <h3 className="text-5xl font-bold text-blue-600">3x-5x</h3>
                  <p className="text-xl font-medium mt-2">
                    Return on Investment
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div className="bg-blue-600 h-4 rounded-full w-[80%]"></div>
                </div>
                {/* <p className="text-gray-600 text-center">
                  Based on average customer results after 6 months
                </p> */}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-14 sm:py-20 px-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-md sm:text-3xl font-semibold mb-4 text-left sm:text-center">
              Ready to transform your hiring process?
            </h2>
            <p className="mb-8 max-w-3xl mx-auto  text-left sm:text-center">
              <span className="text-xl sm:text-5xl font-bold block mb-2 ">
                Free for the first 100 recruiters.
              </span>
              <span className="text-xs sm:text-base ">
                Join now and experience the power of Proof of work-based hiring.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <span
                onClick={() =>
                  secRef?.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="cursor-pointer bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Join waitlist
              </span>
              {/* <Link
        to="#demo"
        className="bg-transparent border border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
      >
        Request Demo
      </Link> */}
            </div>
          </div>
        </section>

        {/* Waitlist Form Section */}
        <section ref={secRef} className="py-20 px-6 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Join Our Waitlist</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-4xl mx-auto text-left sm:text-center">
                Be among the first 100 recruiters to get free access to Inovact
                Opportunities and transform your hiring process.
              </p>
            </div>

            <div className="bg-white p-8 px-4 md:p-10 rounded-xl shadow-sm">
              {formSubmitted ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center bg-green-100 text-green-600 p-3 rounded-full mb-4">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                  <p className="text-gray-600">
                    You've been added to our waitlist. We'll contact you soon
                    with more information.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        formErrors.name ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                      placeholder="Enter your email address"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        formErrors.companyName
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                      placeholder="Enter your company name"
                    />
                    {formErrors.companyName && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="companySize"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Company Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        formErrors.companySize
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white appearance-none`}
                      style={{ backgroundPosition: "right 1rem center" }}
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    {formErrors.companySize && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.companySize}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="linkedinId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      LinkedIn Profile URL{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="linkedinId"
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        formErrors.linkedIn
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                      placeholder="Enter your LinkedIn profile URL"
                    />
                    {formErrors.linkedIn && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.linkedIn}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : null}
                    {loading ? "Submitting..." : "Join Waitlist"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Inovact Opportunities</h3>
              <p className="text-gray-400 mb-4">
                Simplifying tech recruitment through proof of work.
              </p>
              <div className="flex space-x-4">
               
                <Link
                  target="__blank"
                  to="https://www.linkedin.com/company/inovact-pvt-ltd2/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
                
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="https://www.inovact.in/"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="#features"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <span className="text-gray-400">support@inovact.com</span>
                </li>
                <li className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <span className="text-gray-400">
                    123 Tech Way, San Francisco, CA 94107
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className=" text-center text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} All rights reserved by Inovact
              Private Limited
            </div>
          
          </div>
        </div>
      </footer> */}
      <Footer scrollUp={scrollUp} scrollUpEffort={scrollUpEffort} />
      <Toaster />
    </div>
  );
}
