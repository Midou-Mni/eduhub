import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, BookOpen } from "lucide-react";
import { Link } from "wouter";
import type { CourseWithDetails } from "@shared/schema";

interface RecentCoursesProps {
  courses?: CourseWithDetails[];
  isLoading: boolean;
}

export default function RecentCourses({ courses, isLoading }: RecentCoursesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success/10 text-success';
      case 'draft':
        return 'bg-warning/10 text-warning';
      case 'archived':
        return 'bg-neutral-100 text-neutral-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <CardHeader className="border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-neutral-700">Recent Courses</CardTitle>
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <CardHeader className="border-b border-neutral-200">
          <CardTitle className="text-lg font-semibold text-neutral-700">Recent Courses</CardTitle>
          <CardDescription>Your latest courses will appear here</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 mb-2">No courses yet</h3>
            <p className="text-neutral-500">
              Create your first course to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
      <CardHeader className="border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-700">Recent Courses</CardTitle>
          <Link href="/courses">
            <a className="text-primary hover:text-primary-dark text-sm font-medium">
              View All
            </a>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={`${course.title} thumbnail`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-primary" size={24} />
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="font-medium text-neutral-700">{course.title}</h3>
                <p className="text-sm text-neutral-400">
                  {course.enrollmentCount} students enrolled
                </p>
                {course.avgRating && (
                  <div className="flex items-center mt-1">
                    <div className="flex text-warning text-sm">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < Math.floor(course.avgRating!) ? "fill-current" : ""}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-neutral-400 ml-2">
                      {course.avgRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-lg font-semibold text-neutral-700">
                  {formatCurrency(course.price)}
                </p>
                <Badge variant="outline" className={getStatusColor(course.status ?? "")}>
                  {course.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
