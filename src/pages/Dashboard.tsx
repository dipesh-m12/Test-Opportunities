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

export const Dashboard = () => {
  const navigate = useNavigate();
  const stats = [
    {
      label: "Active Jobs",
      value: 12,
      icon: Briefcase,
      route: "/manage-jobs",
      filter: "active",
    },
    {
      label: "Total Candidates",
      value: 48,
      icon: Users,
      route: "/manage-jobs",
      filter: "all",
    },
    {
      label: "Shortlisted",
      value: 16,
      icon: Award,
      route: "/manage-jobs",
      filter: "shortlisted",
    },
  ];

  const recentApplications = [
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button onClick={() => navigate("/post-job")}>
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
              onClick={() => navigate(stat.route, { state: stat.filter })}
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
                    {stat.value}
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
      </Card>
    </div>
  );
};
