/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  PlusCircle,
  Users,
  Briefcase,
  Award,
  ExternalLink,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import CountUp from "@/components/react-bits/CountUp";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import { toast } from "react-hot-toast";
import { token } from "@/utils";
import { host } from "@/utils/routes";
import axios from "axios";
import React from "react";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [isPostJobEnabled, setIsPostJobEnabled] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [stats, setStats] = useState([
    {
      label: "Active Jobs",
      value: 0,
      icon: Briefcase,
      route: "/manage-jobs",
      filter: "active",
    },
    {
      label: "Total Candidates",
      value: 0,
      icon: Users,
      route: "/manage-jobs",
      filter: "all",
    },
    {
      label: "Shortlisted",
      value: 0,
      icon: Award,
      route: "/manage-jobs",
      filter: "shortlisted",
    },
  ]);

  const [recentApplications, setRecentApplications] = useState([
    {
      id: "1",
      candidate: {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      },
      position: "Senior Frontend Developer",
      appliedDate: "2024-03-10",
      status: "new",
    },
    {
      id: "2",
      candidate: {
        name: "Jane Smith",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      },
      position: "Backend Engineer",
      appliedDate: "2024-03-09",
      status: "shortlisted",
    },
  ]);

  //fetched data
  const [jobs, setjobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);

  React.useEffect(() => {
    const checkCompanyAccess = async () => {
      const idToken = localStorage.getItem(token);
      if (!idToken) {
        toast.error("Seems like you are not logged in");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
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
          setIsPostJobEnabled(true);
          setCompanyId(response.data.id);
          console.log(response.data.id);
        }
      } catch (error) {
        setIsPostJobEnabled(false);
        // toast.error("Company cant be fetched due to an issue");
        console.log(error);
      }
    };

    checkCompanyAccess();
  }, []);

  //active jobs
  useEffect(() => {
    try {
      if (!companyId) {
        console.log("Company Id absent");
        return;
      }
      const idToken = localStorage.getItem(token);

      if (!idToken) {
        toast.error("Seems like you are not logged in");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
        return;
      }
      async function getActiveJobs() {
        const response = await axios.get(`${host}/company/${companyId}/job`, {
          headers: {
            Authorization: idToken,
          },
        });
        const candidate = await axios.get(
          `${host}/application/company/${companyId}`,
          {
            headers: {
              Authorization: idToken,
            },
          }
        );
        console.log(candidate.data);
        let data = response.data;
        setjobs(data);
        data = data.filter((e: any) => e.status == "active");
        // console.log(data);
        const updatedStats = stats.map((e) =>
          e.label == "Active Jobs"
            ? {
                label: "Active Jobs",
                value: data.length || 0,
                icon: Briefcase,
                route: "/manage-jobs",
                filter: "active",
              }
            : e.label == "Total Candidates"
            ? {
                label: "Total Candidates",
                value: candidate.data.length || 0,
                icon: Users,
                route: "/manage-jobs",
                filter: "all",
              }
            : {
                label: "Shortlisted",
                value:
                  candidate.data.filter(
                    (e) => e.application.status == "shortlisted"
                  ).length || 0,
                icon: Award,
                route: "/manage-jobs",
                filter: "shortlisted",
              }
        );
        setStats(updatedStats);
      }
      if (companyId) getActiveJobs();
    } catch (e) {
      console.error("Error", e);
    }
  }, [companyId]);

  //shortlisted and all candidates
  // useEffect(() => {
  //   try {
  //     if (!companyId) {
  //       console.log("Company Id absent");
  //       return;
  //     }
  //     const idToken = localStorage.getItem(token);

  //     if (!idToken) {
  //       toast.error("Seems like you are not logged in");
  //       setTimeout(() => {
  //         navigate("/sign-in");
  //       }, 2000);
  //       return;
  //     }
  //     async function getActiveJobs() {
  //       //get the all candidates api

  //       const response = await axios.get(`${host}/company/${companyId}/job`, {
  //         headers: {
  //           Authorization: idToken,
  //         },
  //       });
  //       let data = response.data;
  //       //set the candidates
  //       setjobs(data);
  //       data = data.filter((e) => e.status == "active");
  //       console.log(data);

  //       //two filters for total and shortlisted candidates
  //       //aslo set recent applications
  //       const updatedStats = stats.map((e) =>
  //         e.label == "Active Jobs"
  //           ? {
  //               label: "Active Jobs",
  //               value: data.length || 0,
  //               icon: Briefcase,
  //               route: "/manage-jobs",
  //               filter: "active",
  //             }
  //           : e
  //       );

  //       //set candids
  //       setStats(updatedStats);
  //     }
  //     if (companyId) getActiveJobs();
  //   } catch (e) {
  //     console.error("Error", e);
  //   }
  // }, [companyId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          onClick={() => navigate("/post-job")}
          disabled={!isPostJobEnabled}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              onClick={() =>
                stat.filter === "active"
                  ? navigate(stat.route)
                  : navigate(stat.route, { state: stat.filter })
              }
            >
              <CardContent className="flex items-center p-4 sm:p-6">
                <div className="rounded-full bg-blue-100 p-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    <CountUp
                      from={0}
                      to={stat.value}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text"
                      onStart={undefined}
                      onEnd={undefined}
                    />
                    {/* {stat.value} */}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        {loading ? (
          <Spinner />
        ) : (
          <CardContent>
            <div className="space-y-4 flex flex-col items-start">
              {recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 space-y-4 sm:space-y-0 w-full max-w-md sm:max-w-lg lg:max-w-xl"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <Avatar
                      src={application.candidate.avatar}
                      alt={application.candidate.name}
                      fallback={application.candidate.name}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {application.candidate.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        <span className="font-semibold">Applying for:</span>{" "}
                        {application.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <Badge
                      variant={
                        application.status === "new" ? "default" : "success"
                      }
                    >
                      {application.status === "new" ? "New" : "Shortlisted"}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      {formatDate(application.appliedDate)}
                    </div>
                    <button
                      onClick={() => navigate(`/candidates/${application.id}`)}
                      className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
