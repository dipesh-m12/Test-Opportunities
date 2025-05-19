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
import moment from "moment";
import avatar from "../assets/default_avatar.png";

export const Dashboard = ({ isPostJobEnabled, setIsPostJobEnabled }: any) => {
  const navigate = useNavigate();
  // const [isPostJobEnabled, setIsPostJobEnabled] = React.useState(false);
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

  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  //rex

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
          // setIsPostJobEnabled(true);
          setIsPostJobEnabled(true);
          setCompanyId(response.data.id);
          console.log(response.data.id);
        }
      } catch (error) {
        // setIsPostJobEnabled(false);
        console.log(error);
        setIsPostJobEnabled(false);
      }
    };

    checkCompanyAccess();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
        const recentApplications = [...candidate.data]
          .sort((a, b) => {
            const dateA = new Date(a?.application?.updated_at || 0).getTime();
            const dateB = new Date(b?.application?.updated_at || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 5)
          .map((e) => ({
            id: e?.application?.id || null,
            job_id: e.application?.job?.id,
            candidate: {
              name:
                `${e.user.first_name || "Unknown"} ${
                  e.user.last_name || ""
                }`.trim() || "Unknown",
              avatar: e?.user?.avatar || avatar,
            },
            position: e?.application?.job?.title || "Not Specified",
            appliedDate: e?.application?.updated_at
              ? moment(e.application.updated_at).format("MMM DD, YYYY")
              : "N/A",
            status: e?.application?.status?.toLowerCase() || "unknown",
          }));

        setRecentApplications(recentApplications);

        const jobsData = response.data;
        // setjobs(jobsData);

        const activeJobs = jobsData.filter((e: any) => e.status === "active");

        const updatedStats = stats.map((e) =>
          e.label === "Active Jobs"
            ? { ...e, value: activeJobs.length }
            : e.label === "Total Candidates"
            ? { ...e, value: candidate.data.length }
            : {
                ...e,
                value: candidate.data.filter(
                  (e: any) => e.application.status === "shortlisted"
                ).length,
              }
        );

        setStats(updatedStats);
      } catch (e) {
        console.error("Error fetching dashboard data:", e);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  // useEffect(() => {
  //   console.log(loading);
  // }, [loading]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          onClick={() => {
            if (!isPostJobEnabled) {
              toast.error(
                "Fill in Company details in the Settings page to post a job"
              );
            } else {
              navigate("/post-job");
            }
          }}
          className={`${
            !isPostJobEnabled
              ? "cursor-not-allowed opacity-50 bg-gray-300 "
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {" "}
          <PlusCircle className="mr-2 h-4 w-4" />
          Post a Job
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
          <CardContent>
            <Spinner />
          </CardContent>
        ) : recentApplications.length === 0 ? (
          <CardContent>
            <p className="text-gray-500 text-center py-4">
              No applications found. Post a job to start receiving applications!
            </p>
          </CardContent>
        ) : (
          <CardContent>
            <div className="space-y-4 flex flex-col items-start">
              {recentApplications.map((application: any) => (
                <div
                  key={application.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 space-y-4 sm:space-y-0 w-full max-w-md sm:max-w-xl lg:max-w-2xl"
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
                      onClick={() => {
                        if (!application.job_id)
                          return toast.error(
                            "Oops issues in our server. Please contact the developers"
                          );
                        navigate(
                          `/candidates/${application.job_id}?candidate=${application.id}`
                        );
                      }}
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
