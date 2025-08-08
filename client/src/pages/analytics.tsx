import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star,
  BookOpen,
  Calendar,
  Eye
} from "lucide-react";
import type { CourseWithDetails, EnrollmentWithDetails } from "@shared/schema";

export default function Analytics() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<{
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    avgRating: number;
  }>({
    queryKey: ["/api/analytics/stats"],
  });

  const { data: courses, isLoading: coursesLoading, error: coursesError } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments, error: enrollmentsError } = useQuery<EnrollmentWithDetails[]>({
    queryKey: ["/api/enrollments"],
  });

  // Handle errors
  const handleError = (error: unknown) => {
    if (error instanceof Error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  };

  if (statsError) handleError(statsError);
  if (coursesError) handleError(coursesError);
  if (enrollmentsError) handleError(enrollmentsError);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return "text-success";
    if (rating >= 4.0) return "text-warning";
    return "text-error";
  };

  if (statsLoading || coursesLoading) {
    return (
      <div className="p-8">
        <Header title="Analytics" description="Insights into your teaching performance" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-neutral-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Header 
        title="Analytics" 
        description="Insights into your teaching performance and growth"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
               {typeof stats?.avgRating === "number" ? stats.avgRating.toFixed(1) : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">
              +0.2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>
              Revenue and enrollment data for your top courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map((course) => (
                    <div key={course.id} className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {course.title}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {course.enrollmentCount} students • {formatCurrency(course.revenue)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {course.avgRating && (
                          <div className={`flex items-center space-x-1 ${getPerformanceColor(course.avgRating)}`}>
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">
                              {course.avgRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                          {course.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
                <p className="text-neutral-500">No courses created yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
            <CardDescription>
              Completion rates and progress tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments && enrollments.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Course Completion Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((enrollments.filter(e => e.progress === 100).length / enrollments.length) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(enrollments.filter(e => e.progress === 100).length / enrollments.length) * 100} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Average Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)}%
                    </span>
                  </div>
                  <Progress 
                    value={enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length} 
                    className="h-2"
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Engagement Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Students</span>
                      <span className="font-medium">
                        {enrollments.filter(e => e.progress > 0 && e.progress < 100).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completed Courses</span>
                      <span className="font-medium">
                        {enrollments.filter(e => e.progress === 100).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Not Started</span>
                      <span className="font-medium">
                        {enrollments.filter(e => e.progress === 0).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
                <p className="text-neutral-500">No student enrollments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
          <CardDescription>
            Key metrics and recommendations for growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <TrendingUp className="mx-auto h-8 w-8 text-success mb-2" />
              <p className="text-sm font-medium text-success">Growing Audience</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your student base is expanding steadily
              </p>
            </div>

            <div className="text-center p-4 bg-warning/5 rounded-lg">
              <BarChart3 className="mx-auto h-8 w-8 text-warning mb-2" />
              <p className="text-sm font-medium text-warning">High Engagement</p>
              <p className="text-xs text-muted-foreground mt-1">
                Students are actively completing your courses
              </p>
            </div>

            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Star className="mx-auto h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium text-primary">Excellent Ratings</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your courses maintain high quality ratings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
