import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, BarChart3, Trash2, Star, BookOpen } from "lucide-react";
import type { CourseWithDetails } from "@shared/schema";

interface CourseTableProps {
  courses?: CourseWithDetails[];
  isLoading: boolean;
  showActions?: boolean;
}

export default function CourseTable({ courses, isLoading, showActions = true }: CourseTableProps) {
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setCourseToDelete(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredCourses) {
      setSelectedCourses(new Set(filteredCourses.map(course => course.id)));
    } else {
      setSelectedCourses(new Set());
    }
  };

  const handleSelectCourse = (courseId: string, checked: boolean) => {
    const newSelected = new Set(selectedCourses);
    if (checked) {
      newSelected.add(courseId);
    } else {
      newSelected.delete(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const filteredCourses = courses?.filter(course => 
    filterStatus === "all" || course.status === filterStatus
  );

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <CardHeader className="border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-neutral-700">Course Management</CardTitle>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left p-4"><Skeleton className="h-4 w-4" /></th>
                  <th className="text-left p-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="text-left p-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="text-left p-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="text-left p-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="text-left p-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="text-left p-4"><Skeleton className="h-4 w-16" /></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="p-4"><Skeleton className="h-4 w-4" /></td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-16 rounded" /></td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <CardHeader className="border-b border-neutral-200">
          <CardTitle className="text-lg font-semibold text-neutral-700">Course Management</CardTitle>
          <CardDescription>Create and manage your courses</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 mb-2">No courses created yet</h3>
            <p className="text-neutral-500">
              Create your first course to start teaching and earning.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <CardHeader className="border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-neutral-700">Course Management</CardTitle>
            {showActions && (
              <div className="flex items-center space-x-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {selectedCourses.size > 0 && (
                  <Button variant="outline" size="sm">
                    Bulk Actions ({selectedCourses.size})
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {showActions && (
                    <th className="text-left p-4 text-sm font-medium text-neutral-600">
                      <Checkbox 
                        checked={filteredCourses?.length > 0 && selectedCourses.size === filteredCourses.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                  )}
                  <th className="text-left p-4 text-sm font-medium text-neutral-600">Course</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-600">Students</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-600">Revenue</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-600">Rating</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-600">Status</th>
                  {showActions && (
                    <th className="text-left p-4 text-sm font-medium text-neutral-600">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredCourses?.map((course) => (
                  <tr key={course.id} className="hover:bg-neutral-50 transition-colors">
                    {showActions && (
                      <td className="p-4">
                        <Checkbox 
                          checked={selectedCourses.has(course.id)}
                          onCheckedChange={(checked) => handleSelectCourse(course.id, !!checked)}
                        />
                      </td>
                    )}
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt={`${course.title} thumbnail`}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="text-primary" size={16} />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-neutral-700">{course.title}</p>
                          <p className="text-sm text-neutral-400">{course.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-neutral-700">{course.enrollmentCount}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-neutral-700">
                        {formatCurrency(course.revenue)}
                      </span>
                    </td>
                    <td className="p-4">
                      {course.avgRating ? (
                        <div className="flex items-center space-x-1">
                          <Star className="text-warning" size={16} fill="currentColor" />
                          <span className="text-sm font-medium text-neutral-700">
                            {course.avgRating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">No ratings</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={getStatusColor(course.status)}>
                        {course.status}
                      </Badge>
                    </td>
                    {showActions && (
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-400 hover:text-primary"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-400 hover:text-primary"
                          >
                            <BarChart3 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-400 hover:text-error"
                            onClick={() => setCourseToDelete(course.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
              All course materials and student enrollments will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => courseToDelete && deleteMutation.mutate(courseToDelete)}
              className="bg-error hover:bg-error/90"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
