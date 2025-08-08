import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Play, 
  Clock, 
  CheckCircle, 
  Star,
  Calendar,
  User
} from "lucide-react";
import type { CourseWithDetails } from "@shared/schema";

export default function StudentEnrollments() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: enrolledCourses, isLoading, error } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/student/enrolled-courses"],
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

  const formatProgress = (progress: number) => {
    return Math.round(progress);
  };

  const getStatusText = (progress: number) => {
    if (progress === 100) return "Completed";
    if (progress > 0) return "In Progress";
    return "Not Started";
  };

  const getStatusColor = (progress: number) => {
    if (progress === 100) return "bg-success text-success";
    if (progress > 50) return "bg-warning text-warning";
    return "bg-primary text-primary";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-neutral-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900">My Courses</h1>
          <p className="text-neutral-600">
            Continue your learning journey and track your progress
          </p>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Stats Summary */}
        {enrolledCourses && enrolledCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrolledCourses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enrolledCourses.filter(c => c.userProgress === 100).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enrolledCourses.filter(c => (c.userProgress || 0) > 0 && (c.userProgress || 0) < 100).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(enrolledCourses.reduce((acc, c) => acc + (c.userProgress || 0), 0) / enrolledCourses.length)}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Courses Grid */}
        {enrolledCourses && enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="h-full hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-neutral-200 rounded-t-lg overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-neutral-400" />
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className={`${getStatusColor(course.userProgress || 0)}/10`}>
                      {getStatusText(course.userProgress || 0)}
                    </Badge>
                    <Badge variant="secondary">{course.difficultyLevel}</Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center space-x-2 mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={course.teacher.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {course.teacher.firstName?.charAt(0)}{course.teacher.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-neutral-600">
                      {course.teacher.firstName} {course.teacher.lastName}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-neutral-500">
                        {formatProgress(course.userProgress || 0)}%
                      </span>
                    </div>
                    <Progress value={course.userProgress || 0} className="h-2" />
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.materials.length} lessons</span>
                    </div>
                    {course.avgRating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-warning fill-current" />
                        <span>{course.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Link href={`/learn/${course.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        {course.userProgress === 0 ? 'Start' : 'Continue'}
                      </Button>
                    </Link>
                    <Link href={`/course/${course.id}`}>
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                <h3 className="text-xl font-medium text-neutral-700 mb-2">No enrolled courses</h3>
                <p className="text-neutral-500 mb-6">
                  Start your learning journey by enrolling in courses that interest you.
                </p>
                <Link href="/browse">
                  <Button>
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}