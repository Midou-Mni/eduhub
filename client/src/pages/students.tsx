import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Clock, Users } from "lucide-react";
import type { EnrollmentWithDetails } from "@shared/schema";

export default function Students() {
  const { toast } = useToast();

  const { data: enrollments, isLoading, error } = useQuery<EnrollmentWithDetails[]>({
    queryKey: ["/api/enrollments"],
  });

  // Handle errors
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

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (progress: number) => {
    if (progress === 100) return "bg-success text-success";
    if (progress > 50) return "bg-warning text-warning";
    return "bg-primary text-primary";
  };

  const getStatusText = (progress: number) => {
    if (progress === 100) return "Completed";
    if (progress > 0) return "In Progress";
    return "Not Started";
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <Header title="Students" description="Track student enrollment and progress" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-neutral-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="p-8">
        <Header title="Students" description="Track student enrollment and progress" />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-700 mb-2">No students yet</h3>
              <p className="text-neutral-500">
                When students enroll in your courses, you'll see their progress here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Header title="Students" description="Track student enrollment and progress" />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter(e => e.progress === 100).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            View and track progress of all students across your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={enrollment.student.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {getInitials(enrollment.student.firstName, enrollment.student.lastName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {enrollment.student.firstName} {enrollment.student.lastName}
                    </p>
                    <Badge variant="outline" className={`${getStatusColor(enrollment.progress)}/10`}>
                      {getStatusText(enrollment.progress)}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-500 truncate">
                    {enrollment.student.email}
                  </p>
                  <p className="text-sm text-neutral-500">
                    <span className="font-medium">{enrollment.course.title}</span>
                    {" • "}
                    Enrolled {formatDate(enrollment.enrolledAt)}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      {enrollment.progress}% Complete
                    </p>
                    <div className="w-24">
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                  </div>

                  {enrollment.rating && (
                    <div className="flex items-center space-x-1 text-warning">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{enrollment.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
