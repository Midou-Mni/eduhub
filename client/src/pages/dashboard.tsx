import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentCourses from "@/components/dashboard/recent-courses";
import StudentActivity from "@/components/dashboard/student-activity";
import CourseTable from "@/components/courses/course-table";
import type { CourseWithDetails, ActivityWithDetails } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    avgRating: number;
  }>({
    queryKey: ["/api/analytics/stats"],
    enabled: isAuthenticated,
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses"],
    enabled: isAuthenticated,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<ActivityWithDetails[]>({
    queryKey: ["/api/activity"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Header
        title="Dashboard"
        description="Manage your courses and track student progress"
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} isLoading={statsLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RecentCourses courses={courses?.slice(0, 3)} isLoading={coursesLoading} />
        <StudentActivity activities={activities} isLoading={activitiesLoading} />
      </div>

      {/* Course Management Section */}
      <CourseTable courses={courses} isLoading={coursesLoading} />
    </div>
  );
}
