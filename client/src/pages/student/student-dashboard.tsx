import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Clock, 
  Play, 
  TrendingUp, 
  Search,
  Star,
  ChevronRight
} from "lucide-react";
import type { CourseWithDetails, User } from "@shared/schema";

// Student Navigation
function StudentNav() {
  const { user } = useAuth();
  
  const getInitials = () => {
    const userData = user as User;
    return `${userData?.firstName?.charAt(0) || ''}${userData?.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={16} />
              </div>
              <span className="font-bold text-lg">EduPlatform</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-neutral-700 hover:text-primary">Dashboard</Link>
            <Link href="/browse" className="text-neutral-700 hover:text-primary">Browse</Link>
            <Link href="/my-courses" className="text-neutral-700 hover:text-primary">My Courses</Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/profile">
            <div className="flex items-center space-x-2 hover:bg-neutral-50 rounded-lg p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={(user as User)?.profileImageUrl || undefined} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{(user as User)?.firstName}</span>
            </div>
          </Link>
          <Button variant="ghost" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>
    </nav>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: enrolledCourses, isLoading: enrolledLoading, error: enrolledError } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/student/enrolled-courses"],
  });

  const { data: recommendedCourses, isLoading: recommendedLoading, error: recommendedError } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/student/recommended-courses"],
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

  if (enrolledError) handleError(enrolledError);
  if (recommendedError) handleError(recommendedError);

  const formatProgress = (progress: number) => {
    return Math.round(progress);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <StudentNav />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back, {(user as User)?.firstName}!
          </h1>
          <p className="text-neutral-600">
            Continue your learning journey and explore new courses
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {enrolledCourses?.length || 0}
                  </p>
                  <p className="text-sm text-neutral-600">Enrolled Courses</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {enrolledCourses?.filter(c => c.userProgress === 100).length || 0}
                  </p>
                  <p className="text-sm text-neutral-600">Completed</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {enrolledCourses?.reduce((acc, c) => acc + (c.userProgress || 0), 0) || 0}%
                  </p>
                  <p className="text-sm text-neutral-600">Avg. Progress</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Continue Learning</CardTitle>
                  <Link href="/my-courses">
                    <Button variant="ghost" size="sm">
                      View All <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {enrolledLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-neutral-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : enrolledCourses && enrolledCourses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledCourses.slice(0, 3).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-16 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-neutral-200 rounded flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-neutral-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-neutral-900 truncate">
                            {course.title}
                          </h3>
                          <p className="text-sm text-neutral-500 mb-2">
                            {course.teacher.firstName} {course.teacher.lastName}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Progress value={course.userProgress || 0} className="flex-1 h-2" />
                            <span className="text-sm text-neutral-500">
                              {formatProgress(course.userProgress || 0)}%
                            </span>
                          </div>
                        </div>

                        <Link href={`/learn/${course.id}`}>
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">No enrolled courses</h3>
                    <p className="text-neutral-500 mb-4">
                      Start learning by browsing our course catalog
                    </p>
                    <Link href="/browse">
                      <Button>
                        <Search className="mr-2 h-4 w-4" />
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommended Courses */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>
                  Courses picked based on your interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendedLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-neutral-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : recommendedCourses && recommendedCourses.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedCourses.slice(0, 3).map((course) => (
                      <Link key={course.id} href={`/course/${course.id}`}>
                        <div className="p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                          <h4 className="text-sm font-medium text-neutral-900 mb-1 truncate">
                            {course.title}
                          </h4>
                          <p className="text-xs text-neutral-500 mb-2">
                            {course.teacher.firstName} {course.teacher.lastName}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-warning fill-current" />
                              <span className="text-xs text-neutral-600">
                                {course.avgRating?.toFixed(1) || 'New'}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              ${course.price}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
                    <p className="text-sm text-neutral-500">
                      No recommendations yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}