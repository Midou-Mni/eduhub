import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  BookOpen, 
  Users, 
  Star, 
  Clock, 
  CheckCircle,
  ArrowLeft,
  CreditCard,
  FileText,
  Video
} from "lucide-react";
import type { CourseWithDetails, EnrollmentWithDetails } from "@shared/schema";

export default function CourseDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const { data: course, isLoading } = useQuery<CourseWithDetails>({
    queryKey: ["/api/student/course", id],
    enabled: !!id,
  });

  const { data: reviews } = useQuery<EnrollmentWithDetails[]>({
    queryKey: ["/api/course", id, "reviews"],
    enabled: !!id,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      setIsEnrolling(true);
      // Simulate payment first
      await apiRequest("POST", "/api/student/simulate-payment", {
        courseId: id,
        amount: parseFloat(course?.price || "0"),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've successfully enrolled in this course!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/course", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/enrolled-courses"] });
      setIsEnrolling(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsEnrolling(false);
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    enrollMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-64 bg-neutral-200 rounded"></div>
            <div className="h-32 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Course not found</h2>
          <p className="text-neutral-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/browse">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/browse">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{course.difficultyLevel}</Badge>
                      {course.category && (
                        <Badge variant="secondary">{course.category.name}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                    <CardDescription className="text-base">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center space-x-6 pt-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={course.teacher.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {course.teacher.firstName?.charAt(0)}{course.teacher.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {course.teacher.firstName} {course.teacher.lastName}
                      </p>
                      <p className="text-sm text-neutral-500">Instructor</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-neutral-600">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-warning fill-current" />
                      <span>{course.avgRating?.toFixed(1) || 'New'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrollmentCount} students</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.materials.length} lessons</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {course.materials.length} lessons in this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.materials.map((material, index) => (
                    <div
                      key={material.id}
                      className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {getFileTypeIcon(material.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{material.title}</p>
                        <p className="text-xs text-neutral-500">
                          {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                        </p>
                      </div>
                      <div className="text-sm text-neutral-500">
                        Lesson {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                  <CardDescription>
                    What students are saying about this course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b border-neutral-200 pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.student.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {review.student.firstName?.charAt(0)}{review.student.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium text-sm">
                                {review.student.firstName} {review.student.lastName}
                              </p>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < (review.rating || 0) 
                                        ? 'text-warning fill-current' 
                                        : 'text-neutral-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.review && (
                              <p className="text-sm text-neutral-600">{review.review}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <div className="text-center">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-neutral-200 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen className="h-12 w-12 text-neutral-400" />
                    </div>
                  )}
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatPrice(course.price)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {course.isEnrolled ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-success">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Enrolled</span>
                    </div>
                    {course.userProgress !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-neutral-500">
                            {Math.round(course.userProgress)}%
                          </span>
                        </div>
                        <Progress value={course.userProgress} className="h-2" />
                      </div>
                    )}
                    <Link href={`/learn/${course.id}`}>
                      <Button className="w-full" size="lg">
                        <Play className="mr-2 h-4 w-4" />
                        Continue Learning
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {isEnrolling ? 'Processing...' : 'Enroll Now'}
                    </Button>
                    
                    <div className="space-y-2 text-sm text-neutral-600">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Full lifetime access</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>30-day money-back guarantee</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>

                    {!isAuthenticated && (
                      <p className="text-xs text-neutral-500 text-center">
                        Please sign in to enroll in this course
                      </p>
                    )}
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